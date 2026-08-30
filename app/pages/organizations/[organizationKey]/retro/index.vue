<template>
  <RetroListPage
    :deps="deps"
    :on-open="onOpen" />
</template>

<script setup lang="ts">
import { createRetroListPageDeps } from '~/sections/retro/retro-list/deps-impl'
import RetroListPage from '~/sections/retro/retro-list/RetroListPage.vue'

const organizationRoutes = useOrganizationRoutes()
const deps = createRetroListPageDeps(useRetroApiClient())
const onOpen = async (retroId: string): Promise<void> => {
  await navigateTo(organizationRoutes.retro(retroId))
}
</script>
