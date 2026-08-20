# 📋 Regras e Convenções do Delta Prompts

> **Para que serve este arquivo:** antes de criar ou editar qualquer página, leia isto primeiro. Existem 2 formatos de dados diferentes no site e uma armadilha de categorias que já causou bugs reais. Ler isso primeiro evita redescobrir (e quebrar) as mesmas coisas de novo.

---

## 🗂️ 1. Formato de dados — existem 2 padrões diferentes

### Padrão A (o normal, usado em 45 das 46 páginas de categoria)
```js
const dadosBrutos=[
  {categoria:'🎯 Nome da Categoria', nivel:'basico', titulo:'📝 Título do Prompt',
   quando:'Explicação de quando usar.', prompt:`Texto do prompt aqui.`,
   en:`English translation here.`}
];
const prompts=dadosBrutos.map((x,i)=>{...});
```
Chaves: `categoria`, `nivel`, `titulo`, `quando`, `prompt`, `en`

### Padrão B (EXCEÇÃO — só em `marketing-texto.html`)
```js
{seg:'🏋️ Segmento', c:'Categoria', n:'nivel', t:'Título',
 q:'Quando usar', p:`Prompt`, en:`Tradução`}
```
Chaves ABREVIADAS: `seg`, `c`, `n`, `t`, `q`, `p`, `en`

**⚠️ Antes de editar qualquer página, rode isto pra saber qual padrão ela usa:**
```bash
grep -c "seg:'" paginas/NOME-DA-PAGINA.html
```
Se retornar > 0, é o Padrão B. Se usar o padrão errado, a página quebra inteira (aconteceu em 16/08/2026).

---

## 🚨 2. A armadilha do `ordemCategorias` (15 páginas afetadas)

Estas páginas têm uma **lista fixa de categorias reconhecidas**. Se você criar um prompt numa categoria que não está nessa lista, **o prompt nunca aparece em lugar nenhum** — nem na lista, nem na busca — mesmo estando salvo corretamente no array de dados. Não dá erro nenhum, ele só some silenciosamente.

Páginas afetadas (confirmado em 18/08/2026):
```
analise.html, carreira.html, codex-chatgpt.html, comunicacao.html,
conectores-ia.html, estudo.html, financas-pessoais.html, imobiliario.html,
marketing-campanha.html, negociacao.html, outros.html, pesquisa-profunda.html,
redes-sociais.html, saude.html, trabalho.html
```

**Antes de adicionar categoria nova nessas páginas:**
```bash
grep -n "ordemCategorias" paginas/NOME-DA-PAGINA.html
```
Se existir, adicione a nova categoria dentro dessa lista também, não só no `dadosBrutos`.

---

## 🔍 3. Índice de busca da home (`search-index.js`)

Toda vez que um prompt novo é criado em **qualquer** página, ele precisa ser adicionado manualmente aqui também — não é automático.

Formato exato:
```js
window.deltaSearchIndex = [..., {"titulo": "📝 Título", "resumo": "Resumo curto.", "pagina": "📁 Nome da Página no Menu", "link": "/delta-prompts/paginas/arquivo.html"}];
```

Checklist depois de editar:
1. `node -e "JSON.parse(...)"` pra confirmar que o JSON continua válido
2. Conferir que o total de prompts bateu com o esperado (contagem antes + quantidade adicionada)
3. Testar a busca de verdade simulando (ver seção 6)

---

## 🧭 4. Editando o `menu.html`

- Sempre conferir `content.count('<div')` vs `content.count('</div>')` depois de qualquer edição
- Contador de cada categoria (`<span class="menu-count">N</span>`) precisa ser atualizado manualmente ao adicionar/remover prompt
- O menu tem itens fixos no rodapé (`.menu-item-final`) — Favoritos, Biblioteca, Configuração, Ajuda, Canivete — que ficam sempre visíveis
- Existe filtro de "seções escondidas" (`deltaCategoriasEscondidas`/`deltaSecoesEscondidas` no `localStorage`) controlado pelo usuário — não mexer nisso ao editar estrutura

---

## 🧪 5. Fluxo de trabalho obrigatório (sempre, sem exceção)

