import type { RequestHandler } from "./$types";
import type { D1Database } from "@cloudflare/workers-types";

interface Activity {
  id: number;
  name: string;
  start_date: string;
  sport_type: string;
  distance: number;
  extra_data: Record<string, any>;
}

export const POST: RequestHandler = async ({ request, platform }) => {
  if (!platform?.env?.DB) {
    return new Response("Database not available", { status: 500 });
  }

  try {
    const { activities } = await request.json();
    if (!Array.isArray(activities) || activities.length === 0) {
      return new Response("Invalid activities data", { status: 400 });
    }

    const db: D1Database = platform.env.DB;
    const stmt = await db.prepare(
      `INSERT INTO activities (id, name, start_date, sport_type, distance, extra_data)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    );

    const batch = activities.map((activity: Activity) =>
      stmt.bind(
        activity.id,
        activity.name,
        activity.start_date,
        activity.sport_type,
        activity.distance,
        JSON.stringify(activity.extra_data),
      ),
    );

    await db.batch(batch);

    return new Response("Activities saved successfully", { status: 200 });
  } catch (error) {
    console.error("Error inserting activities:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
