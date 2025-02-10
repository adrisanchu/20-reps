import {
  D1Database,
  PagesFunction,
  Response as CloudflareResponse,
} from '@cloudflare/workers-types';

export const onRequestGet: PagesFunction<{ DB: D1Database }> = async ({
  env,
}) => {
  if (!env.DB) {
    return new CloudflareResponse('Database not available', { status: 500 });
  }

  try {
    // Run the SELECT query
    const stmt = await env.DB.prepare('SELECT * FROM strava_activities');
    const { results } = await stmt.all();

    return new CloudflareResponse(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return new CloudflareResponse('Internal Server Error', { status: 500 });
  }
};
