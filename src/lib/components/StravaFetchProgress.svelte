<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  interface Props {
    visible: boolean;
    currentChunk: number;
    totalChunks: number;
    activitiesFetched: number;
    message: string;
  }

  let {
    visible = false,
    currentChunk = 0,
    totalChunks = 1,
    activitiesFetched = 0,
    message = '',
  }: Props = $props();

  let progress = $derived(
    totalChunks > 0 ? (currentChunk / totalChunks) * 100 : 0
  );
</script>

{#if visible}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="mx-4 max-w-md rounded-xl bg-white/10 p-8 backdrop-blur-lg"
      transition:fly={{ y: 20, duration: 300, easing: cubicOut }}
    >
      <!-- Animated spinner -->
      <div class="mb-6 flex justify-center">
        <div
          class="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
        ></div>
      </div>

      <!-- Primary message -->
      <h3 class="mb-4 text-center text-2xl font-bold text-white">
        {message}
      </h3>

      <!-- Progress details -->
      <div class="space-y-3 text-center text-sm text-gray-300">
        {#if totalChunks > 1}
          <p>Processing chunk {currentChunk} of {totalChunks}</p>
        {/if}

        {#if activitiesFetched > 0}
          <p class="font-semibold text-orange-400">
            {activitiesFetched} activities collected
          </p>
        {/if}

        <p class="text-xs italic">Be patient, this can take some time...</p>
      </div>

      <!-- Progress bar (if multiple chunks) -->
      {#if totalChunks > 1}
        <div class="mt-6 overflow-hidden rounded-full bg-white/20">
          <div
            class="h-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
            style="width: {progress}%"
          ></div>
        </div>
      {/if}
    </div>
  </div>
{/if}
