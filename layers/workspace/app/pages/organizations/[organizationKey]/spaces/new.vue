<template>
  <CreateSpacePage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { createCreateSpacePageDeps } from '#layers/workspace/app/sections/spaces/create-space/CreateSpacePage.deps.impl'
import CreateSpacePage from '#layers/workspace/app/sections/spaces/create-space/CreateSpacePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { refreshAppLayoutData } from '#layers/workspace/app/shells/organization/useAppLayoutData'

const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createCreateSpacePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onCreated = async (spaceKey: string): Promise<void> => {
  await refreshAppLayoutData()
  await navigateTo(organizationRoutes.space(spaceKey))
}
</script>
