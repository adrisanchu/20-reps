<script lang="ts">
  import { page } from '$app/state';
  import { Strava } from '$lib/strava';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import type { StravaActivity, FetchProgress } from '$lib/types';
  import { api } from '$lib/api';
  import ActivityList from '$lib/components/ActivityList.svelte';
  import StravaFetchProgress from '$lib/components/StravaFetchProgress.svelte';

  // Init Strava API with client and secret
  const stv: Strava = new Strava(
    import.meta.env.VITE_STRAVA_CLIENT_ID,
    import.meta.env.VITE_STRAVA_CLIENT_SECRET
  );

  // Get temporary code after redirect from Strava (read once from URL, doesn't need reactivity)
  const code = page.url.searchParams.get('code') || '';

  // Access token needs to be reactive as it's updated by handleAccessToken()
  let accessToken = $state('');

  // Dates to filter getActivities query (reactive for two-way binding with inputs)
  let dateFrom = $state('');
  let dateTo = $state('');
  let num = $state(100);

  // Activities array (reactive as it's updated by fetch)
  let activities = $state<StravaActivity[]>([]);

  // Progress tracking state
  let isFetching = $state(false);
  let fetchProgress = $state({
    currentChunk: 0,
    totalChunks: 1,
    activitiesFetched: 0,
    message: 'Preparing to fetch activities...',
  });

  // Set temporary code immediately (runs once on component init)
  if (code !== '') {
    stv.temporaryCode = code;
  }

  /**
   Handles the accessToken request to Strava,
   * and sets the accessToken on the Strava instance.
   */
  async function handleAccessToken(): Promise<void> {
    const req = await stv.getAccessToken();
    accessToken = req;
  }

  /**
   * Handles the request for activities from Strava with chunking and retry logic.
   * Shows progress UI and handles errors gracefully.
   * @param from the date from
   * @param to the date to
   * @param qty the quantity of activities to fetch
   */
  async function handleRequestActivities(
    from?: string,
    to?: string,
    qty?: number
  ) {
    // Reset state
    isFetching = true;
    activities = [];
    fetchProgress = {
      currentChunk: 0,
      totalChunks: 1,
      activitiesFetched: 0,
      message: 'Collecting activities from Strava...',
    };

    try {
      // Convert dates to Unix timestamps
      const startTime = from ? new Date(from).getTime() / 1000 : undefined;
      const endTime = to ? new Date(to).getTime() / 1000 : undefined;
      const perPage = qty ? qty : undefined;

      // Fetch with progress tracking
      const stravaActivities = await stv.getActivitiesWithChunking(
        accessToken,
        {
          after: startTime,
          before: endTime,
          per_page: perPage,
        },
        // Progress callback
        (progress: FetchProgress) => {
          fetchProgress = progress;
        }
      );

      activities = [...stravaActivities];

      // Success message
      fetchProgress.message = `Successfully loaded ${activities.length} activities!`;

      // Keep success message visible briefly before hiding overlay
      setTimeout(() => {
        isFetching = false;
      }, 1000);
    } catch (error) {
      console.error('Error fetching activities:', error);

      // User-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      alert(
        `Failed to fetch activities: ${errorMessage}\n\nPlease try again or use a smaller date range.`
      );

      isFetching = false;
    }
  }
</script>

<main class="mx-auto flex max-w-xl flex-col justify-center px-4 py-10">
  <h1 class="mb-12 text-center text-5xl font-bold">Strava API</h1>

  <!-- Progress overlay -->
  <StravaFetchProgress
    visible={isFetching}
    currentChunk={fetchProgress.currentChunk}
    totalChunks={fetchProgress.totalChunks}
    activitiesFetched={fetchProgress.activitiesFetched}
    message={fetchProgress.message}
  />

  <div class="flex flex-col gap-4">
    {#if !accessToken}
      <Button
        class="bg-orange-600 font-semibold text-foreground"
        href={stv.getAuthorizeUrl().href}>Connect to Strava</Button
      >

      {#if code}
        <div class="flex w-full flex-col gap-2">
          <Label for="code">Code</Label>
          <Input
            placeholder="Code"
            type="text"
            name="code"
            id="code"
            value={code}
            disabled
          />
          <p class="text-sm text-muted-foreground">
            This is a one time use code.
          </p>
        </div>
      {/if}
      {#if stv.temporaryCode}
        <Button
          variant="default"
          class="font-semibold"
          onclick={handleAccessToken}>Get Access Token</Button
        >
        <div class="flex w-full flex-col gap-2">
          <Label for="access-token">Access Token</Label>
          <Input
            placeholder="Access Token"
            type="password"
            name="access-token"
            id="access-token"
            bind:value={accessToken}
          />
          <p class="text-sm text-muted-foreground">
            This is the access token to be used when requesting data from
            Strava.
          </p>
        </div>
      {/if}
    {:else}
      <Separator />
      <div class="flex w-full flex-col gap-2">
        <h2 class="h2 mb-4">List of available queries</h2>

        <!-- Get Activities -->
        <h3 class="h3 mb-2">Get Activities</h3>
        <div class="mb-2 flex justify-evenly space-x-4">
          <div class="w-full space-y-2">
            <Label for="date-from">Date from:</Label>
            <Input
              class="bg-white/10 text-white dark:[color-scheme:dark]"
              placeholder="Date from"
              type="date"
              name="date-from"
              id="date-from"
              bind:value={dateFrom}
            />
          </div>
          <div class="w-full space-y-2">
            <Label for="date-to">Date to:</Label>
            <Input
              class="bg-white/10 text-white dark:[color-scheme:dark]"
              placeholder="Date to"
              type="date"
              name="date-to"
              id="date-to"
              bind:value={dateTo}
            />
          </div>
          <div class="w-full space-y-2">
            <Label for="qty">Quantity:</Label>
            <Input
              class="bg-white/10 text-white dark:[color-scheme:dark]"
              type="number"
              name="quantity"
              min="1"
              max="150"
              id="qty"
              bind:value={num}
            />
          </div>
        </div>
        <Button
          variant="secondary"
          class="font-semibold"
          onclick={() => handleRequestActivities(dateFrom, dateTo, num)}
          disabled={isFetching}
          >{isFetching ? 'Fetching...' : 'Get Activities'}</Button
        >
      </div>
    {/if}

    {#if activities.length > 0}
      <Separator />
      <div class="mb-4 flex items-end justify-between space-x-2">
        <p class="text-muted-foreground">
          Showing {activities.length} activities.
        </p>
        <Button
          class="bg-sky-500 font-semibold text-foreground"
          onclick={() => api.saveActivities(activities)}
          disabled={isFetching}
          >Save Activities</Button
        >
      </div>
      <ActivityList {activities}></ActivityList>
    {/if}
  </div>
</main>
