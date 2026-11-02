# Changelog — Delta Prompts

## V2.05 — Teste de integração do Canivete alinhado
- Atualiza as versões esperadas pelo CI do Canivete para os valores que já estão presentes nos dois arquivos atuais (8.69 e 8.22), eliminando falha falsa de validação.


## V2.04 — Ajuste final da auditoria de cache
- Faz a auditoria conferir o mesmo cache-busting do carregador tanto na home quanto no Service Worker.
- Simplifica a validação da versão para evitar falso negativo da expressão regular.


## V2.03 — Auditoria automatizada sincronizada
- Atualiza a auditoria de UX para validar a versão atual declarada e o cache-busting real do carregador, sem exigir identificadores antigos.


## V2.02 — Correção na validação de chaves de backup
- Corrige a expressão de validação de nomes de chaves para aceitar letras, números e separadores permitidos durante a restauração.
- Mantém os limites de tamanho, namespace permitido e bloqueio de credenciais da V2.01.


## V2.01 — Acessibilidade, restauração segura e cache
- Unifica a versão visível da home, carregador do menu e Service Worker.
- Adiciona preferências globais de tamanho do texto, alto contraste e redução de movimento, salvas localmente.
- Reforça a restauração de backups com limite de tamanho, validação de formato/chaves/conteúdo e reversão em caso de falha.
- Atualiza o cache offline para garantir a instalação dos arquivos atuais.


## V1.98 — QA, consistência de versão e links
- Sincroniza a versão visível da home, o menu-loader.js e o sw.js.
- Atualiza o cache-busting do menu-loader e a versão do cache do service worker.
- Corrige o auditor de caminhos para não tratar atributos data-action nem strings de HTML gerado por JavaScript como links estáticos.
- Corrige a imagem ausente na página folder-33-anos.html com uma ilustração SVG local incorporada, sem depender de um arquivo inexistente ou serviço externo.
- Adiciona verificação automática de sintaxe e preservação dos prompts existentes no GitHub Actions.
- Registra o plano de QA e as limitações dos testes que exigem navegador real.

### Escopo desta versão
Esta versão prioriza consistência de versão, integridade de links estáticos e repetibilidade das verificações. Não representa certificação manual de todos os fluxos interativos do site.


## V1.99 — Continuação da navegação na página inicial
- Corrige a função de retomada para atualizar os dois cards de “Continuar de onde parei”, incluindo o atalho da área de descoberta.
- Mantém os cards ocultos quando não há uma última página válida salva e preserva a navegação existente.
- Sincroniza a versão da home, do menu-loader e do service worker; atualiza a invalidação de cache.
- Amplia a auditoria automática da home para verificar a ligação entre os dois cards e a função de retomada.
- Limitação: a validação estática e a execução dos workflows não substituem testes manuais em navegador real.

## Sites & Landing Pages V1.91 — Correção da skill Auditor Sênior
- Corrige o separador JavaScript da nova entrada, que estava impedindo a execução do script da página.
- Move a skill Auditor Sênior para o final da lista, preservando a posição/ID dos prompts existentes.
- Atualiza as seis referências de versão da página de Sites de V1.90 para V1.91.
