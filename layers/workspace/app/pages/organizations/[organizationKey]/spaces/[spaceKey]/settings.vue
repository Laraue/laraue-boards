<template>
  <SpaceSettingsPage
    :deps="deps"
    :on-deleted="onDeleted"
    :on-updated="onUpdated"
    :organization-routes="organizationRoutes"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { createSpaceSettingsPageDeps } from '#layers/workspace/app/sections/spaces/space-settings/SpaceSettingsPage.deps.impl'
import SpaceSettingsPage from '#layers/workspace/app/sections/spaces/space-settings/SpaceSettingsPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { refreshAppLayoutData } from '#layers/workspace/app/shells/organization/useAppLayoutData'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-settings')
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createSpaceSettingsPageDeps(client)
const onDeleted = async (): Promise<void> => {
  await refreshAppLayoutData()
  await navigateTo(organizationRoutes.issues())
}
const onUpdated = async (newSpaceKey: string): Promise<void> => {
  await refreshAppLayoutData()
  await navigateTo(organizationRoutes.space(newSpaceKey))
}
</script>
