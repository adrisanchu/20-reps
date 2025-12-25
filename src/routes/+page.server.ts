import type { RequestHandler } from './$types';
import type { D1Database } from '@cloudflare/workers-types';


export const GET: RequestHandler = async ({ platform }) => {
  console.log('/ GET');
  if (!platform?.env?.DB) {
    return new Response('Database not available', { status: 500 });
  }

  const db: D1Database = platform.env.DB;
  let result = await db.prepare(
    'SELECT * FROM strava_activities'
  ).run();
  return new Response(JSON.stringify(result));
};