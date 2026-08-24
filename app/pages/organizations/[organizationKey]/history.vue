<template>
  <OrganizationHistoryPage
    :deps="deps"
    :on-update-query="onUpdateQuery"
    :route-query="route.query" />
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'

import { createOrganizationHistoryPageDeps } from '~/sections/organizations/history/deps-impl'
import OrganizationHistoryPage from '~/sections/organizations/history/OrganizationHistoryPage.vue'

const route = useRoute('organizations-organizationKey-history')
const deps = createOrganizationHistoryPageDeps(useApiClient())
const onUpdateQuery = async (query: LocationQueryRaw): Promise<void> => {
  await navigateTo({ query })
}
</script>
