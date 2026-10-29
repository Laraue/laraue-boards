<template>
  <AppBulkBar
    :action-label="t('moveToBoard')"
    :count="selected.size"
    :on-action="() => openMoveDialog([...selected])"
    :on-clear="() => selected.clear()" />
  <!-- Rows on the page itself, with no box around them: a data list (DESIGN.md, Surfaces). -->
  <div
    :aria-busy="filtering"
    class="issue-list"
    :class="{ 'results-stale': filtering }">
    <IssueListRow
      v-for="issue in issues"
      :key="issue.issueKey"
      :assignee="issue.assignee"
      :assignee-color="issue.assigneeColor"
      :assignee-id="issue.assigneeId"
      :assignee-initial="issue.assigneeInitial"
      :blocked="issue.blocked"
      :board-color="issue.boardColor"
      :board-id="issue.boardId"
      :board-name="issue.boardName"
      :can-move="issue.canMove"
      :deleting="deleting"
      :issue-key="issue.issueKey"
      :on-delete="deps.deleteIssue ? () => remove(issue.issueKey) : undefined"
      :on-move="() => openMoveDialog([issue.issueKey])"
      :on-toggle-selection="() => toggleSelection(issue.issueKey)"
      :on-updated="onMoved"
      :organization-routes="organizationRoutes"
      :quick-edit="deps.quickEdit"
      :selected="selected.has(issue.issueKey)"
      :selection-mode="selected.size > 0"
      :source="issue.source"
      :space-color="issue.spaceColor"
      :space-key="issue.spaceKey"
      :space-name="issue.spaceName"
      :status="issue.status"
      :status-category="issue.statusCategory"
      :status-color="issue.statusColor"
      :status-id="issue.statusId"
      :title="issue.title"
      :to="organizationRoutes.issue(issue.issueKey)" />
    <BaseEmptyState
      v-if="issues.length === 0"
      :hint="emptyHint"
      :title="emptyText" />
  </div>
  <p
    v-if="deleteMessage"
    class="form-error">
    {{ deleteMessage }}
  </p>
  <PaginationControl
    :has-next-page="hasNextPage"
    :page="page"
    @update:page="props.onUpdatePage" />
  <MoveIssuesDialog
    ref="moveDialog"
    :deps="deps.moveIssuesDialog"
    :excluded-board-id="excludedMoveBoardId"
    :on-moved="handleMoved" />
</template>

<script setup lang="ts">
import { computed, reactive, useTemplateRef } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseEmptyState from '#layers/core/app/ui/components/BaseEmptyState.vue'
import { useConfirm } from '#layers/core/app/ui/composables/useConfirm'
import IssueListRow from '#layers/workspace/app/sections/issues/shared/components/IssueList/components/IssueListRow.vue'
import MoveIssuesDialog from '#layers/workspace/app/sections/issues/shared/components/IssueList/components/move-issues-dialog/MoveIssuesDialog.vue'
import type { IssueListDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.deps'
import AppBulkBar from '#layers/workspace/app/shared/components/AppBulkBar.vue'
import PaginationControl from '#layers/workspace/app/shared/components/PaginationControl.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

import type { IssueListItem } from './IssueList.types'

const props = defineProps<{
  deps: IssueListDeps
  emptyHint?: string
  emptyText: string
  excludedMoveBoardId?: string
  filtering: boolean
  hasNextPage: boolean
  issues: IssueListItem[]
  onMoved: () => Promise<void> | void
  onUpdatePage: (value: number) => void
  organizationRoutes: OrganizationRoutes
  page: number
}>()

const confirm = useConfirm()
const { t } = useI18n({
  en: { deleteConfirm: 'Delete issue {key}?', moveToBoard: 'Move to board' },
  ru: { deleteConfirm: 'Удалить задачу {key}?', moveToBoard: 'Переместить на доску' },
})

const moveDialog = useTemplateRef('moveDialog')
const state = reactive({
  selected: new Set<string>(),
})
const selected = computed(() => state.selected)

const {
  execute: deleteIssue,
  message: deleteMessage,
  pending: deleting,
} = useApiAction(async (input: { issueKey: string }) => {
  await props.deps.deleteIssue?.(input)
})

const remove = async (issueKey: string) => {
  if (
    (await confirm({ danger: true, title: t('deleteConfirm', { key: issueKey }) })) &&
    (await deleteIssue({ issueKey }))
  ) {
    selected.value.delete(issueKey)
    await props.onMoved()
  }
}

const toggleSelection = (issueKey: string) => {
  if (selected.value.has(issueKey)) {
    selected.value.delete(issueKey)
  } else {
    selected.value.add(issueKey)
  }
}

const openMoveDialog = (ids: string[]) => {
  moveDialog.value?.open(ids)
}

const handleMoved = async () => {
  selected.value.clear()
  await props.onMoved()
}
</script>

<style scoped>
.results-stale {
  opacity: 0.55;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.issue-list {
  display: grid;
}
</style>
