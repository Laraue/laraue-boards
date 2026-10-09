<template>
  <AppBulkBar
    :action-label="t('moveToBoard')"
    :count="selected.size"
    :on-action="() => openMoveDialog([...selected])"
    :on-clear="() => selected.clear()" />
  <BaseCard
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
      :board-id="issue.boardId"
      :board-name="issue.boardName"
      :can-move="issue.canMove"
      :deleting="deleting"
      :issue-key="issue.issueKey"
      :on-delete="deps.deleteIssue ? () => remove(issue.issueKey) : undefined"
      :on-move="() => openMoveDialog([issue.issueKey])"
      :on-toggle-selection="() => toggleSelection(issue.issueKey)"
      :on-updated="onMoved"
      :quick-edit="deps.quickEdit"
      :selected="selected.has(issue.issueKey)"
      :selection-mode="selected.size > 0"
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
  </BaseCard>
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
import IssueListRow from '~/components/issue-list/components/IssueListRow.vue'
import MoveIssuesDialog from '~/components/issue-list/components/move-issues-dialog/MoveIssuesDialog.vue'
import type { IssueListDeps } from '~/components/issue-list/IssueList.deps'

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
  page: number
}>()

const confirm = useConfirm()
const { t } = useI18n({
  en: { deleteConfirm: 'Delete issue {key}?', moveToBoard: 'Move to board' },
  ru: { deleteConfirm: 'Удалить задачу {key}?', moveToBoard: 'Переместить на доску' },
})

const organizationRoutes = useOrganizationRoutes()
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
.issue-list {
  display: grid;
}
</style>
