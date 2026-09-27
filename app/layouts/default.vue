<template>
  <AppLayout
    :deps="deps"
    :on-logged-out="onLoggedOut"
    :on-organization-switched="onOrganizationSwitched"
    :on-view-problem="onViewProblem"
    :organization-key="organizationKey">
    <slot />
  </AppLayout>
</template>

<script setup lang="ts">
import type { RoutableProblem } from '~/sections/common/app-layout/AppLayout.deps'
import AppLayout from '~/sections/common/app-layout/AppLayout.vue'
import { createAppLayoutDeps } from '~/sections/common/app-layout/deps-impl'

const { organizationKey } = useOrganizationRoutes()
const route = useRoute()
const client = useApiClient()
const deps = createAppLayoutDeps(client)
const onOrganizationSwitched = () => globalThis.location.reload()
const onViewProblem = async (problem: RoutableProblem): Promise<void> => {
  clearNuxtData(appLayoutDataKey)
  switch (problem.kind) {
    case 'load-failed': {
      showError(createError({ statusCode: problem.code || 500 }))
      return
    }
    case 'no-access': {
      showError(createError({ statusCode: 403 }))
      return
    }
    case 'signed-out': {
      await navigateTo({ path: '/', query: { redirect: route.fullPath } })
      return
    }
    case 'unknown-organization': {
      await navigateTo('/organizations')
    }
  }
}
const onLoggedOut = async (): Promise<void> => {
  clearNuxtData()
  await navigateTo('/')
}
</script>
