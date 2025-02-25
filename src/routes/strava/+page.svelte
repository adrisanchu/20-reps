<script lang="ts">
  import { page } from '$app/state';
  import { Strava } from '$lib/strava';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import type { StravaActivity } from '$lib/types';
  import { api } from '$lib/api';
  import ActivityList from '$lib/components/ActivityList.svelte';

  // Init Strava API with client and secret
  const stv: Strava = new Strava(
    import.meta.env.VITE_STRAVA_CLIENT_ID,
    import.meta.env.VITE_STRAVA_CLIENT_SECRET
  );

  console.log('page', page.url);

  // Get temporary code after redirect from Strava
  let code: string = page.url.searchParams.get('code') || '';
  let accessToken: string = '';

  // Dates to filter getActivities query
  let dateFrom: string = '';
  let dateTo: string = '';
  let num: number = 100;

  let activities: StravaActivity[] = [];

  if (code !== '') {
    // Add temporary code to Strava class for further use
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
   * Handles the request for activities from Strava,
   * based on the provided date range.
   * @param from the date from
   * @param to the date to
   */
  async function handleRequestActivities(from?: string, to?: string, qty?: number) {
    // Extract params to query based on dates
    const startTime = from ? new Date(from).getTime() / 1000 : undefined;
    const endTime = to ? new Date(to).getTime() / 1000 : undefined;
    const perPage = qty ? qty : undefined;

    let stravaActivities = await stv.getActivities(accessToken, {
      after: startTime,
      before: endTime,
      per_page: perPage
    });
    console.log('activities', stravaActivities);
    activities = [...stravaActivities];
  }
</script>

<main class="mx-auto flex max-w-xl flex-col justify-center px-4 py-10">
  <h1 class="mb-12 text-center text-5xl font-bold">Strava API</h1>

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
            bind:value={code}
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
              min=1
              max=150
              id="qty"
              bind:value={num}
            />
          </div>
        </div>
        <Button
          variant="secondary"
          class="font-semibold"
          onclick={() => handleRequestActivities(dateFrom, dateTo, num)}
          >Get Activities</Button
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
          onclick={() => api.saveActivities(activities)}>Save Activities</Button
        >
      </div>
      <ActivityList {activities}></ActivityList>
    {/if}
  </div>
</main>
