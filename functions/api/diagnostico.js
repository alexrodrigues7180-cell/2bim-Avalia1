// TEMPORARIO: so para conferir qual GOOGLE_CLIENT_ID o servidor enxerga.
// Remover antes da entrega. O Client ID e publico (ver item 4 do enunciado).
export const onRequest = ({ env }) =>
  Response.json({
    clientIdConfigurado: env.GOOGLE_CLIENT_ID ?? null,
    tamanho: (env.GOOGLE_CLIENT_ID || "").length,
  }, { headers: { "Cache-Control": "no-store" } });
