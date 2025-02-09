<script lang="ts">
  import { page } from '$app/state';
  import { Strava } from '$lib/strava';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import type { StravaActivity } from '$lib/types';
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

  let activities: StravaActivity[] = [];

  if (code !== '') {
    // Add temporary code to Strava class for further use
    stv.temporaryCode = code;
  }

  async function handleAccessToken() {
    const req = await stv.getAccessToken();
    accessToken = req;
  }

  async function handleRequestActivities() {
    // Get activities from start of 2025
    const startTime = new Date('2025-01-01').getTime() / 1000;
    let stravaActivities = await stv.getActivities(accessToken, startTime);
    console.log('activities', stravaActivities);
    activities = [...stravaActivities];
  }
</script>

<main class="flex flex-col justify-center max-w-xl mx-auto px-4 py-10">
  <h1 class="text-5xl font-bold text-center mb-12">Strava API</h1>

  <div class="flex flex-col gap-4">
    {#if !accessToken}
      <Button
        class="font-semibold text-foreground bg-orange-600"
        href={stv.getAuthorizeUrl().href}>Connect to Strava</Button
      >

      {#if code}
        <div class="w-full flex flex-col gap-2">
          <Label for="code">Code</Label>
          <Input
            placeholder="Code"
            type="text"
            name="code"
            id="code"
            bind:value={code}
            disabled
          />
          <p class="text-muted-foreground text-sm">
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
        <div class="w-full flex flex-col gap-2">
          <Label for="access-token">Access Token</Label>
          <Input
            placeholder="Access Token"
            type="password"
            name="access-token"
            id="access-token"
            bind:value={accessToken}
          />
          <p class="text-muted-foreground text-sm">
            This is the access token to be used when requesting data from
            Strava.
          </p>
        </div>
      {/if}
    {:else}
      <Separator />
      <div class="w-full flex flex-col gap-2">
        <h2 class="h2 mb-4">List of available queries</h2>
        <!-- Get Activities -->
        <Button
          variant="secondary"
          class="font-semibold"
          onclick={handleRequestActivities}>Get Activities</Button
        >
      </div>
    {/if}

    {#if activities.length > 0}
      <ActivityList {activities}></ActivityList>
    {/if}
  </div>
</main>
