<script>
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
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Calculate current streak
    let streak = 0;
    let currentDate = new Date(sortedWorkouts[0].date);

    for (let workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      const dayDiff = Math.floor(
        (currentDate - workoutDate) / (1000 * 60 * 60 * 24)
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
      remainingDays: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
    };
  };

  const stats = calculateStats();
</script>

<div class="min-h-screen">
  <main class="container mx-auto px-4 py-16">
    <h1 class="text-5xl font-bold text-center mb-12">20 Reps Challenge</h1>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <!-- Current Streak -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
        <h2 class="text-2xl font-semibold mb-2">Current Streak</h2>
        <p class="text-6xl font-bold">
          {stats.currentStreak}
        </p>
        <p class="text-lg mt-2">days</p>
      </div>

      <!-- Total Workouts -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
        <h2 class="text-2xl font-semibold mb-2">Total Workouts</h2>
        <p class="text-6xl font-bold">
          {stats.totalWorkouts}
        </p>
        <p class="text-lg mt-2">completed</p>
      </div>

      <!-- Remaining Days -->
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
        <h2 class="text-2xl font-semibold mb-2">Days Remaining</h2>
        <p class="text-6xl font-bold">
          {stats.remainingDays}
        </p>
        <p class="text-lg mt-2">to go</p>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-16 max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold mb-6">Recent Activity</h2>
      <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6">
        <ul class="space-y-4">
          {#each challengeData.workouts.slice(0, 5) as workout}
            <li
              class="flex justify-between items-center border-b border-white/20 pb-4"
            >
              <div>
                <p class="font-semibold">{workout.type}</p>
                <p class="text-sm text-gray-300">
                  {new Date(workout.date).toLocaleDateString()}
                </p>
              </div>
              <p class="text-lg">{workout.duration} min</p>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </main>
</div>
