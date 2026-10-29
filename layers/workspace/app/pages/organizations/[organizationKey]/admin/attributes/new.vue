<template>
  <CreateAttributePage
    :deps="deps"
    :on-created="onCreated"
    :organization-routes="organizationRoutes" />
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { createCreateAttributePageDeps } from '#layers/workspace/app/sections/organizations/attributes/create-attribute/CreateAttributePage.deps.impl'
import CreateAttributePage from '#layers/workspace/app/sections/organizations/attributes/create-attribute/CreateAttributePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createCreateAttributePageDeps(client)
const organizationRoutes = useOrganizationRoutes()
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.attributes())
}
</script>
