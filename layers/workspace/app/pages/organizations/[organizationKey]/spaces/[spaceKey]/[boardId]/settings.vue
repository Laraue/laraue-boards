<template>
  <BoardSettingsPage
    :board-id="boardId"
    :deps="deps"
    :on-deleted="onDeleted"
    :on-saved="onSaved"
    :organization-routes="organizationRoutes"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navigateTo, useRoute } from '#app'
import { createBoardSettingsPageDeps } from '#layers/workspace/app/sections/boards/board-settings/BoardSettingsPage.deps.impl'
import BoardSettingsPage from '#layers/workspace/app/sections/boards/board-settings/BoardSettingsPage.vue'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId-settings')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
const deps = createBoardSettingsPageDeps(client)
const onDeleted = async (): Promise<void> => {
  await navigateTo(organizationRoutes.space(spaceKey.value))
}
const onSaved = async (): Promise<void> => {
  await navigateTo(organizationRoutes.board(spaceKey.value, boardId.value))
}
</script>
