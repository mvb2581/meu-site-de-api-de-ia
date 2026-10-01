# Aurex

Catálogo de animes em React, com dados da AniList, seleção de episódios que aceitam incorporação e reprodução pelo player oficial do YouTube.

## Executar localmente

Requer Node.js `20.19+` ou `22.12+`.

```bash
npm install
npm run dev
```

O Vite serve a interface durante o desenvolvimento e o Express fica disponível na porta `3001`. Para gerar e servir a versão de produção:

```bash
npm run build
npm start
```

O servidor usa `PORT` quando definido e oferece `GET /api/health`. As rotas `/api/*` inexistentes retornam erros JSON.

## Dados e reprodução

- A busca e o catálogo dinâmico usam AniList GraphQL; há também um catálogo local para disponibilidade e fallback.
- O catálogo não esconde animes sem vídeos. Na tela de detalhes, a interface informa quando não há episódios incorporados.
- Apenas links HTTPS do YouTube com ID válido e número de episódio reconhecível entram na lista de reprodução.
- A busca usa campos de resumo. Detalhes de vídeo da temporada relacionada só são requisitados após abrir o anime e escolher a temporada; a lista exibe 12 itens inicialmente e amplia em lotes de até 24.
- A reprodução usa a YouTube IFrame Player API. Posição e histórico são armazenados localmente neste navegador, com limite de 50 itens; um episódio é marcado como concluído a partir de 90%.
- A Minha lista salva até 100 animes no armazenamento local do navegador.
- A camada Jikan em `src/api/episodes.js` pode resolver metadados de episódios por MAL ID, mas não fornece um link de vídeo incorporável; por isso ela não é usada para fingir que um episódio pode ser reproduzido na página.
- A disponibilidade dos vídeos é controlada pelo provedor original e pode mudar.

## Conta e armazenamento

O projeto ainda não possui banco de dados nem autenticação de servidor. Contas, perfil e sessão são locais ao navegador. Senhas novas são derivadas com PBKDF2 antes de serem salvas, e contas legadas são migradas ao iniciar ou no próximo login. Isso melhora o armazenamento local, mas não substitui autenticação real com servidor e banco compartilhado; não use a conta local como proteção de dados comerciais.

## Verificações

```bash
npm test
npm run build
npm audit
```
