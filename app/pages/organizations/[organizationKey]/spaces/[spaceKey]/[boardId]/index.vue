<template>
  <BoardPage
    :board-id="boardId"
    :deps="deps"
    :issue-key="issueKey"
    :on-back="onBack"
    :on-create-issue="onCreateIssue"
    :on-issue-dirty-change="setIssueDirty"
    :on-issue-moved="onIssueMoved"
    :on-push-query="onPushQuery"
    :on-replace-query="onReplaceQuery"
    :route-path="route.path"
    :route-query="route.query"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate, type LocationQueryRaw } from 'vue-router'

import BoardPage from '~/sections/boards/board/BoardPage.vue'
import { createBoardPageDeps } from '~/sections/boards/board/deps-impl'
import type { IssuePageSavedIssue } from '~/sections/issues/issue/IssuePage.types'

const route = useRoute('organizations-organizationKey-spaces-spaceKey-boardId')
const boardId = computed(() => String(route.params.boardId))
const spaceKey = computed(() => String(route.params.spaceKey))
const issueKey = computed(() => (typeof route.query.issue === 'string' ? route.query.issue : null))
const issueDirty = ref(false)
const { confirmUnsavedChanges } = useUnsavedChangesWarning(issueDirty)
const setIssueDirty = (dirty: boolean) => (issueDirty.value = dirty)
onBeforeRouteUpdate(
  (to) => (to.path === route.path && to.query.issue === issueKey.value) || confirmUnsavedChanges(),
)
const client = useApiClient()
const deps = createBoardPageDeps(client)
const router = useRouter()
const onBack = () => router.back()
const organizationRoutes = useOrganizationRoutes()
const onCreateIssue = async (statusId: string): Promise<void> => {
  await navigateTo({
    ...organizationRoutes.newBoardIssue(spaceKey.value, boardId.value),
    query: { statusId },
  })
}
const onIssueMoved = async (issue: IssuePageSavedIssue): Promise<void> => {
  await router.replace({
    ...organizationRoutes.board(issue.spaceKey, issue.boardId),
    query: { ...route.query, issue: issue.issueKey },
  })
}
const onPushQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.push({ query })
}
const onReplaceQuery = async (query: LocationQueryRaw): Promise<void> => {
  await router.replace({ query })
}
</script>
