<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { Activity, StravaActivity, StravaSportType } from '$lib/types';

  export let activities: Activity[] | StravaActivity[] = [];

  let activityColors: { [key in keyof typeof StravaSportType]: string } = {
    Ride: 'bg-yellow-400',
    GravelRide: 'bg-yellow-500',
    WeightTraining: 'bg-orange-500',
    AlpineSki: 'bg-sky-500',
    Kitesurf: 'bg-blue-600',
    Swim: 'bg-cyan-500',
    Yoga: 'bg-pink-500',
  };
</script>

<ul class="space-y-4">
  {#each activities as activity (activity.id)}
    <li class="flex flex-col border-b border-white/20 pb-4">
      <div class="flex justify-between">
        <Badge variant="secondary" class={activityColors[activity.sport_type]}
          >{activity.sport_type}</Badge
        >
        <p class="text-sm text-gray-300">
          {new Date(activity.start_date).toLocaleDateString()}
        </p>
      </div>
      <div class="flex justify-between text-lg font-semibold">
        <p>{activity.name}</p>
        <p>
          {Math.floor(activity.elapsed_time / 60)} min
        </p>
      </div>
    </li>
  {/each}
</ul>
