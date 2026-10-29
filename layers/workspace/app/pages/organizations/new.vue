<template>
  <CreateOrganizationPage
    :deps="deps"
    :on-created="onCreated" />
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { createCreateOrganizationPageDeps } from '#layers/workspace/app/sections/organizations/create-organization/CreateOrganizationPage.deps.impl'
import CreateOrganizationPage from '#layers/workspace/app/sections/organizations/create-organization/CreateOrganizationPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

definePageMeta({ layout: 'account' })
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createCreateOrganizationPageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo('/organizations')
}
</script>
