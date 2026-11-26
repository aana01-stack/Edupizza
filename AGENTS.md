# AGENTS.md — EduPizzaria

## Visão geral
Jogo educativo estático em HTML, CSS e JavaScript puro, com visual inspirado em Good Pizza, Great Pizza. O jogador atende clientes, anota o pedido, monta a pizza com a resposta correta, leva ao forno e entrega.

## Estrutura
- `index.html`: telas de menu, cliente, cozinha, forno e entrega.
- `style.css`: arte em CSS puro (cliente, balcão, azulejos, pizza, forno) e animações.
- `perguntas.js`: banco de perguntas e ingredientes.
- `script.js`: estado do jogo, embaralhamento, montagem, forno, entrega e HUD.

## Comandos
- Abrir `index.html` no navegador, ou servir a pasta com `python3 -m http.server 8000`.
- Não há build, dependências npm nem backend.

## Convenções
- Manter o jogo funcional sem dependências externas além da fonte Google Fonts.
- Preferir CSS puro a imagens para a arte da pizza, do cliente e do forno.
- Nunca commitar segredos, tokens ou arquivos `.env`.
