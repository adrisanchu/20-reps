<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import ActivityList from '$lib/components/ActivityList.svelte';

  import type { Activity } from '$lib/types';

  let activities = [
    {
      id: 13238591234,
      name: 'Primera del año',
      start_date: '2025-01-01T12:02:34Z',
      sport_type: 'GravelRide',
      distance: 19134.2,
      elapsed_time: 0,
      moving_time: 0,
      extra_data: {
        moving_time: 4388,
        elapsed_time: 7282,
        total_elevation_gain: 244,
      },
    },
    {
      id: 13238831929,
      name: 'W1 - 20 Reps',
      start_date: '2025-01-01T14:38:22Z',
      sport_type: 'WeightTraining',
      distance: 0,
      elapsed_time: 0,
      moving_time: 0,
      extra_data: { moving_time: 402, elapsed_time: 402 },
    },
  ];

  let activitiesFromDB: Activity[] = [];

  async function saveActivities() {
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities }),
      });

      if (!res.ok) throw new Error(await res.text());
      alert('Activities saved successfully!');
      // goto('/'); // Redirect or refresh page
    } catch (error) {
      console.error('Error saving activities:', error);
      alert('Failed to save activities.');
    }
  }

  async function getActivities() {
    try {
      const res = await fetch('/api/activities', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      });

      const { results } = (await res.json()) as { results: Activity[] };
      activitiesFromDB = results;
    } catch (error) {
      console.error('Error getting activities:', error);
    }
  }
</script>

<main class="mx-auto flex max-w-xl flex-col justify-center px-4 py-10">
  <div class="mb-4 space-x-2">
    <Button
      class="bg-sky-500 font-semibold text-foreground"
      onclick={saveActivities}>Save Activities</Button
    >
    <Button
      class="bg-orange-600 font-semibold text-foreground"
      onclick={getActivities}>Get Activities</Button
    >
  </div>

  {#if activitiesFromDB.length > 0}
    <ActivityList activities={activitiesFromDB}></ActivityList>
  {/if}
</main>
