import type { RequestHandler } from './$types';
import type { D1Database } from '@cloudflare/workers-types';
import type { Activity } from '$lib/types';

export const GET: RequestHandler = async ({ platform }) => {
  console.log('api/activities GET');
  if (!platform?.env?.DB) {
    return new Response('Database not available', { status: 500 });
  }

  let result = await platform?.env?.DB?.prepare(
    'SELECT * FROM strava_activities'
  ).run();
  return new Response(JSON.stringify(result));
};

export const POST: RequestHandler = async ({ request, platform }) => {
  console.log('api/activities POST');
  if (!platform?.env?.DB) {
    return new Response('Database not available', { status: 500 });
  }

  try {
    const { activities } = (await request.json()) as { activities: Activity[] };
    if (!Array.isArray(activities) || activities.length === 0) {
      return new Response('Invalid activities data', { status: 400 });
    }

    const db: D1Database = platform.env.DB;
    const stmt = db.prepare(
      `INSERT INTO strava_activities (id, name, start_date, sport_type, distance, moving_time, elapsed_time, extra_data)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
    );

    const batch = activities.map((activity: Activity) =>
      stmt.bind(
        activity.id,
        activity.name,
        activity.start_date,
        activity.sport_type,
        activity.distance,
        activity.moving_time,
        activity.elapsed_time,
        JSON.stringify(activity.extra_data)
      )
    );

    await db.batch(batch);

    return new Response('Activities saved successfully', { status: 200 });
  } catch (error) {
    console.error('Error inserting activities:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
