<template>
  <OrganizationSettingsPage
    :deps="deps"
    :on-deleted="onDeleted"
    :on-updated="onUpdated" />
</template>

<script setup lang="ts">
import { createOrganizationSettingsPageDeps } from '~/sections/organizations/settings/deps-impl'
import OrganizationSettingsPage from '~/sections/organizations/settings/OrganizationSettingsPage.vue'

const client = useApiClient()
const deps = createOrganizationSettingsPageDeps(client)
const onDeleted = async (): Promise<void> => {
  clearNuxtData(appLayoutDataKey)
  await navigateTo('/organizations')
}
const onUpdated = async (): Promise<void> => {
  await refreshAppLayoutData()
}
</script>
