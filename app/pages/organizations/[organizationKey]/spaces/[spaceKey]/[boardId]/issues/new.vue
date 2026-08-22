<template>
  <CreateBoardIssuePage
    :board-id="boardId"
    :deps="deps"
    :initial-status-id="initialStatusId"
    :on-created="onCreated"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import CreateBoardIssuePage from '~/sections/boards/create-issue/CreateBoardIssuePage.vue'
import { createCreateBoardIssuePageDeps } from '~/sections/boards/create-issue/deps-impl'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId-issues-new')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const organizationRoutes = useOrganizationRoutes()
const client = useApiClient()
const deps = createCreateBoardIssuePageDeps(client)
const initialStatusId = computed(() =>
  typeof route.query.statusId === 'string' ? route.query.statusId : undefined,
)
const onCreated = async (): Promise<void> => {
  await navigateTo(organizationRoutes.board(spaceKey.value, boardId.value))
}
</script>
