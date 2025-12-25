import type { RequestHandler } from './$types';
import type { D1Database } from '@cloudflare/workers-types';
import type { Activity } from '$lib/types';

export const GET: RequestHandler = async ({ platform }) => {
  console.log('api/20-reps GET');
  if (!platform?.env?.DB) {
    return new Response('Database not available', { status: 500 });
  }

  let filtr: string = '%Reps'
  let result = await platform?.env?.DB?.prepare(
    'SELECT * FROM strava_activities WHERE name = ?1').bind(filtr).run();
  return new Response(JSON.stringify(result));
};