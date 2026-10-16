# Relatório de QA — Delta Prompts V1.98

**Data:** 15–16/10/2026  
**Escopo:** página inicial, referências locais do repositório, consistência de versão e validação estática das páginas de prompts.  
**Limite importante:** não houve sessão de navegador automatizado/manual disponível nesta execução. Não declarar cliques reais, console limpo ou layout renderizado como aprovados.

## Cenários e resultados

| ID | Cenário e passos | Resultado esperado | Resultado observado | Status | Evidência | Gravidade |
|---|---|---|---|---|---|---|
| QA-01 | Conferir meta, título, selos visíveis, cache-busting, menu-loader e service worker | Uma versão atual consistente em todos os pontos globais | Encontrada divergência V1.97/V1.94; sincronizada para V1.98 e auditor automatizado aprovado | Aprovado após correção | [Auditoria UX](https://github.com/jhoncorretor2025-blip/delta-prompts/actions/runs/38836328856) | Alta antes da correção |
| QA-02 | Percorrer referências locais HTML/CSS do repositório | Todo destino estático existe | Auditor inicialmente reportava strings geradas por JS e data-action como links; filtro corrigido. Uma imagem ausente foi substituída por SVG incorporado. A auditoria passou | Aprovado após correção | [Auditoria de caminhos](https://github.com/jhoncorretor2025-blip/delta-prompts/actions/runs/38836328798) | Média |
| QA-03 | Executar validador de páginas para sintaxe inline e preservação dos títulos dos prompts | Scripts válidos e nenhum prompt removido sem atualização autorizada do baseline | A primeira execução apontou baseline desatualizado: um prompt de backup foi aprimorado/renomeado em commit anterior e dois prompts novos estavam fora do baseline. O baseline foi sincronizado sem reordenar a lista; a execução seguinte passou | Aprovado após correção | [Validação de páginas e regressões](https://github.com/jhoncorretor2025-blip/delta-prompts/actions/runs/38836328785) | Alta antes da correção |
| QA-04 | Verificar link para pular ao conteúdo, marco main, nome acessível da busca, status aria-live, atalhos / e Escape, foco visível e movimento reduzido | Estrutura básica acessível presente | Todas as verificações estáticas da home passaram | Aprovado — estático | [Auditoria UX](https://github.com/jhoncorretor2025-blip/delta-prompts/actions/runs/38836328856) | Média |
| QA-05 | Conferir busca, sugestões, botões de atalho e grupos de navegação no navegador | Digitar, selecionar e navegar sem erro; feedback correto | O código e os elementos/handlers foram inspecionados; interação real no navegador não foi executada nesta sessão | Não verificável | Navegador real/DevTools indisponível nesta execução | Média |
| QA-06 | Testar responsividade em 360 px, tablet e desktop | Sem sobreposição, rolagem horizontal indevida ou controles inacessíveis | Media queries e regras responsivas existem; renderização em larguras reais não foi verificada | Não verificável | Requer teste visual em navegador | Média |
| QA-07 | Testar console, falhas de carregamento e recursos externos | Sem exceções JavaScript ou recursos quebrados em runtime | Links estáticos locais passaram; console e requisições de rede não foram inspecionados no navegador | Não verificável | Requer DevTools | Alta |
| QA-08 | Login, permissões e sessões na página inicial | Fluxo presente e protegido, se aplicável | Não há fluxo convencional de login/sessão no fluxo principal da home; páginas administrativas e ferramentas isoladas não foram submetidas a teste de permissão nesta rodada | Fora do escopo da home / pendente em páginas próprias | Inspeção estática do escopo da home | Alta, se exposto sem proteção |
| QA-09 | Integrações/API e formulários | Integrações acessíveis, validações e feedback corretos | A home contém links para outros módulos e recursos externos, mas chamadas de API, formulários de outros módulos e respostas de terceiros não foram exercitados | Não verificável | Requer teste por módulo e rede real | Média |
| QA-10 | Publicação GitHub Pages | Build e deploy concluídos no commit final | O job do Pages estava em andamento na última consulta desta rodada | Pendente de confirmação | [Acompanhar Pages](https://github.com/jhoncorretor2025-blip/delta-prompts/actions) | Alta |

## Falhas confirmadas e correções

1. **Versão global divergente:** sincronizados os pontos globais para V1.98; o auditor agora verifica também menu-loader, service worker e cache-busting.
2. **Auditoria de links com falsos positivos:** o verificador não interpreta o conteúdo de scripts inline como atributos HTML reais e não confunde `data-action` com o atributo `action`.
3. **Imagem local inexistente:** a página `folder-33-anos.html` agora usa uma ilustração SVG incorporada, evitando um pedido de imagem que retornava arquivo ausente; a versão V1.98 está visível nessa página.
4. **Baseline de prompts desatualizado:** o título do prompt de backup foi alinhado à versão aprimorada existente, e os dois novos títulos foram incluídos no baseline sem alterar a ordem dos prompts.
5. **Automação de regressão:** criado workflow para executar `node scripts/validar-paginas.js` em pushes, pull requests e execução manual.

## Pendências e limitações

- Executar testes de clique e navegação real em Chrome/Firefox, teclado completo e viewport móvel/tablet.
- Inspecionar Console e Network no navegador para erros em runtime, recursos externos e APIs.
- Testar importação/exportação, armazenamento local, favoritos e preferências em cada módulo que disponibiliza esses recursos.
- Confirmar conclusão do deploy GitHub Pages no commit final antes de afirmar que a versão está publicada.
- Workflows independentes de Canivete/saúde aparecem falhando no repositório; não foram tratados nesta correção porque pertencem a outros fluxos e exigem investigação separada.

## Referências

- [Repositório](https://github.com/jhoncorretor2025-blip/delta-prompts)
- [Site](https://jhoncorretor2025-blip.github.io/delta-prompts/index.html?v=V1.98)
- [Changelog](../../CHANGELOG.md)
