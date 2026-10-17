#!/usr/bin/env node
'use strict';

// Auditoria estática da página inicial do Delta Prompts.
// Não altera arquivos; verifica versão, acessibilidade básica e hierarquia de conversão.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const menuLoader = fs.readFileSync(path.join(root, 'menu-loader.js'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const version = (html.match(/<meta name="delta-version" content="(V\d+\.\d+)"/) || [])[1];
const checks = [
  ['versão atual declarada', version === 'V1.99'],
  ['versão atual no título', Boolean(version) && html.includes('Delta Prompts - Sua central prática de IA | ' + version)],
  ['versão visível no cabeçalho', Boolean(version) && html.includes('aria-label="Versão atual do site">' + version + '</span>')],
  ['versão visível no rodapé', Boolean(version) && html.includes('class="delta-live-version">' + version + '</span></footer>')],
  ['cache bust do CSS', Boolean(version) && html.includes('href="style.css?v=' + version + '"')],
  ['versão sincronizada no menu-loader', menuLoader.includes('// DELTA SITE VERSION: ' + version) && menuLoader.includes("window.DELTA_SITE_VERSION='" + version + "';")],
  ['versão sincronizada no service worker', serviceWorker.startsWith('// DELTA SITE VERSION: ' + version)],
  ['cache-busting do menu-loader atualizado', html.includes('menu-loader.js?v=20261016-qa-v84') && serviceWorker.includes('menu-loader.js?v=20261016-qa-v84')],
  ['sem referências principais à versão anterior', !/content="V1\\.97"|style\\.css\\?v=V1\\.97|class="delta-live-version">V1\\.97/.test(html)],
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
  ['continuação recupera e atualiza os dois cards', /document\.getElementById\('continuarCard'\)[\s\S]*document\.getElementById\('descobertaContinuar'\)/.test(html) && /box\.id==='descobertaContinuar'/.test(html)],
  ['grupos de navegação por tarefa', (html.match(/class="home-nav-group"/g) || []).length === 4],
  ['links de favoritos e categorias preservados', html.includes('href="favoritos.html">Meus Favoritos</a>') && html.includes('href="#trabalho">Trabalho e carreira</a')],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL') + ' — ' + label);
  if (!ok) failed++;
}
console.log('\nResultado: ' + (checks.length - failed) + '/' + checks.length + ' verificações aprovadas.');
if (failed) process.exitCode = 1;
