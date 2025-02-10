import {
  D1Database,
  PagesFunction,
  Response as CloudflareResponse,
} from '@cloudflare/workers-types';

interface Activity {
  id: number;
  name: string;
  start_date: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  extra_data: Record<string, any>; // Flexible for extra fields
}

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async ({
  request,
  env,
}) => {
  if (!env.DB) {
    return new CloudflareResponse('Database not available', { status: 500 });
  }

  try {
    const { activities } = (await request.json()) as { activities: Activity[] };
    if (!Array.isArray(activities) || activities.length === 0) {
      return new CloudflareResponse('Invalid activities data', { status: 400 });
    }

    const stmt = await env.DB.prepare(
      `INSERT INTO activities (id, name, start_date, sport_type, distance, moving_time, elapsed_time, extra_data)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
    );

    const batch = activities.map((activity) =>
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

    await env.DB.batch(batch);
    return new CloudflareResponse('Activities saved successfully', {
      status: 200,
    });
  } catch (error) {
    console.error('Error inserting activities:', error);
    return new CloudflareResponse('Internal Server Error', { status: 500 });
  }
};
