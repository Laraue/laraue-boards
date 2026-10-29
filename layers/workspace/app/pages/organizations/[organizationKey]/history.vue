<template>
  <OrganizationHistoryPage
    :deps="deps"
    :on-update-query="onUpdateQuery"
    :organization-routes="organizationRoutes"
    :route-query="route.query" />
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

import { navigateTo, useRoute } from '#app'
import { createOrganizationHistoryPageDeps } from '#layers/workspace/app/sections/organizations/history/OrganizationHistoryPage.deps.impl'
import OrganizationHistoryPage from '#layers/workspace/app/sections/organizations/history/OrganizationHistoryPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-history')
const deps = createOrganizationHistoryPageDeps(
  useApiClient({ onUnauthorized: useSignInRedirect() }),
)
const onUpdateQuery = async (query: LocationQueryRaw): Promise<void> => {
  await navigateTo({ query })
}

const organizationRoutes = useOrganizationRoutes()
</script>
