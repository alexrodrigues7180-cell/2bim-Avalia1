// script.js
// A pagina nao desenha nada: envia o numero e o id_token do Google para
// /api/desenho e exibe o SVG que o servidor devolve. O e-mail da assinatura
// vem do token, verificado no servidor.

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const usuario = document.getElementById("usuario");
const botaoBaixar = document.getElementById("baixar");

let idToken = "";
let svgAtual = "";

// Le o e-mail do payload do JWT apenas para mostrar quem esta conectado.
// Quem decide a assinatura e o servidor, que verifica o token no Google.
function emailDoToken(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).email || "";
  } catch {
    return "";
  }
}

// Chamado pelo Google Identity Services apos o login (data-callback).
window.aoEntrarComGoogle = (resposta) => {
  idToken = resposta.credential;
  const email = emailDoToken(idToken);
  usuario.textContent = email ? `Conectado como ${email}` : "Conectado";
  mensagem.textContent = "";
};

function mostrarErro(texto) {
  mensagem.textContent = texto;
  area.innerHTML = "";
  svgAtual = "";
  botaoBaixar.hidden = true;
}

// O numero vai para o servidor sem filtro: quem valida e a funcao.
function lerNumero() {
  const valor = campoNumero.value.trim();
  return valor === "" ? undefined : Number(valor);
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const cabecalhos = { "Content-Type": "application/json" };
  if (idToken) cabecalhos.Authorization = `Bearer ${idToken}`;

  let resposta;
  try {
    resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: cabecalhos,
      body: JSON.stringify({ numero: lerNumero() }),
    });
  } catch {
    mostrarErro("Erro de rede: não foi possível falar com o servidor.");
    return;
  }

  if (resposta.status === 400) {
    mostrarErro("Erro 400: número inválido. Digite um inteiro entre 1 e 100.");
    return;
  }
  if (resposta.status === 401) {
    mostrarErro("Erro 401: não autenticado. Entre com a sua conta Google (ou entre de novo, se o login expirou).");
    return;
  }
  if (!resposta.ok) {
    mostrarErro(`Erro ${resposta.status}: o servidor não gerou o desenho.`);
    return;
  }

  svgAtual = await resposta.text();
  area.innerHTML = svgAtual;
  botaoBaixar.hidden = false;
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});