1. `git pull origin main` antes de começar
2. Fazer a mudança com scripts Python usando `assert content.count(old)==1` (nunca editar sem confirmar que o texto é único)
3. Validar sintaxe JS: `node -e "new Function(match[1])"` no bloco de `<script>`
4. Validar balanceamento de divs: `content.count('<div') == content.count('</div>')`
5. **Testar de verdade simulando com jsdom** (copiar pra `/home/claude/sim/`, rodar um teste que renderiza e confirma o comportamento esperado) — nunca assumir que algo funciona só porque a sintaxe está válida
6. Rodar teste de regressão (confirmar que coisas antigas não quebraram)
7. Só depois: `git add`, commit descritivo, `git push`
8. Confirmar deploy via API do GitHub Actions (`workflow_runs`) antes de dizer "publicado" pro usuário

---

## 🧰 6. Canivete Assistente (`canivete.html`) — regras próprias

- É um arquivo único gigante (SPA), diferente do resto do site
- Tem 2 visualizações de despesas renderizadas **simultaneamente** no DOM (Categoria e Lista Completa, uma escondida via CSS) — cuidado ao usar classes identificadoras genéricas, elas batem nas duas visões ao mesmo tempo a menos que sejam explicitamente escopadas por `cls==='list-row'`
- **Nunca chamar `renderFullList()` ou `renderExpenses()` dentro de um evento `oninput`** — eles redesenham a lista inteira via `innerHTML`, destruindo o campo que a pessoa está digitando e causando perda de foco a cada tecla. Redesenho completo só em `onchange` (quando perde o foco) ou em ações discretas (clique de botão)
- Arquivar despesa (botão ×) move pra `d.despesasArquivadas`, não apaga de verdade — qualquer lógica de "restaurar categorias padrão que faltam" precisa checar as duas listas (ativa E arquivada), senão itens arquivados voltam sozinhos
- Versão do app fica em `APP_VERSION='X.X'` — subir a cada publicação
- CSS mobile tem media queries específicas (`@media(max-width:760px)` e `@media(max-width:430px)`) que redefinem o grid da linha de despesa separadamente do desktop — ao adicionar elemento novo na linha, checar as 3 regras (desktop + as 2 mobile), não só uma

---

## 📜 7. Erros reais já cometidos nesta base de código (não repetir)

| Data | O que aconteceu | Causa | Lição |
|---|---|---|---|
| 16/08 | Modal "prompts parecidos" excluía resultados da própria página | Filtro comparando link atual bloqueava duplicatas genuínas dentro da mesma página | Duplicidade DENTRO da mesma página é o caso mais provável, não deveria ser filtrada |
| 16/08 | `marketing-texto.html` quebrou inteira ao adicionar 1 prompt | Usei o formato de chaves errado (Padrão A numa página Padrão B) | Sempre checar `seg:'` antes de editar essa página específica |
| 18/08 | Prompt novo em `redes-sociais.html` nunca aparecia em nenhuma busca | Categoria nova não estava em `ordemCategorias` | Sempre checar se a página tem essa lista fixa antes de usar categoria nova |
| 18/08 | Campo de valor perdia foco a cada tecla no Canivete | `oninput` chamando `renderFullList()` (redesenho completo) a cada caractere | Redesenho pesado só em `onchange`, nunca em `oninput` |
| 18/08 | Despesas arquivadas voltavam sozinhas após atualização | Lógica de "garantir categorias padrão" só checava lista ativa, não a arquivada | Sempre considerar TODOS os estados possíveis de um dado (ativo + arquivado + etc.) |
| 19/08 | Prompt de agente (filmes) tinha campo "o que não quero" mas nenhuma regra numerada obrigava a IA a respeitar | Campo de input existia mas não estava amarrado a uma regra explícita e enforçada | Todo campo de exclusão/restrição do usuário precisa virar uma REGRA NUMERADA explícita no prompt, não só um campo solto — senão a IA pode ignorar |
| 19/08 | Prompt duplicado em `imobiliario.html` ficou invisível | Categoria nova não estava em `ordemCategorias` — mesmo erro já catalogado acima, mas descoberto depois de já ter duplicado o prompt | Ao duplicar prompt em página nova, sempre checar `ordemCategorias` ANTES de publicar, não só depois de reclamação |
| 19/08 | Favoritar prompt em 6 páginas novas salvava com categoria errada (`tomada-de-decisao` fixo) | Atributo `data-categoria` do botão de favoritar não foi atualizado ao copiar o template de `tomada-de-decisao.html` pra 6 páginas novas | Ao copiar uma página como template, sempre `grep` por valores hardcoded do arquivo original (nome de categoria, ID, etc.) antes de publicar |

---

*Última atualização: 18/08/2026. Mantenha este arquivo atualizado sempre que um padrão novo ou armadilha nova for descoberta.*
