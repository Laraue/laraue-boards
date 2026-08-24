<template>
  <QueryState
    :data="viewModel"
    error-title="Could not load board"
    loading-text="Loading board…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="board-content">
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              label="Back to space"
              :to="organizationRoutes.space(spaceKey)" />
            <BoardIcon
              class="page-heading-icon"
              :style="{ color: page.color || undefined }" />
            <div class="page-heading-text">
              <h1>{{ page.title }}</h1>
            </div>
          </div>
          <div class="title-actions">
            <NuxtLink
              v-if="page.canUpdate || page.canDelete"
              aria-label="Board settings"
              class="secondary"
              :to="organizationRoutes.boardSettings(spaceKey, page.id)">
              <Settings />
              <span class="btn-label">Settings</span>
            </NuxtLink>
            <NuxtLink
              v-if="page.canCreateIssues"
              class="primary"
              :to="organizationRoutes.newBoardIssue(spaceKey, page.id)">
              <Plus />
              <span class="btn-label">Add issue</span>
            </NuxtLink>
          </div>
        </div>

        <div class="toolbar">
          <input
            aria-label="Search issues"
            placeholder="Search issues"
            type="search"
            :value="search"
            @input="updateSearch(($event.target as HTMLInputElement).value)" />
          <IssueFilters
            :attributes="page.attributes"
            :loading="state.filtering"
            :model-value="filterValue"
            @update:model-value="updateFilters" />
        </div>

        <p
          v-if="state.moveError"
          class="form-error"
          role="alert">
          {{ state.moveError }}
        </p>

        <DragDropProvider
          :plugins="plugins"
          :sensors="sensors"
          @drag-end="handleDragEnd"
          @drag-over="handleDragOver"
          @drag-start="handleDragStart">
          <div
            id="board-scroll-area"
            ref="board"
            :aria-busy="state.filtering || state.movingIssueKeys.size > 0"
            class="board"
            :class="{
              'board--dragging': state.dragging,
              'results-stale': state.filtering,
            }">
            <BoardColumn
              v-for="column in page.columns"
              :key="column.id"
              :can-create-issues="page.canCreateIssues"
              :can-move-issues="page.canMoveIssues"
              :load-more-error="state.loadMoreErrors.get(column.id) ?? null"
              :loading-more="state.loadingColumnIds.has(column.id)"
              :moving-issue-keys="state.movingIssueKeys"
              :on-create-issue="onCreateIssue"
              :on-load-more="loadMoreIssues"
              :on-move-to-backlog="moveToBacklog"
              :on-open-issue="openIssue"
              :view-model="column" />
          </div>
          <BoardScrollMap
            :column-count="page.columns.length"
            :target="board" />
        </DragDropProvider>
        <IssueDialog
          v-if="issueKey && !state.closingIssueDialog"
          :deps="deps.issueDialog"
          :issue-key="issueKey"
          :on-close="closeIssueDialog"
          :on-deleted="handleIssueDeleted"
          :on-dirty-change="onIssueDirtyChange"
          :on-saved="handleIssueSaved" />
      </section>
    </template>
  </QueryState>
</template>

<script lang="ts">
import type {
  LoadMoreBoardIssuesResult,
  SearchBoardIssuesResult,
  BoardPageViewModel,
} from '~/sections/boards/board/BoardPage.types'

const mergeRefreshedBoard = (
  board: BoardPageViewModel,
  refreshedColumns: ReadonlyMap<string, LoadMoreBoardIssuesResult>,
  summary?: SearchBoardIssuesResult,
): BoardPageViewModel => {
  const summaryColumns = new Map(summary?.columns.map((column) => [column.id, column]))
  const columns = board.columns.map((column) => {
    const refreshed = refreshedColumns.get(column.id)
    const refreshedSummary = summaryColumns.get(column.id)
    return refreshed
      ? {
          ...column,
          hasNext: refreshed.hasNext,
          issueCount: refreshedSummary?.issueCount ?? column.issueCount,
          issues: refreshed.issues,
        }
      : column
  })

  return {
    ...board,
    columns,
    issueCount: summary?.issueCount ?? board.issueCount,
  }
}
</script>

