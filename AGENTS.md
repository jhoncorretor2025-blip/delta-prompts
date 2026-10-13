# 🤖 Leia antes de editar este repositório (ChatGPT, Claude e outras IAs)

Este é o site **Delta Prompts**. Antes de alterar qualquer arquivo:

1. Leia `docs/governanca/REGRAS-DO-SITE.md`, principalmente a **seção 0 (Regras de ouro)**.
2. **Não apague nem substitua prompts** sem o dono pedir. Prompt novo vai sempre no **FINAL** da lista.
3. Dentro de aspas simples **não pode haver quebra de linha de verdade**: use `\n`. Apóstrofo vira `\'`.
4. **Rode `node scripts/validar-paginas.js` antes de publicar.** Se aparecer ✖, não publique: corrija.
5. **Suba a versão visível** da página (ex.: V1.59 → V1.60) sempre que alterar código.

```bash
node scripts/validar-paginas.js                       # confere sintaxe de todas as páginas e se algum prompt sumiu
node scripts/validar-paginas.js --atualizar-baseline  # rode DEPOIS de adicionar prompts (e comite o arquivo gerado)
```

Se você não consegue rodar comandos, avise o dono e peça para ele conferir a aba **Actions → "Validar páginas"** no GitHub logo depois de publicar.
