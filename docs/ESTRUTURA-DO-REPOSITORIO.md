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
- Scripts e configurações que workflows referenciam com caminhos relativos à raiz.

## Referências e cuidados

- Links relativos dentro dos documentos movidos devem apontar para os caminhos a partir da nova localização.
- Os comandos de manutenção em `docs/governanca/REGRAS-DO-SITE.md` devem ser executados a partir da raiz do repositório.
- O script `tools/limpar-novas-despesas-v84.py` é chamado explicitamente por `.github/workflows/aplicar-limpeza-despesas.yml`; não movê-lo sem atualizar e testar o workflow.
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
