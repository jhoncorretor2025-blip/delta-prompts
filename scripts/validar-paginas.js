#!/usr/bin/env node
/*
 * VERIFICADOR DE PÁGINAS DO DELTA PROMPTS
 * ----------------------------------------------------------------------------
 * Roda sem instalar nada (só precisa do Node 18+):
 *
 *     node scripts/validar-paginas.js                      -> confere tudo
 *     node scripts/validar-paginas.js --atualizar-baseline -> grava a lista atual de prompts
 *
 * O que ele confere:
 *   1) SINTAXE: todo <script> inline de cada página HTML precisa ser JavaScript válido.
 *      (Um erro em UM prompt derruba o script inteiro: nenhum botão funciona e nenhum
 *      prompt aparece. Foi isso que aconteceu várias vezes.)
 *   2) PROMPTS: nenhum prompt que já existia pode sumir. A lista de títulos fica em
 *      docs/governanca/baseline-prompts.json. Prompts NOVOS são permitidos.
 *
 * Se um prompt foi removido DE PROPÓSITO: coloque [prompts-removidos-ok] na mensagem
 * do commit e depois rode --atualizar-baseline.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const BASELINE = path.join(RAIZ, 'docs', 'governanca', 'baseline-prompts.json');
const ARGS = process.argv.slice(2);
const ATUALIZAR = ARGS.includes('--atualizar-baseline');
const NO_ACTIONS = !!process.env.GITHUB_ACTIONS;

// ---------- utilitários de leitura "consciente de aspas" ----------
function lerString(s, i) {                       // s[i] é ' " ou `. Devolve {valor, fim}
  const q = s[i];
  if (q === '`') { const fim = pularTemplate(s, i); return { valor: s.slice(i + 1, fim), fim }; }
  let j = i + 1, valor = '';
  while (j < s.length) {
    const c = s[j];
    if (c === '\\') { valor += s.slice(j, j + 2); j += 2; continue; }
    if (c === q) return { valor, fim: j };
    valor += c; j++;
  }
  return { valor, fim: s.length - 1 };
}
function pularTemplate(s, i) {                   // s[i] = '`'. Devolve índice da crase final
  let j = i + 1;
  while (j < s.length) {
    const c = s[j];
    if (c === '\\') { j += 2; continue; }
    if (c === '`') return j;
    if (c === '$' && s[j + 1] === '{') { const f = casar(s, j + 1); if (f < 0) return s.length - 1; j = f + 1; continue; }
    j++;
  }
  return s.length - 1;
}
function casar(s, ini) {                         // s[ini] abre ( [ {. Devolve índice de quem fecha
  const par = { '[': ']', '{': '}', '(': ')' };
  const pilha = [];
  for (let i = ini; i < s.length; i++) {
    const c = s[i];
    if (c === "'" || c === '"') { i = lerString(s, i).fim; continue; }
    if (c === '`') { i = pularTemplate(s, i); continue; }
    if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; continue; }
    if (c === '/' && s[i + 1] === '*') { const f = s.indexOf('*/', i + 2); i = f < 0 ? s.length : f + 1; continue; }
    if (par[c]) pilha.push(par[c]);
    else if (c === ']' || c === '}' || c === ')') { if (pilha.pop() !== c) return -1; if (!pilha.length) return i; }
  }
  return -1;
}
function dividirItens(corpo) {                   // divide o conteúdo do array nas vírgulas do nível 0
  const itens = []; let ini = 0, prof = 0;
  for (let i = 0; i < corpo.length; i++) {
    const c = corpo[i];
    if (c === "'" || c === '"') { i = lerString(corpo, i).fim; continue; }
    if (c === '`') { i = pularTemplate(corpo, i); continue; }
    if (c === '/' && corpo[i + 1] === '/') { while (i < corpo.length && corpo[i] !== '\n') i++; continue; }
    if (c === '/' && corpo[i + 1] === '*') { const f = corpo.indexOf('*/', i + 2); i = f < 0 ? corpo.length : f + 1; continue; }
    if (c === '[' || c === '{' || c === '(') prof++;
    else if (c === ']' || c === '}' || c === ')') prof--;
    else if (c === ',' && prof === 0) { itens.push(corpo.slice(ini, i)); ini = i + 1; }
  }
  itens.push(corpo.slice(ini));
  return itens.map(x => x.trim()).filter(x => x.length && x !== 'null');
}
function lerArgsTexto(item, pos, qtd) {            // lê até `qtd` textos seguidos ('..' ".." ou `..`)
  const args = [];
  for (let n = 0; n < qtd && pos < item.length; n++) {
    while (/\s/.test(item[pos] || '')) pos++;
    if (!/['"`]/.test(item[pos] || '')) break;
    const r = lerString(item, pos); args.push(r.valor); pos = r.fim + 1;
    while (/\s/.test(item[pos] || '')) pos++;
    if (item[pos] === ',') pos++;
  }
  return args;
}
// Em qual posição fica o título nos formatos de "função auxiliar" usados nas páginas:
const POSICAO_TITULO_EM_CHAMADAS = { sitePrompt: 2, D: 3 };   // sitePrompt(fase,cat,TITULO,..) | D(fase,cat,nivel,TITULO,..)
function tituloDoItem(item, codigo) {
  let m = /^([A-Za-z_$][\w$]*)\s*\(/.exec(item);        // chamada: sitePrompt(...), D(...)
  if (m && POSICAO_TITULO_EM_CHAMADAS[m[1]] !== undefined) {
    const pos = POSICAO_TITULO_EM_CHAMADAS[m[1]];
    const args = lerArgsTexto(item, m[0].length, pos + 1);
    if (args[pos]) return norm(args[pos]);
  }
  if (item[0] === '[') {                                 // lista: ['nivel','Categoria','TITULO',...]
    const args = lerArgsTexto(item, 1, 3);
    if (args[2]) return norm(args[2]);
  }
  m = /["']?\btitulo["']?\s*:\s*(['"`])/.exec(item);   // objeto: {titulo:'...'} ou {"titulo":"..."}
  if (m) return norm(lerString(item, m.index + m[0].length - 1).valor);
  m = /(?:^|[,{\s])t\s*:\s*(['"`])/.exec(item);        // Padrão B (marketing-texto.html)
  if (m) return norm(lerString(item, m.index + m[0].length - 1).valor);
  if (/^[A-Za-z_$][\w$]*$/.test(item) && codigo) {      // só o nome de uma variável: procura onde ela foi declarada
    const d = new RegExp('(?:const|let|var)\\s+' + item.replace(/\$/g, '\\$') + '\\s*=\\s*\\{').exec(codigo);
    if (d) {
      const abre = d.index + d[0].length - 1, fecha = casar(codigo, abre);
      if (fecha > 0) { const t = tituloDoItem(codigo.slice(abre, fecha + 1), null); if (!t.startsWith('ident:')) return t; }
    }
  }
  return 'ident:' + item.slice(0, 40).replace(/\s+/g, ' ');
}
function norm(t) { return t.replace(/\\'/g, "'").replace(/\s+/g, ' ').trim(); }

// ---------- leitura das páginas ----------
function listarHtml() {
  const pastas = ['', 'paginas', 'ferramentas'], achados = [];
  for (const p of pastas) {
    const dir = path.join(RAIZ, p);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.html')) achados.push(path.posix.join(p, f));
  }
  return achados.sort();
}
function scriptsInline(html) {
  const lista = []; const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']?(?:application\/(?:ld\+)?json|module|importmap|text\/template)/i.test(attrs)) continue;
    const linha = html.slice(0, m.index).split('\n').length;
    lista.push({ codigo: m[2], linha });
  }
  return lista;
}
function checarSintaxe(codigo) {
  try { new vm.Script(codigo); return null; }
  catch (e) {
    const mm = /:(\d+)\n/.exec(e.stack || '');
    return { msg: e.message, linha: mm ? Number(mm[1]) : null };
  }
}
function dadosDaPagina(scripts) {                 // acha dadosBrutos e devolve {total, titulos}
  for (const s of scripts) {
    const m = /(?:const|let|var)\s+dadosBrutos\s*=\s*\[/.exec(s.codigo);
    if (!m) continue;
    const abre = m.index + m[0].length - 1;
    const fecha = casar(s.codigo, abre);
    if (fecha < 0) return { erro: 'lista dadosBrutos sem fechamento' };
    const itens = dividirItens(s.codigo.slice(abre + 1, fecha));
    return { total: itens.length, titulos: itens.map(it => tituloDoItem(it, s.codigo)) };
  }
  return null;
}

// ---------- execução ----------
const erros = [], avisos = [], infos = [];
const falha = (arq, linha, msg) => { erros.push({ arq, linha, msg }); if (NO_ACTIONS) console.log(`::error file=${arq}${linha ? ',line=' + linha : ''}::${msg}`); };

let msgCommit = '';
try { msgCommit = cp.execSync('git log -1 --format=%B', { cwd: RAIZ, stdio: ['ignore', 'pipe', 'ignore'] }).toString(); } catch (_) {}
const REMOCAO_OK = /\[prompts-removidos-ok\]/i.test(msgCommit);

const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null;
const atual = {};
const paginas = listarHtml();

for (const arq of paginas) {
  const html = fs.readFileSync(path.join(RAIZ, arq), 'utf8');
  const scripts = scriptsInline(html);
  let sintaxeOk = true;
  scripts.forEach((s, i) => {
    const e = checarSintaxe(s.codigo);
    if (!e) return;
    sintaxeOk = false;
    const linhaPagina = e.linha ? s.linha + e.linha - 1 : s.linha;
    let dica = '';
    if (/Invalid or unexpected token|Unexpected identifier|missing \) after argument/i.test(e.msg))
      dica = ' | Dica: provável quebra de linha dentro de aspas simples/duplas (use \\n) ou aspas não fechada/apóstrofo sem \\\' no texto de um prompt.';
    if (/Unexpected token/i.test(e.msg) && !dica)
      dica = ' | Dica: confira vírgulas entre os itens da lista (falta uma vírgula ou há vírgula dobrada).';
    falha(arq, linhaPagina, `JavaScript inválido (script #${i + 1}): ${e.msg}${dica} — a página inteira para de funcionar.`);
  });
  if (!sintaxeOk) continue;                       // sem sintaxe válida a contagem não é confiável
  const dados = dadosDaPagina(scripts);
  if (!dados) continue;
  if (dados.erro) { falha(arq, null, dados.erro); continue; }
  atual[arq] = dados;
  const repetidos = dados.titulos.filter((t, i) => dados.titulos.indexOf(t) !== i);
  if (repetidos.length) avisos.push(`${arq}: título(s) repetido(s): ${[...new Set(repetidos)].join(' | ')}`);
}

if (ATUALIZAR) {
  if (erros.length) { console.log('✖ Não atualizei o baseline porque há páginas com erro (veja abaixo).'); }
  else {
    const saida = {
      _comentario: 'Lista de prompts de cada página. Gerado por: node scripts/validar-paginas.js --atualizar-baseline. Prompts que estão aqui NÃO podem sumir sem aviso.',
      gerado_em: new Date().toISOString().slice(0, 10),
      paginas: Object.fromEntries(Object.entries(atual).map(([k, v]) => [k, { total: v.total, titulos: v.titulos }])),
    };
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify(saida, null, 2) + '\n');
    console.log(`✔ Baseline gravado: ${Object.keys(saida.paginas).length} páginas, ${Object.values(saida.paginas).reduce((a, p) => a + p.total, 0)} prompts.`);
  }
} else if (baseline) {
  for (const [arq, ref] of Object.entries(baseline.paginas || {})) {
    const cur = atual[arq];
    if (!cur) { if (!erros.some(e => e.arq === arq)) falha(arq, null, `A página (ou a lista de prompts dela) não foi encontrada, mas estava no baseline com ${ref.total} prompts.`); continue; }
    const faltando = ref.titulos.filter(t => !cur.titulos.includes(t));
    if (faltando.length || cur.total < ref.total) {
      const msg = `Sumiram prompts: eram ${ref.total}, agora são ${cur.total}.` + (faltando.length ? ` Faltando: ${faltando.map(t => '"' + t + '"').join(', ')}.` : '');
      if (REMOCAO_OK) avisos.push(`${arq}: ${msg} (liberado por [prompts-removidos-ok] — rode --atualizar-baseline)`);
      else falha(arq, null, msg + ' Se foi de propósito, use [prompts-removidos-ok] na mensagem do commit e rode --atualizar-baseline.');
    }
    const novos = cur.titulos.filter(t => !ref.titulos.includes(t));
    if (novos.length) infos.push(`${arq}: ${novos.length} prompt(s) novo(s) fora do baseline (${novos.slice(0, 3).join(' | ')}${novos.length > 3 ? ' …' : ''}). Rode: node scripts/validar-paginas.js --atualizar-baseline`);
  }
  for (const arq of Object.keys(atual)) if (!baseline.paginas[arq]) infos.push(`${arq}: página com prompts ainda fora do baseline (${atual[arq].total}). Rode --atualizar-baseline.`);
} else {
  infos.push('Ainda não existe baseline de prompts (docs/governanca/baseline-prompts.json). Rode com --atualizar-baseline.');
}

console.log(`\nPáginas HTML conferidas: ${paginas.length} | páginas com lista de prompts: ${Object.keys(atual).length} | prompts contados: ${Object.values(atual).reduce((a, p) => a + p.total, 0)}`);
avisos.forEach(a => console.log('⚠  ' + a));
infos.forEach(a => console.log('ℹ  ' + a));
if (erros.length) {
  console.log('\n✖ PROBLEMAS ENCONTRADOS:');
  erros.forEach(e => console.log(`  - ${e.arq}${e.linha ? ':' + e.linha : ''} → ${e.msg}`));
  process.exit(1);
}
console.log('\n✔ Tudo certo: scripts válidos e nenhum prompt sumiu.');
