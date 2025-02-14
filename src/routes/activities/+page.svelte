<script lang="ts">
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import ActivityList from '$lib/components/ActivityList.svelte';
  import type { Activity } from '$lib/types';

  let myId: number;

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

  async function deleteActivity(id: number) {
    try {
      const res = await fetch(`/api/activities?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(await res.text());

      // Remove the deleted activity from the list
      activities = activities.filter((activity) => activity.id !== id);

      alert(`Activity ${id} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert(`Failed to delete activity ${id}.`);
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
    <div class="mt-2">
      <Label for="id" class="mb-2">Delete with an ID</Label>
      <div class="flex">
        <Input
          class="mr-2"
          type="number"
          name="id"
          id="id"
          bind:value={myId}
          placeholder="ID Number"
        />
        <Button
          class="bg-orange-600 font-semibold text-foreground"
          onclick={() => deleteActivity(myId)}>Delete Activity</Button
        >
      </div>
    </div>
  {/if}
</main>
