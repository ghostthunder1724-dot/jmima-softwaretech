const API_ORIGIN = "https://jmima-api.ghostthunder1724.workers.dev";
const SITE_ORIGIN = "https://jmima-softwaretech.pages.dev";

export async function onRequest(context) {
  const incoming = new URL(context.request.url);
  const origin = context.request.headers.get("Origin");
  const fetchSite = context.request.headers.get("Sec-Fetch-Site");
  const referer = context.request.headers.get("Referer") || "";

  // Reject cross-origin browser calls before forwarding them.
  // Same-origin GET fetches may omit Origin, so accept their Fetch Metadata
  // or same-origin Referer as a fallback.
  const sameOrigin =
    origin === SITE_ORIGIN ||
    (!origin && fetchSite === "same-origin") ||
    (!origin && referer.startsWith(SITE_ORIGIN + "/"));

  if (!sameOrigin) {
    return Response.json(
      { success: false, message: "Origem não autorizada." },
      {
        status: 403,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff"
        }
      }
    );
  }

  const target = new URL(incoming.pathname + incoming.search, API_ORIGIN);
  const headers = new Headers(context.request.headers);
  headers.set("Origin", SITE_ORIGIN);

  const upstreamRequest = new Request(target.toString(), {
    method: context.request.method,
    headers,
    body: ["GET", "HEAD"].includes(context.request.method)
      ? undefined
      : context.request.body,
    redirect: "manual"
  });

  const upstream = await fetch(upstreamRequest);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("X-Content-Type-Options", "nosniff");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}
