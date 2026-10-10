#!/usr/bin/env node
'use strict';

/**
 * Auditor conservador de referências locais estáticas para o Delta Prompts.
 * Uso: node .github/scripts/auditar-caminhos-repositorio.js
 * Não altera arquivos; apenas informa referências cujo destino não existe.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build']);
const SOURCE_EXTENSIONS = new Set(['.html', '.htm', '.css']);
const ATTR_RE = /\b(?:href|src|action|poster|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>\x60]+))/gi;
const CSS_URL_RE = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]+))\s*\)/gi;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function cleanReference(raw) {
  let value = String(raw || '').trim();
  if (!value || value.startsWith('#') || value.startsWith('//')) return null;
  if (/^(?:[a-z][a-z0-9+.-]*:)/i.test(value)) return null;
  value = value.split('#')[0].split('?')[0].trim();
  if (!value || value.includes('{{') || value.includes('${')) return null;
  return value;
}

function resolveLocal(sourceFile, raw) {
  let value = cleanReference(raw);
  if (value === null) return null;
  try { value = decodeURIComponent(value); } catch {}
  const base = '/delta-prompts/';
  if (value === '/delta-prompts' || value === base) value = 'index.html';
  else if (value.startsWith(base)) value = value.slice(base.length);
  else if (value.startsWith('/')) value = value.slice(1);
  else value = path.join(path.relative(ROOT, path.dirname(sourceFile)), value);

  const candidate = path.resolve(ROOT, value);
  if (candidate !== ROOT && !candidate.startsWith(ROOT + path.sep)) return null;
  if (fs.existsSync(candidate)) {
    const stat = fs.statSync(candidate);
    if (stat.isFile()) return null;
    if (stat.isDirectory() && fs.existsSync(path.join(candidate, 'index.html'))) return null;
  }
  return path.relative(ROOT, candidate).split(path.sep).join('/');
}

const missing = [];
const files = walk(ROOT);
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file).toLowerCase();
  const refs = [];
  const regex = ext === '.css' ? CSS_URL_RE : ATTR_RE;
  for (const match of text.matchAll(regex)) {
    refs.push(match[1] ?? match[2] ?? match[3] ?? '');
  }
  for (const raw of refs) {
    const target = resolveLocal(file, raw);
    if (target !== null) {
      missing.push({ source: path.relative(ROOT, file).split(path.sep).join('/'), raw, target });
    }
  }
}

if (missing.length) {
  console.error('Referências locais com destino não encontrado:');
  for (const item of missing) {
    console.error(`- ${item.source}: "${item.raw}" -> ${item.target}`);
  }
  console.error(`\nTotal: ${missing.length} referência(s). Revise cada ocorrência manualmente.`);
  process.exitCode = 1;
} else {
  console.log(`Auditoria concluída: ${files.length} arquivos HTML/CSS analisados; nenhuma referência local estática ausente foi encontrada.`);
}
