# Desenho Assinado

Página que recebe um número inteiro entre 1 e 100 e devolve uma figura em SVG, assinada com o e-mail da conta Google usada no login.

A figura é a tabuada modular no círculo: 240 pontos igualmente espaçados numa circunferência, com cada ponto `i` ligado ao ponto `(k * i) mod 240`, em que `k = número + 1`. O número 1 produz uma cardioide, o 2 uma nefroide, e cada valor gera uma figura diferente.

## Como funciona

O desenho é gerado no servidor, por uma Pages Function. O navegador faz login com o Google (Google Identity Services), recebe um `id_token` e o envia junto com o número. A função verifica o token em `https://oauth2.googleapis.com/tokeninfo`, confere `aud` e `email_verified`, e assina o desenho com o campo `email` da resposta. O formulário não tem campo de e-mail.

```
public/
  index.html            formulário com o número e o botão Sign in with Google
  style.css             aparência da página
  script.js             envia número e token para /api/desenho e exibe o SVG
  404.html              resposta para caminhos inexistentes
lib/
  desenho.js            gerarDesenho(numero, email): gera o SVG (função pura)
functions/api/
  desenho.js            Pages Function POST /api/desenho
evidencias/
  exemplo.svg           desenho gerado pelo site publicado
```

## Contrato da API

`POST /api/desenho` com corpo `{"numero": 42}` e cabeçalho `Authorization: Bearer <id_token>`.

| Status | Quando |
|--------|--------|
| 200 | SVG (`Content-Type: image/svg+xml`) assinado com o e-mail do token |
| 400 | corpo ausente, JSON inválido, `numero` ausente, não inteiro ou fora de 1 a 100 |
| 401 | token ausente, inválido, expirado, `aud` diferente do Client ID ou e-mail não verificado |
| 405 | qualquer método diferente de POST |

As verificações seguem a ordem: método, corpo, token.

## Publicação no Cloudflare Pages

Framework preset: `None`. Build command: vazio. Build output directory: `public`.

Variável de ambiente no painel do projeto: `GOOGLE_CLIENT_ID` (o Client ID do OAuth Client Web do Google).

## Identificação (preencha após o fork)

Nome: 
RA: 
URL: https://2bim-avalia1-47y.pages.dev
