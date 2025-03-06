<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import type { Stats } from '$lib/types';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let startAnimation: number = 0;
  export let stats: Stats;

  // Fixed variables applying to all
  // the transitions within this component
  let y: number = 200;
  let duration: number = 2000;
  let easing = cubicOut;
  let factor: number = 4;
</script>

<div class="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
  <!-- Total Workouts -->
  <div
    class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg"
    transition:fly={{
      y,
      easing,
      duration,
      delay: startAnimation + 0 * factor * 100,
    }}
  >
    <div
      class="bg-gradient-to-t from-slate-400 to-orange-600 bg-clip-text text-transparent"
    >
      <h2 class="mb-2 text-xl font-semibold">
        {m.total_workouts_title()}
      </h2>
      <p class="text-6xl font-bold">
        {stats.totalWorkouts}
      </p>
      <p class="mt-2 text-lg">{m.total_workouts_unit()}</p>
    </div>
  </div>

  <!-- Longest Streak -->
  <div
    class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg"
    transition:fly={{
      y,
      easing,
      duration,
      delay: startAnimation + 1 * factor * 100,
    }}
  >
    <div
      class="bg-gradient-to-t from-slate-400 to-teal-600 bg-clip-text text-transparent"
    >
      <h2 class="mb-2 text-xl font-semibold">
        {m.longest_streak_title()}
      </h2>
      <p class="text-6xl font-bold">
        {stats.longestStreak}
      </p>
      <p class="mt-2 text-lg">{m.longest_streak_unit()}</p>
    </div>
  </div>

  <!-- Skipped Days -->
  <div
    class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg"
    transition:fly={{
      y,
      easing,
      duration,
      delay: startAnimation + 2 * factor * 100,
    }}
  >
    <div
      class="bg-gradient-to-t from-slate-400 to-rose-600 bg-clip-text text-transparent"
    >
      <h2 class="mb-2 text-xl font-semibold">
        {m.skipped_days_title()}
      </h2>
      <p class="text-6xl font-bold">
        {stats.skippedDays}
      </p>
      <p class="mt-2 text-lg">{m.skipped_days_unit()}</p>
    </div>
  </div>

  <!-- Remaining Days -->
  <div
    class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg"
    transition:fly={{
      y,
      easing,
      duration,
      delay: startAnimation + 3 * factor * 100,
    }}
    on:introend={() => dispatch('animationEnd')}
  >
    <div
      class="bg-gradient-to-t from-slate-400 to-sky-600 bg-clip-text text-transparent"
    >
      <h2 class="mb-2 text-xl font-semibold">
        {m.days_remaining_title()}
      </h2>
      <p class="text-6xl font-bold">
        {stats.remainingDays}
      </p>
      <p class="mt-2 text-lg">{m.days_remaining_unit()}</p>
    </div>
  </div>
</div>
