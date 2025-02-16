<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { StravaSportType } from '$lib/types';

  let activities: {
    id: number;
    name: string;
    sport_type: StravaSportType;
  }[] = [
    {
      id: 1,
      name: 'Activity 1',
      sport_type: 'Ride',
    },
    {
      id: 2,
      name: 'Activity 2',
      sport_type: 'GravelRide',
    },
    {
      id: 3,
      name: 'Activity 3',
      sport_type: 'WeightTraining',
    },
    {
      id: 4,
      name: 'Activity 4',
      sport_type: 'AlpineSki',
    },

    {
      id: 5,
      name: 'Activity 5',
      sport_type: 'Kitesurf',
    },
    {
      id: 6,
      name: 'Activity 6',
      sport_type: 'Swim',
    },
    {
      id: 7,
      name: 'Activity 7',
      sport_type: 'Yoga',
    },
  ];

  let activityColors: { [key in StravaSportType]: string } = {
    Ride: 'bg-yellow-400',
    GravelRide: 'bg-yellow-500',
    WeightTraining: 'bg-orange-500',
    AlpineSki: 'bg-sky-500',
    Kitesurf: 'bg-blue-600',
    Swim: 'bg-cyan-500',
    Yoga: 'bg-pink-500',
  };
</script>

<div class="min-h-screen">
  <main class="container mx-auto px-4 py-10">
    <h1 class="mb-12 text-center text-5xl font-bold">{m.settings_title()}</h1>
    <h2 class="text-3xl font-bold">{m.settings_sports_title()}</h2>
    <ul class="mt-4 space-y-4">
      {#each activities as activity (activity.id)}
        <li class="b-4 flex flex-col">
          <div class="flex justify-between">
            <Badge
              variant="secondary"
              class={activityColors[activity.sport_type]}
              >{activity.sport_type}</Badge
            >
          </div>
        </li>
      {/each}
    </ul>
  </main>
</div>
