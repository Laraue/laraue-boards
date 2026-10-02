<template>
  <OrganizationPickerPage
    :deps="deps"
    :on-selected="onSelected"
    :on-signed-out="onSignedOut" />
</template>

<script setup lang="ts">
import { createOrganizationPickerPageDeps } from '~/sections/organizations/select-organization/OrganizationPickerPage.deps.impl'
import OrganizationPickerPage from '~/sections/organizations/select-organization/OrganizationPickerPage.vue'

definePageMeta({ layout: false })
const client = useApiClient()
const deps = createOrganizationPickerPageDeps(client)
const onSignedOut = async (): Promise<void> => {
  await navigateTo({ path: '/login', query: { redirect: '/organizations' } })
}
const onSelected = async (organizationKey: string): Promise<void> => {
  await navigateTo({
    name: 'organizations-organizationKey-issues',
    params: { organizationKey },
  })
}
</script>
