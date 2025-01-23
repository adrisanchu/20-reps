<script lang="ts">
  import { Strava } from '$lib/strava';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Label } from '$lib/components/ui/label/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { page } from '$app/state';

  // Init Strava API with client and secret
  const stv: Strava = new Strava(
    import.meta.env.VITE_STRAVA_CLIENT_ID,
    import.meta.env.VITE_STRAVA_CLIENT_SECRET
  );

  console.log('page', page.url);

  // Get temporary code after redirect from Strava
  let code: string = page.url.searchParams.get('code') || '';
  let accessToken: string = '';

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
    const activities = await stv.getActivities(accessToken, startTime);
    console.log('activities', activities);
  }
</script>

<main class="flex flex-col justify-center max-w-xl mx-auto px-4 py-10">
  <h1 class="text-5xl font-bold text-center mb-12">Strava API</h1>

  <div class="flex flex-col gap-4">
    <Button
      class="font-semibold text-foreground bg-orange-600"
      href={stv.getAuthorizeUrl().href}>Connect to Strava</Button
    >

    <div class="w-full flex flex-col gap-2">
      <Label for="code">Code</Label>
      <Input
        placeholder="Code"
        type="text"
        name="code"
        id="code"
        bind:value={code}
      />
      <p class="text-muted-foreground text-sm">This is a one time use code.</p>
    </div>
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
          type="text"
          name="access-token"
          id="access-token"
          bind:value={accessToken}
        />
        <p class="text-muted-foreground text-sm">
          This is the access token to be used when requesting data from Strava.
        </p>
      </div>
    {/if}

    {#if accessToken}
      <Button
        variant="secondary"
        class="font-semibold"
        onclick={handleRequestActivities}>Get Activities</Button
      >
    {/if}
  </div>
</main>
