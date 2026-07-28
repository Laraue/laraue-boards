<template>
  <OrganizationSettingsPage
    :deps="deps"
    :on-updated="onUpdated" />
</template>

<script setup lang="ts">
import { createOrganizationSettingsPageDeps } from '~/sections/organizations/settings/deps-impl'
import OrganizationSettingsPage from '~/sections/organizations/settings/OrganizationSettingsPage.vue'

const client = useApiClient()
const deps = createOrganizationSettingsPageDeps(client)
const onUpdated = async (): Promise<void> => {
  await refreshAppLayoutData()
}
</script>
