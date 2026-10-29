<template>
  <CreateBoardPage
    :deps="deps"
    :on-created="onCreated"
    :organization-routes="organizationRoutes"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { createCreateBoardPageDeps } from '#layers/workspace/app/sections/boards/create-board/CreateBoardPage.deps.impl'
import CreateBoardPage from '#layers/workspace/app/sections/boards/create-board/CreateBoardPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boards-new')
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createCreateBoardPageDeps(client)
const onCreated = async (boardId: string): Promise<void> => {
  await navigateTo(organizationRoutes.board(spaceKey.value, boardId))
}
</script>
