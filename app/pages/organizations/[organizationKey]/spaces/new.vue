<template>
  <CreateSpacePage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import CreateSpacePage from '~/sections/spaces/create-space/CreateSpacePage.vue'
import { createCreateSpacePageDeps } from '~/sections/spaces/create-space/deps-impl'

const client = useApiClient()
const deps = createCreateSpacePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onCreated = async (spaceKey: string): Promise<void> => {
  await refreshAppLayoutData()
  await navigateTo(organizationRoutes.space(spaceKey))
}
</script>
