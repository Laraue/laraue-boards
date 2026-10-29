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
    :organization-routes="organizationRoutes"
    :route-path="route.path"
    :route-query="route.query"
    :space-key="spaceKey" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onBeforeRouteUpdate, type LocationQueryRaw } from 'vue-router'

import { navigateTo, useRoute, useRouter } from '#app'
import { createBoardPageDeps } from '#layers/workspace/app/sections/boards/board/BoardPage.deps.impl'
import BoardPage from '#layers/workspace/app/sections/boards/board/BoardPage.vue'
import type { IssuePageSavedIssue } from '#layers/workspace/app/sections/issues/issue/IssuePage.deps'
import { useApiClient } from '#layers/workspace/app/shared/composables/useApiClient'
import { useOrganizationRoutes } from '#layers/workspace/app/shared/composables/useOrganizationRoutes'
import { useSignInRedirect } from '#layers/workspace/app/shared/composables/useSignInRedirect'
import { useUnsavedChangesWarning } from '#layers/workspace/app/shared/composables/useUnsavedChangesWarning'

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
const client = useApiClient({ onUnauthorized: useSignInRedirect() })
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
