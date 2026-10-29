<template>
  <RetroListPage
    :deps="deps"
    :on-open="onOpen"
    :on-update-query="onUpdateQuery"
    :organization-routes="organizationRoutes"
    :route-query="route.query" />
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

import { navigateTo, useRoute, useRouter } from '#app'
import { createRetroListPageDeps } from '#layers/workspace/app/sections/retro/retro-list/RetroListPage.deps.impl'
import RetroListPage from '#layers/workspace/app/sections/retro/retro-list/RetroListPage.vue'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useRetroApiClient } from '#layers/workspace/app/shared/composables/useRetroApiClient'

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
