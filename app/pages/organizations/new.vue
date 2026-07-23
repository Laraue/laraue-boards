<template>
  <CreateOrganizationPage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import CreateOrganizationPage from '~/sections/organizations/create-organization/CreateOrganizationPage.vue'
import { createCreateOrganizationPageDeps } from '~/sections/organizations/create-organization/deps-impl'

definePageMeta({ layout: false })
const client = useApiClient()
const deps = createCreateOrganizationPageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo('/organizations')
}
</script>
