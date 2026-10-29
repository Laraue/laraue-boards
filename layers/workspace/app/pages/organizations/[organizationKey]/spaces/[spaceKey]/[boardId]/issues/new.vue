<template>
  <CreateBoardIssuePage
    :board-id="boardId"
    :deps="deps"
    :initial-status-id="initialStatusId"
    :on-created="onCreated"
    :organization-routes="organizationRoutes"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { createCreateBoardIssuePageDeps } from '#layers/workspace/app/sections/boards/create-issue/CreateBoardIssuePage.deps.impl'
import CreateBoardIssuePage from '#layers/workspace/app/sections/boards/create-issue/CreateBoardIssuePage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId-issues-new')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createCreateBoardIssuePageDeps(client)
const initialStatusId = computed(() =>
  typeof route.query.statusId === 'string' ? route.query.statusId : undefined,
)
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.board(spaceKey.value, boardId.value))
}
</script>
