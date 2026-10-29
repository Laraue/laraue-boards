<template>
  <OrganizationPickerPage
    :deps="deps"
    :on-selected="onSelected" />
</template>

<script setup lang="ts">
import { navigateTo } from '#app'
import { definePageMeta } from '#app/composables/pages'
import { createOrganizationPickerPageDeps } from '#layers/workspace/app/sections/organizations/select-organization/OrganizationPickerPage.deps.impl'
import OrganizationPickerPage from '#layers/workspace/app/sections/organizations/select-organization/OrganizationPickerPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

definePageMeta({ layout: 'account' })
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createOrganizationPickerPageDeps(client)
const onSelected = async (organizationKey: string): Promise<void> => {
  await navigateTo({
    name: 'organizations-organizationKey-issues',
    params: { organizationKey },
  })
}
</script>
