# Changelog — Delta Prompts

## V1.98 — QA, consistência de versão e links
- Sincroniza a versão visível da home, o menu-loader.js e o sw.js.
- Atualiza o cache-busting do menu-loader e a versão do cache do service worker.
- Corrige o auditor de caminhos para não tratar atributos data-action nem strings de HTML gerado por JavaScript como links estáticos.
- Corrige a imagem ausente na página folder-33-anos.html com uma ilustração SVG local incorporada, sem depender de um arquivo inexistente ou serviço externo.
- Adiciona verificação automática de sintaxe e preservação dos prompts existentes no GitHub Actions.
- Registra o plano de QA e as limitações dos testes que exigem navegador real.

### Escopo desta versão
Esta versão prioriza consistência de versão, integridade de links estáticos e repetibilidade das verificações. Não representa certificação manual de todos os fluxos interativos do site.
