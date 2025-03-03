<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import { api } from '$lib/api';
  import ActivityList from '$lib/components/ActivityList.svelte';
  import { onMount } from 'svelte';
  import type { Activity } from '$lib/types';
  import { typewriter } from '$lib/transitions';

  type Stats = {
    currentStreak: number;
    totalWorkouts: number;
    remainingDays: number;
  };

  let stats: Stats = {
    currentStreak: 0,
    totalWorkouts: 0,
    remainingDays: 0,
  };

  function getCurrentStreak(activityLog: Record<string, number>): number {
    const dates = Object.keys(activityLog)
      .map((date) => new Date(date)) // Convert to Date objects
      .sort((a, b) => b.getTime() - a.getTime()); // Sort from latest to earliest

    let streak = 0;
    let today = new Date(2025, 2, 13);
    today.setHours(0, 0, 0, 0); // Normalize time

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        // If the latest entry is today, continue the streak
        if (dates[i].getTime() === today.getTime()) {
          streak++;
        } else {
          break; // Streak does not include today
        }
      } else {
        // Check if this date is exactly one day before the previous date
        const prevDate = dates[i - 1];
        const currentDate = dates[i];

        const diffInDays =
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffInDays === 1) {
          streak++;
        } else {
          break; // Streak is broken
        }
      }
    }

    return streak;
  }

  // Calculate stats
  const calculateStats = (activities: Activity[]) => {
    // Add date from datetime for each activity
    activities.forEach((activity) => {
      const dateTime = new Date(activity.start_date);
      activity.date = dateTime.toISOString().split('T')[0];
      // activity.date = dateTime.toDateString();
    });

    console.log('activities:', activities);

    const today = new Date();
    const startDate = new Date(new Date().getFullYear(), 1, 1);
    const endDate = new Date(new Date().getFullYear(), 11, 31);

    // Sort workouts by date
    const sortedWorkouts = [...activities].sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    // Group and count the number of activities by date
    const activitiesByDate = sortedWorkouts.reduce(
      (acc, activity) => {
        const date = activity.date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('Activities by Date: ', activitiesByDate);

    // Calculate current streak
    let streak = getCurrentStreak(activitiesByDate);
    /*
    let streak = 0;
    let currentDate = new Date(sortedWorkouts[0].start_date);

    for (let workout of sortedWorkouts) {
      const workoutDate = new Date(workout.start_date);
      const dayDiff = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff <= 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }*/

    return {
      currentStreak: streak,
      totalWorkouts: activities.length,
      remainingDays: Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  };

  onMount(async () => {
    const activities = await api.getActivities();
    stats = calculateStats(activities);
  });
</script>

<div class="min-h-screen">
  <div class="fixed right-4 top-4 z-10">
    <LanguageSwitcher />
  </div>
  <main class="container mx-auto px-4 py-10">
    {#await api.getActivities() then activities}
      <h1 class="mb-12 text-center text-5xl font-bold" transition:typewriter>{m.title()}</h1>
      <div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
        <!-- Current Streak -->
        <div class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg">
          <h2 class="mb-2 text-2xl font-semibold">
            {m.current_streak_title()}
          </h2>
          <p class="text-6xl font-bold">
            {stats.currentStreak}
          </p>
          <p class="mt-2 text-lg">{m.current_streak_unit()}</p>
        </div>

        <!-- Total Workouts -->
        <div class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg">
          <h2 class="mb-2 text-2xl font-semibold">
            {m.total_workouts_title()}
          </h2>
          <p class="text-6xl font-bold">
            {stats.totalWorkouts}
          </p>
          <p class="mt-2 text-lg">{m.total_workouts_unit()}</p>
        </div>

        <!-- Remaining Days -->
        <div class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg">
          <h2 class="mb-2 text-2xl font-semibold">
            {m.days_remaining_title()}
          </h2>
          <p class="text-6xl font-bold">
            {stats.remainingDays}
          </p>
          <p class="mt-2 text-lg">{m.days_remaining_unit()}</p>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mx-auto mt-16 max-w-4xl">
        <h2 class="mb-6 text-3xl font-bold">{m.recent_activity_title()}</h2>

        <div class="rounded-xl bg-white/10 p-6 backdrop-blur-lg">
          <ActivityList {activities} />
        </div>
      </div>
    {/await}
  </main>
</div>
