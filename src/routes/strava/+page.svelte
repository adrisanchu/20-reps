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

  if (code !== '') {
    // Add temporary code to Strava class for further use
    stv.temporaryCode = code;
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
    </div>
  </div>
</main>
