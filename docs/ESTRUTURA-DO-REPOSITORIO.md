# Estrutura do repositório

## Objetivo

Separar documentação de manutenção da aplicação publicada, sem alterar as URLs públicas existentes nem interromper os workflows.

## Estrutura-alvo

```text
delta-prompts/
├── index.html                         # Entrada pública
├── canivete.html                      # URL pública preservada
├── canivete-avancado.html             # URL pública preservada
├── outras páginas públicas .html      # URLs preservadas
├── menu.html
├── menu-loader.js
├── firebase-auth.js
├── style.css
├── css/                               # Estilos compartilhados
├── js/                                # JavaScript compartilhado
├── ferramentas/                       # Ferramentas públicas
├── paginas/                           # Conteúdo e páginas públicas
├── canivete/                          # Módulo: web, PWA e desktop
│   ├── app/
│   ├── config/
│   ├── desktop/
│   ├── tools/
│   ├── teleprompter.html
│   ├── roteiros.html
│   ├── sw.js
│   └── manifest.webmanifest
├── tools/                             # Scripts de manutenção existentes
├── docs/
│   ├── README.md
│   ├── ESTRUTURA-DO-REPOSITORIO.md
│   ├── governanca/
│   │   └── REGRAS-DO-SITE.md
│   ├── canivete/
│   │   └── README.md
│   └── teleprompter/
│       └── README.md
├── .github/
│   ├── scripts/
│   └── workflows/                     # Local dos workflows ativos
├── sitemap.xml
├── robots.txt
└── manifest.json                      # PWA do site principal
```

## Migrações desta etapa

| Caminho anterior | Novo caminho |
|---|---|
| `REGRAS-DO-SITE.md` | `docs/governanca/REGRAS-DO-SITE.md` |
| `canivete/README.md` | `docs/canivete/README.md` |
| `canivete/TELEPROMPTER-README.md` | `docs/teleprompter/README.md` |

## Caminhos que ficam intencionalmente no lugar

- Todas as páginas HTML públicas da raiz.
- `canivete.html`, `canivete-avancado.html` e os módulos dentro de `canivete/`.
- `menu.html`, `menu-loader.js`, `firebase-auth.js`, `style.css`, `css/` e `js/`.
- `manifest.json`, ícones, `sitemap.xml` e `robots.txt`.
- `.github/workflows/`, exigido para o GitHub reconhecer os workflows ativos.
- Scripts e configurações que workflows ainda referenciam com caminhos relativos à raiz.

## Referências e cuidados

- Links relativos dentro dos documentos movidos devem apontar para os caminhos a partir da nova localização.
- Os comandos de manutenção em `docs/governanca/REGRAS-DO-SITE.md` devem ser executados a partir da raiz do repositório.
- O script de limpeza de despesas foi consolidado em `canivete/tools/limpar-novas-despesas-v84.py`; o workflow `.github/workflows/aplicar-limpeza-despesas.yml` aponta para esse caminho. A cópia redundante na raiz foi removida.
- `.github/scripts/verificar-lembretes.js` procura os arquivos de configuração na raiz, portanto os arquivos atuais devem permanecer lá até que essa automação seja migrada conscientemente.
- Existem cópias idênticas de configurações em `canivete/config/`. A consolidação fica fora desta etapa para não criar risco desnecessário.

## Testes mínimos após a migração

1. Procurar referências antigas aos três documentos movidos.
2. Abrir as páginas públicas principais e testar a navegação.
3. Confirmar que a busca, os imports e a autenticação continuam usando os caminhos atuais.
4. Executar os workflows que dependem dos diretórios alterados.
5. Validar a sintaxe dos scripts e testar os fluxos no navegador.
6. Conferir a versão visível do site principal e do Teleprompter, além das referências de versão no pacote desktop e workflow.

## Política de versionamento

O site principal e o Teleprompter são escopos distintos e mantêm versões próprias. A versão corrente de cada um deve corresponder ao valor mostrado pela interface e aos artefatos de build aplicáveis. Referências de changelog e exemplos históricos não devem ser tratadas como versões atuais.


## Auditoria automatizada de caminhos locais

Antes de mover páginas ou recursos, execute na raiz do repositório:

```bash
node .github/scripts/auditar-caminhos-repositorio.js
```

O auditor verifica referências locais estáticas em atributos HTML (`href`, `src`, `action`, `poster`, `data-src`) e em `url(...)` de CSS. Referências externas, protocolos especiais, fragmentos e URLs dinâmicas são ignorados. O relatório aponta o arquivo de origem, o caminho citado e o caminho esperado no repositório.

- Execute a auditoria antes e depois de cada grupo de movimentações.
- Revise manualmente os casos dinâmicos e caminhos construídos por JavaScript; o script não consegue deduzir todos.
- Não mova arquivos só para eliminar alertas: confirme primeiro se a referência é válida e se a URL pública precisa ser preservada.
- O auditor não substitui os testes no navegador nem a validação dos workflows.

## Registro de versão do site principal

- Versão anterior: V1.55.
- Versão desta melhoria: V1.56.
- Referências sincronizadas: `index.html`, `menu-loader.js` e `sw.js`.
- Cache do service worker: `delta-prompts-shell-v56`.
- Cache-busting do carregador do menu: `20261010-v56`.


## Registro de organização do Canivete — v8.31

- Versão anterior do Canivete principal: v8.30.
- Nova versão: v8.31.
- Mantidas as URLs públicas da raiz (`canivete.html`, `canivete.htm` e demais páginas).
- Consolidado o script de manutenção em `canivete/tools/limpar-novas-despesas-v84.py` e atualizado o workflow correspondente.
- Corrigida a expectativa de versão do Canivete principal no workflow de validação.
- Mantida a cópia de configuração de notificações na raiz, pois o script de lembretes ainda a consome.
