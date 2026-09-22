<template>
  <CreateAttributePage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import CreateAttributePage from '~/sections/organizations/attributes/create-attribute/CreateAttributePage.vue'
import { createCreateAttributePageDeps } from '~/sections/organizations/attributes/create-attribute/deps-impl'

const client = useApiClient()
const deps = createCreateAttributePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.attributes())
}
</script>
