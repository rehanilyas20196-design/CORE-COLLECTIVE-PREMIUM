const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://core-collective-premium-np5x.vercel.app';

async function handler(request, { params }) {
  const path = params.catchall.join('/');
  const search = request.nextUrl.search;
  const url = `${BACKEND_URL}/api/${path}${search}`;

  const headers = {};
  request.headers.forEach((value, key) => {
    if (!['host', 'connection'].includes(key)) {
      headers[key] = value;
    }
  });

  try {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob();
    const response = await fetch(url, { method: request.method, headers, body });
    const resHeaders = {};
    response.headers.forEach((value, key) => { resHeaders[key] = value; });
    return new Response(response.body, { status: response.status, headers: resHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
      status: 502, headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
