# Teleprompter IA — Canivete v1.5.5

Módulo independente para leitura de roteiros, sem alterar os dados ou arquivos financeiros do Canivete.

## Versão web
Abra `teleprompter.html` no site publicado do projeto. O botão **Abrir janela flutuante** usa a API Document Picture-in-Picture quando disponível no navegador. A compatibilidade e o comportamento de transparência variam por navegador.

## Aplicativo Windows
A pasta `desktop/` contém o aplicativo Electron. Ele abre uma janela flutuante transparente, sem moldura e configurada para ficar sempre no topo. O roteiro é armazenado no armazenamento local do aplicativo; não é enviado para um servidor pela ferramenta.

O workflow **Teleprompter IA - Windows** gera:
- Instalador Windows (.exe)
- Versão portátil Windows (.exe)

Para gerar os arquivos, abra o repositório no GitHub, vá em **Actions → Teleprompter IA - Windows → Run workflow**. Depois abra a execução concluída e baixe o artefato `teleprompter-ia-windows-v1.5.5`.

## Segurança e escopo
- Não modificar `canivete.html` nem os dados existentes.
- Electron usa `contextIsolation`, `nodeIntegration: false` e um preload restrito.
- O executável gerado pelo workflow é um artefato de CI, não um aplicativo assinado digitalmente.
- Versão atual do módulo: **v1.5.5**.
