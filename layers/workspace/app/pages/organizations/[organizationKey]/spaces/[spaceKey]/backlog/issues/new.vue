<template>
  <CreateBacklogIssuePage
    :deps="deps"
    :on-created="onCreated"
    :organization-routes="organizationRoutes"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { createCreateBacklogIssuePageDeps } from '#layers/workspace/app/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.deps.impl'
import CreateBacklogIssuePage from '#layers/workspace/app/sections/spaces/create-backlog-issue/CreateBacklogIssuePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-backlog-issues-new')
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createCreateBacklogIssuePageDeps(client)
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.backlog(spaceKey.value))
}
</script>
