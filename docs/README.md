# Documentação do Delta Prompts

Documentação de manutenção, arquitetura e módulos do repositório.

## Documentos principais

- [Mapa da estrutura do repositório](ESTRUTURA-DO-REPOSITORIO.md)
- [Regras e convenções do site](governanca/REGRAS-DO-SITE.md)
- [Documentação do Canivete](canivete/README.md)
- [Documentação do Teleprompter IA](teleprompter/README.md)

## Convenções de organização

- Páginas públicas e URLs existentes permanecem nos caminhos atuais.
- Arquivos compartilhados (`menu-loader.js`, `menu.html`, `firebase-auth.js`, `style.css`, `css/` e `js/`) não devem ser movidos sem uma migração de dependências específica.
- Workflows ativos permanecem em `.github/workflows/`.
- Sempre faça mudanças estruturais em uma branch, verifique links e execute os testes antes de integrar à `main`.
