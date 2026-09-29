<template>
  <DocsPage
    :key="path.join('/')"
    :deps="deps"
    :locale="locale"
    :path="path" />
</template>

<script setup lang="ts">
import { createDocsPageDeps } from '~/sections/docs/deps-impl'
import type { DocsFetcher } from '~/sections/docs/deps-impl/docsRequests'
import DocsPage from '~/sections/docs/DocsPage.vue'

definePageMeta({
  layout: 'landing',
  // Only /en/documentation and /ru/documentation exist; anything else is not found.
  validate: (route) => route.params['locale'] === 'en' || route.params['locale'] === 'ru',
})

const route = useRoute()
const locale = route.params['locale'] === 'ru' ? 'ru' : 'en'
const path = computed(() => [route.params['path']].flat().filter(Boolean) as string[])

// `useRequestFetch()` is typed with every route of the app, which TypeScript cannot compare with a
// plain function type (excessive stack depth), so it is narrowed to what the docs use.
const deps = createDocsPageDeps(useRequestFetch() as unknown as DocsFetcher)
</script>
