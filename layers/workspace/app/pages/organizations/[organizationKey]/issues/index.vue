<template>
  <IssuesPage
    :deps="deps"
    :on-update-query="onUpdateQuery"
    :organization-key="organizationKey"
    :organization-routes="organizationRoutes"
    :route-query="route.query" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LocationQueryRaw } from 'vue-router'

import { useRoute, useRouter } from '#app'
import { createIssuesPageDeps } from '#layers/workspace/app/sections/issues/issues/IssuesPage.deps.impl'
import IssuesPage from '#layers/workspace/app/sections/issues/issues/IssuesPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-issues')
const organizationKey = computed(() => String(route.params.organizationKey))
const router = useRouter()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createIssuesPageDeps(client)
const onUpdateQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.replace({ query })
}

const organizationRoutes = useOrganizationRoutes()
</script>
