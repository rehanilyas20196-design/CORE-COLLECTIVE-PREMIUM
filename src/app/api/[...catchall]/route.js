const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://core-backend-collect.vercel.app';

// Headers that must never be forwarded to the browser:
//  - content-encoding / content-length / transfer-encoding describe the
//    COMPRESSED response from the backend, but fetch() already decompressed
//    the body before we forward it. Forwarding them makes the browser try to
//    gunzip plain JSON -> net::ERR_CONTENT_DECODING_FAILED (only on large
//    responses like /products/minimal?limit=1000, which is why it looked
//    random).
//  - the rest are hop-by-hop headers that make no sense on a new connection.
const STRIP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'upgrade',
]);

async function handler(request, { params }) {
  const path = params.catchall.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/${path}${search}`;

  const headers = {};
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!['host', 'connection', 'content-length', 'accept-encoding'].includes(k)) {
      headers[key] = value;
    }
  });
  // Ask the backend for an UNCOMPRESSED body so nothing can double-encode it.
  headers['accept-encoding'] = 'identity';

  try {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob();
    const response = await fetch(url, { method: request.method, headers, body: body ?? undefined });

    const resHeaders = {};
    response.headers.forEach((value, key) => {
      if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
        resHeaders[key] = value;
      }
    });

    return new Response(response.body, { status: response.status, headers: resHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }
}

function preflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = preflight;
