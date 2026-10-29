<template>
  <BacklogPage
    :deps="deps"
    :on-update-query="onUpdateQuery"
    :organization-routes="organizationRoutes"
    :route-query="route.query"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LocationQueryRaw } from 'vue-router'

import { useRoute, useRouter } from '#app'
import { createBacklogPageDeps } from '#layers/workspace/app/sections/spaces/backlog/BacklogPage.deps.impl'
import BacklogPage from '#layers/workspace/app/sections/spaces/backlog/BacklogPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-backlog')
const spaceKey = computed(() => String(route.params.spaceKey))
const router = useRouter()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createBacklogPageDeps(client)
const onUpdateQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.replace({ query })
}

const organizationRoutes = useOrganizationRoutes()
</script>