<script setup lang="ts">
import { defaultPreset, Feedback, PointerActivationConstraints } from '@dnd-kit/dom'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/vue'
import { Plus, Settings } from '@lucide/vue'
import { debounce } from 'es-toolkit'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import IssueFilters from '~/components/issue-filters/IssueFilters.vue'
import { BoardIcon } from '~/constants/icons'
import type { BoardPageDeps } from '~/sections/boards/board/BoardPage.deps'
import type { BoardPageFilterValue } from '~/sections/boards/board/BoardPage.types'
import BoardColumn from '~/sections/boards/board/components/BoardColumn/BoardColumn.vue'
import BoardScrollMap from '~/sections/boards/board/components/BoardScrollMap/BoardScrollMap.vue'
import type { IssuePageSavedIssue } from '~/sections/issues/issue/IssuePage.types'
import { getErrorMessage } from '~/utils/getErrorMessage'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{
  boardId: string
  deps: BoardPageDeps
  issueKey: null | string
  onBack: () => void
  onCreateIssue: (statusId: string) => Promise<void> | void
  onIssueDirtyChange: (dirty: boolean) => void
  onIssueMoved: (issue: IssuePageSavedIssue) => Promise<void> | void
  onPushQuery: (query: LocationQueryRaw) => Promise<void> | void
  onReplaceQuery: (query: LocationQueryRaw) => Promise<void> | void
  routePath: string
  routeQuery: LocationQuery
  spaceKey: string
}>()

const IssueDialog = defineAsyncComponent(
  () => import('~/sections/boards/board/components/IssueDialog/IssueDialog.vue'),
)
const organizationRoutes = useOrganizationRoutes()
const board = useTemplateRef('board')
// 'clone' leaves a visible copy of the card in the slot it would drop into, where the default
// feedback leaves a `visibility: hidden` one and so an empty gap.
const plugins = defaultPreset.plugins.map((plugin) =>
  plugin === Feedback ? Feedback.configure({ feedback: 'clone' }) : plugin,
)
const sensors = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ tolerance: 5, value: 250 })]
        : [new PointerActivationConstraints.Distance({ value: 6 })],
    preventActivation: () => false,
  }),
  KeyboardSensor,
]

const LOAD_MORE_TAKE = 25

const search = computed(() =>
  typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
)
const attributeQuery = computed(() => readIssueAttributeQuery(props.routeQuery))
const state = reactive({
  closingIssueDialog: false,
  dragging: false,
  dragSnapshot: null as BoardPageViewModel | null,
  filtering: false,
  loadingColumnIds: new Set<string>(),
  loadMoreErrors: new Map<string, string>(),
  moveError: null as null | string,
  movingIssueKeys: new Set<string>(),
  queryError: undefined as string | undefined,
})

