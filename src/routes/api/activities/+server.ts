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

export const DELETE: RequestHandler = async ({ url, platform }) => {
  if (!platform?.env?.DB) {
    return new Response('Database not available', { status: 500 });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response('Missing activity ID', { status: 400 });
    }

    const db: D1Database = platform.env.DB;
    const stmt = await db
      .prepare('DELETE FROM strava_activities WHERE id = ?1')
      .bind(id);
    await stmt.run();

    return new Response(`Activity ${id} deleted successfully`, { status: 200 });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, platform }) => {
  if (!platform?.env?.DB) {
    return new Response('Database not available', { status: 500 });
  }

  try {
    const body = (await request.json()) as Activity;
    if (!body.id) {
      return new Response('Missing activity ID', { status: 400 });
    }

    const db: D1Database = platform.env.DB;
    const stmt = await db
      .prepare(
        `UPDATE strava_activities 
       SET name = ?2, start_date = ?3, sport_type = ?4, distance = ?5, extra_data = ?6
       WHERE id = ?1`
      )
      .bind(
        body.id,
        body.name,
        body.start_date,
        body.sport_type,
        body.distance,
        JSON.stringify(body.extra_data)
      );

    await stmt.run();
    return new Response(`Activity ${body.id} updated successfully`, {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
