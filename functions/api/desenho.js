// functions/api/desenho.js
// Pages Function: POST /api/desenho
//
// Recebe {"numero": N} no corpo e "Authorization: Bearer <id_token>" no
// cabecalho. Verifica o token no Google (tokeninfo) e devolve o SVG assinado
// com o e-mail da conta Google, nunca com um e-mail enviado pelo navegador.
//
// Ordem das verificacoes (contrato): metodo (405), corpo (400), token (401).

import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

const TOKENINFO = "https://oauth2.googleapis.com/tokeninfo?id_token=";

function erro(status, mensagem, extras = {}) {
  return new Response(JSON.stringify({ erro: mensagem }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extras,
    },
  });
}

// Le e valida o corpo. Devolve o numero ou null se o corpo for invalido.
async function lerNumero(request) {
  let texto;
  try {
    texto = await request.text();
  } catch {
    return null;
  }
  if (!texto || texto.trim() === "") return null;

  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return null;
  }
  if (corpo === null || typeof corpo !== "object" || Array.isArray(corpo)) {
    return null;
  }
  return numeroValido(corpo.numero) ? corpo.numero : null;
}

// Extrai o id_token do cabecalho Authorization: Bearer <token>.
function lerToken(request) {
  const cabecalho = request.headers.get("Authorization") || "";
  const partes = cabecalho.match(/^Bearer\s+(\S+)$/i);
  return partes ? partes[1] : null;
}

// Pergunta ao Google se o token e valido. Devolve o e-mail ou null.
async function verificarToken(token, clientId) {
  if (!token || !clientId) return null;

  let resposta;
  try {
    resposta = await fetch(TOKENINFO + encodeURIComponent(token));
  } catch {
    return null;
  }
  if (resposta.status !== 200) return null;

  let dados;
  try {
    dados = await resposta.json();
  } catch {
    return null;
  }

  if (dados.aud !== clientId) return null;
  if (String(dados.email_verified) !== "true") return null;
  if (typeof dados.email !== "string" || dados.email === "") return null;

  return dados.email;
}

export async function onRequest({ request, env }) {
  // 1. Metodo
  if (request.method !== "POST") {
    return erro(405, "Metodo nao permitido. Use POST.", { Allow: "POST" });
  }

  // 2. Corpo
  const numero = await lerNumero(request);
  if (numero === null) {
    return erro(400, "Corpo invalido: envie {\"numero\": N} com N inteiro entre 1 e 100.");
  }

  // 3. Token
  const email = await verificarToken(lerToken(request), env.GOOGLE_CLIENT_ID);
  if (email === null) {
    return erro(401, "Token ausente, invalido ou expirado. Entre com o Google novamente.");
  }

  return new Response(gerarDesenho(numero, email), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
    },
  });
}