const {
  data,
  message: queryMessage,
  pending,
  refresh,
} = await useQuery(
  () => `board:${props.boardId}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({
      attributeQuery: attributeQuery.value,
      boardId: props.boardId,
      search: search.value,
      signal,
    }),
  { watch: [() => props.boardId] },
)

const viewModel = ref<BoardPageViewModel>()
watch(
  data,
  (value) => {
    if (value) {
      state.queryError = undefined
      viewModel.value = value
    }
  },
  { immediate: true },
)
const message = computed(() => state.queryError ?? queryMessage.value)
const { execute: executeMoveBoardIssue, message: moveBoardIssueMessage } = useAction(
  props.deps.moveBoardIssue,
)
const { execute: executeMoveIssueToBacklog, message: moveIssueToBacklogMessage } = useAction(
  props.deps.moveIssueToBacklog,
)
const issueAttributes = computed(() => viewModel.value?.attributes ?? [])
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(attributeQuery.value, issueAttributes.value),
)
const filterValue = computed<BoardPageFilterValue>(() => ({
  attributes: attributeFilters.value,
}))
const filterInput = computed(() =>
  getIssueAttributeFilterInput(attributeFilters.value, issueAttributes.value),
)
const filterKey = computed(() => JSON.stringify(filterInput.value))

const updateFilters = (value: BoardPageFilterValue) => {
  void props.onReplaceQuery(
    withIssueAttributeFilters(props.routeQuery, value.attributes, issueAttributes.value),
  )
}

const updateSearch = (value: string) => {
  const routeQuery = { ...props.routeQuery }
  if (value) {
    routeQuery.search = value
  } else {
    delete routeQuery.search
  }
  void props.onReplaceQuery(routeQuery)
}

const openIssue = (issueKey: string) => {
  void props.onPushQuery({ ...props.routeQuery, issue: issueKey })
}

useHead({
  title: computed(() => viewModel.value?.title ?? 'Board'),
})
const scheduleSearch = debounce(() => void searchIssues(), 300)

watch([search, filterKey], () => {
  state.filtering = true
  scheduleSearch()
})
onScopeDispose(scheduleSearch.cancel)

watch(
  () => props.issueKey,
  () => {
    state.closingIssueDialog = false
  },
)

watch(
  () => props.boardId,
  () => {
    scheduleSearch.cancel()
    state.filtering = false
    state.loadingColumnIds.clear()
    state.loadMoreErrors.clear()
  },
)

const closeIssueDialog = () => {
  state.closingIssueDialog = true
  const backState = window.history.state?.back
  const historyBackPath = typeof backState === 'string' ? (backState.split('?')[0] ?? null) : null
  const target = resolveIssueDialogCloseTarget({
    currentPath: props.routePath,
    currentQuery: props.routeQuery as Record<string, string>,
    historyBackPath,
  })
  if (target.type === 'back') {
    props.onBack()
    return
  }
  void props.onReplaceQuery(target.query)
}

const handleIssueSaved = async (issue: IssuePageSavedIssue) => {
  scheduleSearch.cancel()
  state.filtering = false
  const current = viewModel.value
  const affectedColumnIds = new Set<string>()
  if (current) {
    if (issue.previousBoardId === current.id) {
      affectedColumnIds.add(issue.previousStatusId)
    }
    if (issue.boardId === current.id) {
      affectedColumnIds.add(issue.statusId)
    }
    viewModel.value = updateIssueInBoard(current, issue)
  }
  void refreshLoadedIssues(affectedColumnIds)
  if (
    issue.boardId !== props.boardId ||
    issue.spaceKey !== props.spaceKey ||
    issue.issueKey !== props.issueKey
  ) {
    await props.onIssueMoved(issue)
  }
}

const handleIssueDeleted = (issueKey: string) => {
  scheduleSearch.cancel()
  state.filtering = false
  const current = viewModel.value
  if (current) {
    viewModel.value = removeIssueFromBoard(current, issueKey)
  }
}

const searchIssues = async () => {
  scheduleSearch.cancel()
  state.filtering = true
  const result = await props.deps.searchBoardIssues({
    boardId: props.boardId,
    filters: filterInput.value,
    search: search.value,
    take: LOAD_MORE_TAKE,
  })
  state.filtering = false
  if (result.status === 'error') {
    state.queryError = getErrorMessage(result.code)
    return
  }
  const current = viewModel.value
  if (!current) {
    return
  }
  const issuesByColumn = new Map(result.data.columns.map((column) => [column.id, column]))
  viewModel.value = {
    ...current,
    columns: current.columns.map((column) => {
      const issues = issuesByColumn.get(column.id)
      return {
        ...column,
        issueCount: issues?.issueCount ?? 0,
        issues: issues?.issues ?? [],
      }
    }),
    issueCount: result.data.issueCount,
  }
}

const refreshLoadedIssues = async (statusIds: ReadonlySet<string>) => {
  const current = viewModel.value
  if (!current || statusIds.size === 0) {
    return
  }

  const [columns, summary] = await Promise.all([
    Promise.all(
      current.columns
        .filter((column) => statusIds.has(column.id))
        .map(async (column) => ({
          columnId: column.id,
          result: await props.deps.loadMoreBoardIssues({
            filters: filterInput.value,
            offset: 0,
            search: search.value,
            statusId: column.id,
            take: Math.max(LOAD_MORE_TAKE, column.issues.length),
          }),
        })),
    ),
    props.deps.searchBoardIssues({
      boardId: props.boardId,
      filters: filterInput.value,
      search: search.value,
      take: 1,
    }),
  ])

  const refreshedColumns = new Map<string, LoadMoreBoardIssuesResult>()
  for (const response of columns) {
    if (response.result.status === 'error') {
      state.loadMoreErrors.set(response.columnId, getErrorMessage(response.result.code))
    } else {
      state.loadMoreErrors.delete(response.columnId)
      refreshedColumns.set(response.columnId, response.result.data)
    }
  }

  let refreshedSummary: SearchBoardIssuesResult | undefined
  if (summary.status === 'success') {
    refreshedSummary = summary.data
  }

  const latest = viewModel.value
  if (!latest) {
    return
  }
  viewModel.value = mergeRefreshedBoard(latest, refreshedColumns, refreshedSummary)
}

const moveIssue = async (input: {
  index: number
  issueKey: string
  revert: BoardPageViewModel
  statusId: string
  updateStatus: boolean
}) => {
  const current = viewModel.value
  const targetColumn = current?.columns.find((column) => column.id === input.statusId)
  if (!current || !targetColumn || state.movingIssueKeys.has(input.issueKey)) {
    return
  }

  const siblings = targetColumn.issues.filter((issue) => issue.issueKey !== input.issueKey)
  const previous = input.index > 0 ? siblings[input.index - 1] : undefined
  const next = input.index === 0 ? siblings[0] : undefined
  const target = previous
    ? { issueKey: previous.issueKey, position: 'After' as const }
    : next
      ? { issueKey: next.issueKey, position: 'Before' as const }
      : undefined

  scheduleSearch.cancel()
  state.filtering = false
  state.moveError = null
  state.movingIssueKeys.add(input.issueKey)
  const result = await executeMoveBoardIssue({
    issueKey: input.issueKey,
    statusId: input.statusId,
    target,
    updateStatus: input.updateStatus,
  })
  if (result === undefined) {
    viewModel.value = input.revert
    state.moveError = moveBoardIssueMessage.value ?? getErrorMessage(0)
  }
  state.movingIssueKeys.delete(input.issueKey)
}

const moveToBacklog = async (issueKey: string) => {
  const current = viewModel.value
  if (!current || state.movingIssueKeys.has(issueKey)) {
    return
  }

  state.moveError = null
  state.movingIssueKeys.add(issueKey)
  const result = await executeMoveIssueToBacklog({
    boardId: props.boardId,
    issueKey,
    spaceKey: props.spaceKey,
  })
  if (result) {
    viewModel.value = removeIssueFromBoard(current, issueKey)
  } else {
    state.moveError = moveIssueToBacklogMessage.value ?? getErrorMessage(0)
  }
  state.movingIssueKeys.delete(issueKey)
}

const loadMoreIssues = async (statusId: string) => {
  const current = viewModel.value
  const column = current?.columns.find((c) => c.id === statusId)
  if (!current || !column || !column.hasNext || state.loadingColumnIds.has(statusId)) {
    return
  }

  state.loadingColumnIds.add(statusId)
  state.loadMoreErrors.delete(statusId)
  const requestedSearch = search.value
  const requestedFilterKey = filterKey.value

  const result = await props.deps.loadMoreBoardIssues({
    filters: filterInput.value,
    offset: column.issues.length,
    search: requestedSearch,
    statusId,
    take: LOAD_MORE_TAKE,
  })

  state.loadingColumnIds.delete(statusId)

  if (search.value !== requestedSearch || filterKey.value !== requestedFilterKey) {
    return
  }
  if (result.status === 'error') {
    state.loadMoreErrors.set(statusId, getErrorMessage(result.code))
    return
  }
  const latest = viewModel.value
  if (!latest) {
    return
  }
  viewModel.value = {
    ...latest,
    columns: latest.columns.map((currentColumn) =>
      currentColumn.id === statusId
        ? {
            ...currentColumn,
            hasNext: result.data.hasNext,
            issues: [...currentColumn.issues, ...result.data.issues],
          }
        : currentColumn,
    ),
  }
}

const removeIssueFromBoard = (
  boardData: BoardPageViewModel,
  issueKey: string,
): BoardPageViewModel => {
  const source = boardData.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  if (!source) {
    return boardData
  }

  return {
    ...boardData,
    columns: boardData.columns.map((column) =>
      column === source
        ? {
            ...column,
            issueCount: column.issueCount - 1,
            issues: column.issues.filter((item) => item.issueKey !== issueKey),
          }
        : column,
    ),
    issueCount: Math.max(0, boardData.issueCount - 1),
  }
}

const moveIssueInBoard = (
  boardData: BoardPageViewModel,
  issueKey: string,
  statusId: string,
  index?: number,
): BoardPageViewModel => {
  const source = boardData.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  const target = boardData.columns.find((column) => column.id === statusId)
  const issue = source?.issues.find((item) => item.issueKey === issueKey)
  if (!source || !target || !issue) {
    return boardData
  }

  const targetIssues = target.issues.filter((item) => item !== issue)
  const targetIndex = Math.min(index ?? targetIssues.length, targetIssues.length)
  const orderedTargetIssues = [
    ...targetIssues.slice(0, targetIndex),
    issue,
    ...targetIssues.slice(targetIndex),
  ]

  return {
    ...boardData,
    columns: boardData.columns.map((column) => {
      if (column === source && column !== target) {
        return {
          ...column,
          issueCount: column.issueCount - 1,
          issues: column.issues.filter((item) => item !== issue),
        }
      }
      if (column === target) {
        return {
          ...column,
          issueCount: source === target ? column.issueCount : column.issueCount + 1,
          issues: orderedTargetIssues,
        }
      }
      return column
    }),
  }
}

const updateIssueInBoard = (
  boardData: BoardPageViewModel,
  update: IssuePageSavedIssue,
): BoardPageViewModel => {
  const hasIssue = boardData.columns.some((column) =>
    column.issues.some((issue) => issue.issueKey === update.previousIssueKey),
  )
  if (!hasIssue) {
    return boardData
  }
  if (update.boardId !== boardData.id) {
    return removeIssueFromBoard(boardData, update.previousIssueKey)
  }

  const updated = moveIssueInBoard(boardData, update.previousIssueKey, update.statusId)
  return {
    ...updated,
    columns: updated.columns.map((column) => ({
      ...column,
      issues: column.issues.map((issue) =>
        issue.issueKey === update.previousIssueKey
          ? { ...issue, content: update.content, issueKey: update.issueKey }
          : issue,
      ),
    })),
  }
}

const handleDragStart = () => {
  state.dragging = true
  state.dragSnapshot = viewModel.value ?? null
}

// Reordering our own state on every drag over keeps it in step with the reordering @dnd-kit
// performs on the DOM; leaving it behind makes the two fight each other on the next render.
const handleDragOver = (event: DragOverEvent) => {
  const current = viewModel.value
  if (!current) {
    return
  }

  const issueKey = event.operation.source?.id
  const before: Record<string, string[]> = Object.fromEntries(
    current.columns.map((column) => [column.id, column.issues.map((issue) => issue.issueKey)]),
  )
  // `move` resolves a column target against the column midpoint, which lands the issue on top of a
  // tall column. The column is only ever the target below the cards, which means the end.
  const after =
    event.operation.target?.type === 'column' && typeof issueKey === 'string'
      ? appendToColumn(before, String(event.operation.target.id), issueKey)
      : move(before, event)
  if (after === before) {
    return
  }

  const issues = new Map(
    current.columns.flatMap((column) => column.issues.map((issue) => [issue.issueKey, issue])),
  )
  viewModel.value = {
    ...current,
    columns: current.columns.map((column) => {
      const keys = after[column.id]
      if (!keys || keys.length === column.issues.length) {
        return keys && keys.some((key, index) => key !== column.issues[index]?.issueKey)
          ? { ...column, issues: keys.map((key) => issues.get(key)!) }
          : column
      }
      return {
        ...column,
        issueCount: column.issueCount + keys.length - column.issues.length,
        issues: keys.map((key) => issues.get(key)!),
      }
    }),
  }
}

const appendToColumn = (
  columns: Record<string, string[]>,
  columnId: string,
  issueKey: string,
): Record<string, string[]> => {
  if (columns[columnId]?.at(-1) === issueKey) {
    return columns
  }
  return Object.fromEntries(
    Object.entries(columns).map(([id, keys]) => {
      const without = keys.filter((key) => key !== issueKey)
      return [id, id === columnId ? [...without, issueKey] : without]
    }),
  )
}

const handleDragEnd = (event: DragEndEvent) => {
  state.dragging = false
  const snapshot = state.dragSnapshot
  state.dragSnapshot = null
  const current = viewModel.value
  const issueKey = event.operation.source?.id
  if (!snapshot || !current || typeof issueKey !== 'string') {
    return
  }
  // @dnd-kit only reverts what it did to the DOM, the optimistic reorder is ours to undo.
  if (event.canceled) {
    viewModel.value = snapshot
    return
  }

  const sourceColumn = snapshot.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  const targetColumn = current.columns.find((column) =>
    column.issues.some((issue) => issue.issueKey === issueKey),
  )
  if (!sourceColumn || !targetColumn) {
    return
  }

  const index = targetColumn.issues.findIndex((issue) => issue.issueKey === issueKey)
  if (
    targetColumn.id === sourceColumn.id &&
    index === sourceColumn.issues.findIndex((issue) => issue.issueKey === issueKey)
  ) {
    return
  }

  void moveIssue({
    index,
    issueKey,
    revert: snapshot,
    statusId: targetColumn.id,
    updateStatus: targetColumn.id !== sourceColumn.id,
  })
}

const resolveIssueDialogCloseTarget = (input: {
  currentPath: string
  currentQuery: Record<string, string>
  historyBackPath: null | string
}) => {
  if (input.historyBackPath === input.currentPath) {
    return { type: 'back' as const }
  }
  const routeQuery = { ...input.currentQuery }
  delete routeQuery.issue
  return { query: routeQuery, type: 'replace' as const }
}
</script>

<style scoped>
.board-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.board {
  display: grid;
  flex: 1;
  gap: var(--space-3);
  grid-auto-columns: 300px;
  grid-auto-flow: column;
  grid-template-columns: none;
  grid-template-rows: 1fr;
  margin-top: var(--space-5);
  min-height: 0;
  overflow-x: auto;
  padding-bottom: var(--space-4);
}

@media (max-width: 760px) {
  .board {
    gap: var(--space-2);
    grid-auto-columns: 100%;
    grid-auto-flow: column;
    grid-template-columns: none;
    margin-top: var(--space-3);
    overscroll-behavior-inline: contain;
  }
}
</style>
