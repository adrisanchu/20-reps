<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js';
  import type { StravaActivity } from '$lib/types';

  export let activities: StravaActivity[] = [];
</script>

<ul class="space-y-4">
  {#each activities as activity (activity.id)}
    <li class="flex flex-col border-b border-white/20 pb-4">
      <div class="flex justify-between">
        <Badge variant="secondary" class="bg-orange-500">{activity.type}</Badge>
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
