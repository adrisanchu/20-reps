<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import { api } from '$lib/api';
  import ActivityList from '$lib/components/ActivityList.svelte';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import ActivityKpIs from '$lib/components/ActivityKPIs.svelte';
  import type { Stats } from '$lib/types';
  import { ActivitiesProcessor } from '$lib/activitiesProcessor';

  let mounted: boolean = false;
  let ready: boolean = false;
  let statsAnimated: boolean = false;
  let activitiesProcessor: ActivitiesProcessor;
  let challengeActivitiesProcessor: ActivitiesProcessor;

  let stats: Stats | undefined = undefined;

  // Calculate stats based on these dates
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');

  onMount(async () => {
    console.log('mounting page. Fetching data...');
    mounted = true;
    try {
      await api.getActivities().then((data) => {
      activitiesProcessor = new ActivitiesProcessor(data, startDate, endDate);
    });
    } catch (error) {
      console.error('Error fetching activities:', error);
    }

    console.log('activitiesProcessor: ', activitiesProcessor);

    // Get 20 Reps activities
    const regex = /W[0-9]+\s-\s[0-9]+ [A-Za-z]/;
    challengeActivitiesProcessor = new ActivitiesProcessor(
      activitiesProcessor.activities.filter((activity) =>
        regex.test(activity.name)
      ),
      startDate,
      endDate
    );

    stats = challengeActivitiesProcessor.getStats();
    console.log('stats: ', stats);
    ready = true;
    console.log('component mounted');
  });
</script>

<div class="min-h-screen">
  <div class="fixed right-4 top-4 z-10">
    <LanguageSwitcher />
  </div>
  <main class="container px-4 py-10">
    {#if mounted}
      <h1
        class="mb-10 bg-gradient-to-t from-orange-300 to-pink-600 bg-clip-text pb-2 text-center text-5xl
      font-bold text-transparent"
        transition:fly={{ y: 200, duration: 2000, delay: 80 }}
      >
        {m.title()}
      </h1>

      {#if ready && stats}
        <ActivityKpIs
          {stats}
          startAnimation={800}
          on:animationEnd={() => (statsAnimated = true)}
        />
      {/if}
      {#if statsAnimated}
        <!-- Recent Activity -->
        <div
          class="mx-auto mt-16 max-w-4xl"
          transition:fly={{
            y: 200,
            easing: cubicOut,
            duration: 2000,
            delay: 5,
          }}
        >
          <h2 class="mb-6 text-3xl font-bold">{m.recent_activity_title()}</h2>

          <div class="rounded-xl bg-white/10 p-6 backdrop-blur-lg">
            <ActivityList activities={activitiesProcessor.activities} />
          </div>
        </div>
      {/if}
    {/if}
  </main>
</div>
