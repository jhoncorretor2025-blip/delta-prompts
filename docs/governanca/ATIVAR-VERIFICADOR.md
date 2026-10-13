# ✅ Como ligar o vigia automático (uma vez só, ~1 minuto)

O verificador (`scripts/validar-paginas.js`) já funciona. Falta só **ligar o vigia no GitHub**, para ele rodar sozinho a cada publicação e mostrar ❌ na hora se uma página quebrar ou se algum prompt sumir.

O arquivo do vigia está pronto em `docs/governanca/validar-paginas.workflow.yml`. Ele precisa ficar na pasta `.github/workflows/` (o GitHub só aceita assim), e essa pasta exige uma permissão especial, por isso o dono precisa criar o arquivo pelo site:

1. Abra o repositório no GitHub → botão **Add file** → **Create new file**.
2. No nome do arquivo, digite exatamente: `.github/workflows/validar-paginas.yml`
3. Abra `docs/governanca/validar-paginas.workflow.yml`, copie **todo** o conteúdo e cole no novo arquivo.
4. Clique em **Commit changes**.

Pronto. Depois disso, na aba **Actions**, aparece **"Validar páginas (sintaxe e prompts)"** a cada edição: ✅ verde = tudo certo, ❌ vermelho = abra e leia a mensagem (ela diz a página, a linha e o que fazer).

> Observação: o vigia **avisa**, mas não impede a publicação. Para impedir de verdade, faça as IAs proporem as mudanças por *Pull Request* e só aceite se estiver ✅.
