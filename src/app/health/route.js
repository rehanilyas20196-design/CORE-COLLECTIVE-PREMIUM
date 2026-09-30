export const dynamic = 'force-dynamic';

// Root-level liveness probe, for uptime monitors and load balancers that expect
// /health rather than /api/health. Mirrors src/app/api/health/route.js and
// deliberately does NOT forward to the backend: the frontend being up while the
// backend is down should still report healthy, or a backend outage would take
// the frontend out of rotation too.
export function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}