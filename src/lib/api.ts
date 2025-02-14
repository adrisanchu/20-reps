import type { Activity, StravaActivity } from '$lib/types';

export async function saveActivities(
  activities: Activity[] | StravaActivity[]
) {
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
