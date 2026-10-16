#!/usr/bin/env node
'use strict';

// Auditoria estática da página inicial do Delta Prompts.
// Não altera arquivos; verifica versão, acessibilidade básica e hierarquia de conversão.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

const version = (html.match(/<meta name="delta-version" content="(V\d+\.\d+)"/) || [])[1];
const checks = [
  ['versão atual declarada', version === 'V1.96'],
  ['versão atual no título', Boolean(version) && html.includes('Delta Prompts - Sua central prática de IA | ' + version)],
  ['versão visível no cabeçalho', Boolean(version) && html.includes('aria-label="Versão atual do site">' + version + '</span>')],
  ['versão visível no rodapé', Boolean(version) && html.includes('class="delta-live-version">' + version + '</span></footer>')],
  ['cache bust do CSS', Boolean(version) && html.includes('href="style.css?v=' + version + '"')],
  ['sem referências principais à versão anterior', !/content="V1\.95"|style\.css\?v=V1\.95|class="delta-live-version">V1\.95/.test(html)],
  ['link para pular ao conteúdo', /class="skip-link" href="#conteudo-principal"/.test(html)],
  ['marco principal da página', /<main id="conteudo-principal">/.test(html)],
  ['busca com nome acessível', /id="busca-global"[^>]*aria-label="Buscar no Delta Prompts"/.test(html)],
  ['status da busca para leitores de tela', /id="searchStatus"[^>]*aria-live="polite"/.test(html)],
  ['atalho de teclado para busca', /e\.key==='\/'/.test(html)],
  ['Escape para fechar sugestões', /e\.key==='Escape'&&sug\.classList\.contains\('active'\)/.test(html)],
  ['foco visível no CSS', /:focus-visible/.test(css)],
  ['movimento reduzido respeitado', /prefers-reduced-motion:\s*reduce/.test(css)],
  ['headline orientada à tarefa', html.includes('Encontre a IA certa <span>para o que você precisa fazer</span>')],
  ['CTA principal aponta para a busca', /class="home-cta-primary" href="#buscar"/.test(html)],
  ['CTA principal precede atalhos de apps', html.indexOf('class="home-cta-priority"') < html.indexOf('class="apps-bar"')],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL') + ' — ' + label);
  if (!ok) failed++;
}
console.log('\nResultado: ' + (checks.length - failed) + '/' + checks.length + ' verificações aprovadas.');
if (failed) process.exitCode = 1;
