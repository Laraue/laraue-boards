<template>
  <AppLayout
    :deps="deps"
    :on-logged-out="onLoggedOut"
    :on-organization-switched="onOrganizationSwitched"
    :on-view-error="onViewError"
    :organization-key="organizationKey">
    <slot />
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '~/sections/common/app-layout/AppLayout.vue'
import { createAppLayoutDeps } from '~/sections/common/app-layout/deps-impl'

const { organizationKey } = useOrganizationRoutes()
const route = useRoute()
const client = useApiClient()
const deps = createAppLayoutDeps(client)
const onOrganizationSwitched = () => globalThis.location.reload()
const onViewError = async (code: number): Promise<void> => {
  // Shared key: a failed load left behind is what the next layout instance acts on.
  clearNuxtData(appLayoutDataKey)
  await navigateTo(
    code === 401 ? { path: '/', query: { redirect: route.fullPath } } : '/organizations',
  )
}
const onLoggedOut = async (): Promise<void> => {
  clearNuxtData()
  await navigateTo('/')
}
</script>
