# JMima SoftwareTech — Website inicial

Website institucional estático, responsivo e bilingue (Português/Inglês), preparado para Cloudflare Pages.

## Estrutura
- `index.html` — páginas/seções institucionais
- `styles.css` — identidade visual e layout responsivo
- `script.js` — menu móvel, idioma e formulário de contacto
- `assets/jmima-logo.png` — logótipo fornecido

## Publicação no Cloudflare Pages
Este projeto não exige processo de build.
- Framework preset: **None**
- Build command: deixar vazio
- Build output directory: `/` (ou deixar vazio, conforme o formulário do Pages)
- Root directory: `/` (raiz do repositório)

Depois de enviar os ficheiros para a raiz do repositório GitHub, ligar o repositório ao Cloudflare Pages e iniciar a publicação.

## Antes de produção
1. Definir o email oficial e ativar o envio do formulário em `script.js`.
2. Ligar o formulário a um endpoint seguro (Cloudflare Worker ou serviço de formulários); neste momento abre o programa de email do visitante.
3. Rever textos, serviços, contactos e informação legal da empresa.
4. Implementar backend, autenticação, painel administrativo, base de dados e gestão de ficheiros numa etapa própria.

Não existem credenciais, chaves ou dados privados neste projeto.
