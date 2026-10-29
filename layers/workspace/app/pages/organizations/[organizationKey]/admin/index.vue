<template>
  <OrganizationSettingsPage
    :deps="deps"
    :on-deleted="onDeleted"
    :on-updated="onUpdated" />
</template>

<script setup lang="ts">
import { clearNuxtData, navigateTo } from '#app'
import { createOrganizationSettingsPageDeps } from '#layers/workspace/app/sections/organizations/admin/OrganizationSettingsPage.deps.impl'
import OrganizationSettingsPage from '#layers/workspace/app/sections/organizations/admin/OrganizationSettingsPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import {
  appLayoutDataKey,
  refreshAppLayoutData,
} from '#layers/workspace/app/shells/organization/useAppLayoutData'

const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createOrganizationSettingsPageDeps(client)
const onDeleted = async (): Promise<void> => {
  clearNuxtData(appLayoutDataKey)
  await navigateTo('/organizations')
}
const onUpdated = async (): Promise<void> => {
  await refreshAppLayoutData()
}
</script>
