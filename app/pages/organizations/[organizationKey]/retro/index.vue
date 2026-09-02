<template>
  <RetroListPage
    :deps="deps"
    :on-open="onOpen"
    :on-update-query="onUpdateQuery"
    :route-query="route.query" />
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

import { createRetroListPageDeps } from '~/sections/retro/retro-list/deps-impl'
import RetroListPage from '~/sections/retro/retro-list/RetroListPage.vue'

const organizationRoutes = useOrganizationRoutes()
const route = useRoute('organizations-organizationKey-retro')
const router = useRouter()
const deps = createRetroListPageDeps(useRetroApiClient())
const onUpdateQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.replace({ query })
}
const onOpen = async (retroId: string): Promise<void> => {
  await navigateTo(organizationRoutes.retro(retroId))
}
</script>
