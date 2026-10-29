<template>
  <AppLayout
    v-if="organizationKey"
    :deps="deps"
    :on-organization-switched="onOrganizationSwitched"
    :on-view-problem="onViewProblem"
    :organization-key="organizationKey"
    :organization-routes="organizationRoutes">
    <slot />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { clearNuxtData, createError, navigateTo, showError, useRoute } from '#app'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import type { OrganizationRouteName } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { createOrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'
import type { RoutableProblem } from '#layers/workspace/app/shells/organization/AppLayout.deps'
import { createAppLayoutDeps } from '#layers/workspace/app/shells/organization/AppLayout.deps.impl'
import AppLayout from '#layers/workspace/app/shells/organization/AppLayout.vue'
import { appLayoutDataKey } from '#layers/workspace/app/shells/organization/useAppLayoutData'

const route = useRoute<OrganizationRouteName>()
// While Nuxt switches layouts, this layout can still get the previous page's route, which may
// have no organization key (/organizations). It keeps the last key and waits for the first one.
let lastKey: string | undefined
const organizationKey = computed(() => {
  const value = route.params.organizationKey
  if (typeof value === 'string') {
    lastKey = value
  }
  return lastKey
})
const organizationRoutes = createOrganizationRoutes(() => organizationKey.value ?? '')
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
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
    case 'unknown-organization': {
      await navigateTo('/organizations')
    }
  }
}
</script>
