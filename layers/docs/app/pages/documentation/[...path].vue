<template>
  <DocsPage
    :deps="deps"
    :locale="locale"
    :path="path" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useRequestFetch, useRoute } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { useLocale } from '#layers/core/app/i18n/useI18n'
import type { DocsFetcher } from '#layers/docs/app/DocsPage.deps.impl'
import { createDocsPageDeps } from '#layers/docs/app/DocsPage.deps.impl'
import DocsPage from '#layers/docs/app/DocsPage.vue'

definePageMeta({
  key: (route) => route.path,
  layout: 'landing',
})

const route = useRoute()
const locale = useLocale()
const path = computed(() => [route.params['path']].flat().filter(Boolean) as string[])

// `useRequestFetch()` is typed with every route of the app, which TypeScript cannot compare with a
// plain function type (excessive stack depth), so it is narrowed to what the docs use.
const deps = createDocsPageDeps(useRequestFetch() as unknown as DocsFetcher)
</script>
