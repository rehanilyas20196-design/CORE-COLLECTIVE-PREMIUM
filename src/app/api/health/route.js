export const dynamic = 'force-dynamic';

// Liveness probe for the `web` container. Deliberately does NOT forward to the
// backend: a frontend that is up but whose backend is down should still report
// healthy, because `depends_on: backend: service_healthy` already gates startup.
// A static segment outranks the sibling [...catchall] proxy route.
export function GET() {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
