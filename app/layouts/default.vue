<template>
  <AppLayout
    :deps="deps"
    :on-logged-out="onLoggedOut"
    :organization-key="organizationKey">
    <slot />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '~/sections/common/app-layout/AppLayout.vue'
import { createAppLayoutDeps } from '~/sections/common/app-layout/deps-impl'

const { organizationKey } = useOrganizationRoutes()
const client = useApiClient()
const deps = createAppLayoutDeps(client)
const onLoggedOut = async (): Promise<void> => {
  clearNuxtData()
  await navigateTo('/')
}
</script>
