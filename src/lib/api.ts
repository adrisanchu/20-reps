import type { Activity, StravaActivity } from '$lib/types';

export function adaptActivities(rawActivities: StravaActivity[]): Activity[] {
  return rawActivities.map(
    ({
      id,
      name,
      start_date,
      sport_type,
      distance,
      moving_time,
      elapsed_time,
      ...extra
    }) => ({
      id,
      name,
      start_date,
      sport_type,
      distance,
      moving_time,
      elapsed_time,
      extra_data: extra, // Store all remaining properties inside extra_data
    })
  );
}

export async function saveActivities(
  rawActivities: Activity[] | StravaActivity[]
) {
  if (rawActivities.length === 0) {
    console.error('No activities to save');
    return;
  }

  let activities: Activity[];

  // Check if rawActivities is of type StravaActivity[]
  const isStravaActivity = (activity: any): activity is StravaActivity =>
    'resource_state' in activity && 'athlete' in activity;

  if (isStravaActivity(rawActivities[0])) {
    // Adapt StravaActivity[] to Activity[]
    activities = adaptActivities(rawActivities as StravaActivity[]);
  } else {
    activities = rawActivities;
  }

  try {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activities }),
    });

    if (!res.ok) throw new Error(await res.text());
    alert('Activities saved successfully!');
  } catch (error) {
    console.error('Error saving activities:', error);
    alert('Failed to save activities.');
  }
}

export async function getActivities(): Promise<Activity[]> {
  try {
    const res = await fetch('/api/activities', {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    });

    const { results } = (await res.json()) as { results: Activity[] };
    return results;
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
}
