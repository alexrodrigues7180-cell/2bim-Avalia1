// A pasta lib/ nao faz parte do site: gerarDesenho so roda no servidor.
// Esta funcao garante 404 mesmo em borda que tenha cacheado o arquivo
// quando o projeto ainda estava publicando a raiz do repositorio.
export const onRequest = () =>
  new Response("Not Found", {
    status: 404,
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
  });
