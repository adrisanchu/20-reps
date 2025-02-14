<script lang="ts">
  import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime';
  import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
  import { i18n } from '$lib/i18n';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  /**
   * @param { AvailableLanguageTag } newLanguage
   */
  function switchToLanguage(newLanguage: AvailableLanguageTag) {
    const canonicalPath = i18n.route(get(page).url.pathname);
    const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
    goto(localisedPath);
  }

  /**
   * Switches the language and navigates to the new localised version of the current page.
   * @function
   * @param { AvailableLanguageTag } newLanguage - The new language to switch to.
   */
  const labels = {
    en: '🇬🇧 EN',
    es: '🇪🇸 ES',
    fr: '🇫🇷 FR',
  };
</script>

<select
  class="rounded-md border-input bg-background px-2 py-2 text-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  on:change={(e) =>
    switchToLanguage(
      (e.target as HTMLSelectElement)?.value as AvailableLanguageTag
    )}
>
  {#each availableLanguageTags as langTag}
    <option
      class="text-5xl"
      value={langTag}
      selected={languageTag() === langTag}>{labels[langTag]}</option
    >
  {/each}
</select>
