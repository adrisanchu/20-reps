<script lang="ts">
  import * as m from '$lib/paraglide/messages.js';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import { getActivities } from '$lib/api';
  import ActivityList from '$lib/components/ActivityList.svelte';

  // Dummy dataset
  const challengeData = {
    startDate: '2024-01-01',
    workouts: [
      { date: '2024-01-01', type: 'Strength', duration: 45 },
      { date: '2024-01-02', type: 'Cardio', duration: 30 },
      { date: '2024-01-03', type: 'HIIT', duration: 35 },
      // ... more workouts
      { date: '2024-01-22', type: 'Yoga', duration: 60 },
    ],
  };

  // Calculate stats
  const calculateStats = () => {
    const today = new Date();
    const startDate = new Date(challengeData.startDate);
    const endDate = new Date(new Date().getFullYear(), 11, 31);

    // Sort workouts by date
    const sortedWorkouts = [...challengeData.workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate current streak
    let streak = 0;
    let currentDate = new Date(sortedWorkouts[0].date);

    for (let workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      const dayDiff = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff <= 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      totalWorkouts: challengeData.workouts.length,
      remainingDays: Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  };

  const stats = calculateStats();
</script>

<div class="min-h-screen">
  <div class="fixed right-4 top-4 z-10">
    <LanguageSwitcher />
  </div>
  <main class="container mx-auto px-4 py-10">
    <h1 class="mb-12 text-center text-5xl font-bold">{m.title()}</h1>
    <div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
      <!-- Current Streak -->
      <div class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg">
        <h2 class="mb-2 text-2xl font-semibold">{m.current_streak_title()}</h2>
        <p class="text-6xl font-bold">
          {stats.currentStreak}
        </p>
        <p class="mt-2 text-lg">{m.current_streak_unit()}</p>
      </div>

      <!-- Total Workouts -->
      <div class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg">
        <h2 class="mb-2 text-2xl font-semibold">{m.total_workouts_title()}</h2>
        <p class="text-6xl font-bold">
          {stats.totalWorkouts}
        </p>
        <p class="mt-2 text-lg">{m.total_workouts_unit()}</p>
      </div>

      <!-- Remaining Days -->
      <div class="rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg">
        <h2 class="mb-2 text-2xl font-semibold">{m.days_remaining_title()}</h2>
        <p class="text-6xl font-bold">
          {stats.remainingDays}
        </p>
        <p class="mt-2 text-lg">{m.days_remaining_unit()}</p>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mx-auto mt-16 max-w-4xl">
      <h2 class="mb-6 text-3xl font-bold">Recent Activity</h2>
      {#await getActivities() then activities}
        <div class="rounded-xl bg-white/10 p-6 backdrop-blur-lg">
          <ActivityList {activities} />
        </div>
      {/await}
    </div>
  </main>
</div>
