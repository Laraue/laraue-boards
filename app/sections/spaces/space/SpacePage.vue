<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="SpaceIcon"
        :icon-color="data?.color"
        :title="data?.name ?? t('space')">
        <template
          v-if="data"
          #actions>
          <BaseButton
            v-if="data.canManage"
            :aria-label="t('spaceSettings')"
            icon-on-mobile
            :to="organizationRoutes.spaceSettings(spaceKey)">
            <IconSettings />
            <template #label>{{ t('settings') }}</template>
          </BaseButton>
          <BaseButton
            v-if="data.canCreateBoards"
            :aria-label="t('createBoard')"
            icon-on-mobile
            :to="organizationRoutes.newBoard(spaceKey)"
            variant="primary">
            <IconLayoutGridAdd />
            <template #label>{{ t('createBoard') }}</template>
          </BaseButton>
        </template>
      </PageHeader>
    </template>
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: page }">
        <!-- A data list, as the issue list: rows on the page itself, no box around them. -->
        <section class="space-page">
          <SpaceAbout
            :about="page.about"
            :space-key="spaceKey" />
          <NuxtLink
            v-if="backlog"
            class="space-row"
            :to="organizationRoutes.backlog(spaceKey)">
            <span class="space-row-name">
              <IconListDetails :style="{ color: backlog.color }" />
              <span class="space-row-title">{{ t('backlog') }}</span>
            </span>
            <span class="space-row-count">{{ tp('issues', backlog.issueCount) }}</span>
            <IconChevronRight class="space-row-chevron" />
          </NuxtLink>

          <div class="space-group">
            <h2 class="space-group-title">
              {{ t('boards') }}
              <span class="muted">{{ visibleBoards.length }}</span>
            </h2>
            <div
              v-if="regularBoards.length"
              class="space-group-controls">
              <BaseSelect
                :aria-label="t('show')"
                :model-value="state.filter"
                :options="filterOptions"
                variant="inline"
                @update:model-value="changeFilter" />
              <BaseSelect
                :aria-label="t('sortBy')"
                :model-value="state.sort"
                :options="sortOptions"
                variant="inline"
                @update:model-value="changeSort" />
            </div>
          </div>

          <template v-if="visibleBoards.length">
            <NuxtLink
              v-for="board in visibleBoards"
              :key="board.id"
              class="space-row"
              :to="organizationRoutes.board(spaceKey, board.id)">
              <span class="space-row-name">
                <BoardIcon :style="{ color: board.color }" />
                <span class="space-row-title">{{ board.name }}</span>
                <BaseBadge :variant="boardStatusVariant[board.status]">
                  {{ statusLabel(board.status) }}
                </BaseBadge>
              </span>
              <span
                class="space-row-progress"
                :title="
                  board.statuses.map((status) => `${status.count} ${status.name}`).join(' · ')
                ">
                <span
                  aria-hidden="true"
                  class="meter">
                  <span
                    v-for="status in board.statuses"
                    :key="status.name"
                    :style="{ background: status.color, flex: status.count || 0 }" />
                </span>
                <span class="space-row-statuses">
                  <span
                    v-for="status in board.statuses"
                    :key="status.name">
                    <StatusIndicator
                      :category="status.category"
                      :color="status.color" />
                    {{ status.count }} {{ status.name }}
                  </span>
                </span>
              </span>
              <span class="space-row-count">{{ tp('issues', board.issueCount) }}</span>
              <IconChevronRight class="space-row-chevron" />
            </NuxtLink>
          </template>
          <BaseEmptyState
            v-else-if="regularBoards.length"
            :hint="t('noMatchHint')"
            :title="t('noMatchTitle')" />
          <BaseEmptyState
            v-else
            :hint="t('emptyHint')"
            :title="t('emptyTitle')" />
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import {
  IconChevronRight,
  IconLayoutGridAdd,
  IconListDetails,
  IconSettings,
} from '@tabler/icons-vue'

import StatusIndicator from '~/components/status-select/StatusIndicator.vue'
import { BoardIcon, SpaceIcon } from '~/constants/icons'
import SpaceAbout from '~/sections/spaces/space/components/SpaceAbout/SpaceAbout.vue'
import type { SpaceBoardSummary, SpacePageDeps } from '~/sections/spaces/space/SpacePage.deps'

const props = defineProps<{ deps: SpacePageDeps; spaceKey: string }>()

const { t, tp } = useI18n({
  en: {
    allBoards: 'All boards',
    backlog: 'Backlog',
    boards: 'Boards',
    createBoard: 'Create board',
    done: 'Done',
    emptyHint:
      "A board shows this space's issues as columns — one column per status, so work moves from To do to Done by dragging it.",
    emptyTitle: 'No boards yet',
    finished: 'Finished',
    inProgress: 'In progress',
    issues: 'issue | issues',
    loadError: 'Could not load space',
    loading: 'Loading space…',
    name: 'Name',
    new: 'New',
    newest: 'Newest first',
    noMatchHint: 'Show all boards to see the rest.',
    noMatchTitle: 'No boards match',
    notFinished: 'Not finished',
    oldest: 'Oldest first',
    settings: 'Settings',
    show: 'Show',
    sortBy: 'Sort by',
    space: 'Space',
    spaceSettings: 'Space settings',
  },
  ru: {
    allBoards: 'Все доски',
    backlog: 'Бэклог',
    boards: 'Доски',
    createBoard: 'Создать доску',
    done: 'Готово',
    emptyHint:
      'Доска показывает задачи раздела в виде колонок. Перемещайте задачи перетаскиванием от «К выполнению» до «Готово».',
    emptyTitle: 'Досок пока нет',
    finished: 'Завершённые',
    inProgress: 'В работе',
    issues: 'задача | задачи | задач',
    loadError: 'Не удалось загрузить раздел',
    loading: 'Загрузка раздела…',
    name: 'По названию',
    new: 'Новая',
    newest: 'Сначала новые',
    noMatchHint: 'Покажите все доски, чтобы увидеть остальные.',
    noMatchTitle: 'Подходящих досок нет',
    notFinished: 'Незавершённые',
    oldest: 'Сначала старые',
    settings: 'Настройки',
    show: 'Показать',
    sortBy: 'Сортировка',
    space: 'Раздел',
    spaceSettings: 'Настройки раздела',
  },
})

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useApiQuery(
  () => `space:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)

const boards = computed(() => data.value?.boards ?? [])

const backlog = computed(() => boards.value.find((board) => board.kind === 'backlog'))

const regularBoards = computed(() => boards.value.filter((board) => board.kind === 'board'))

const boardFilters = ['all', 'notFinished', 'finished'] as const
type BoardFilter = (typeof boardFilters)[number]

const boardSorts = ['newest', 'oldest', 'name'] as const
type BoardSort = (typeof boardSorts)[number]

const state = reactive<{ filter: BoardFilter; sort: BoardSort }>({ filter: 'all', sort: 'newest' })

const filterOptions = computed(() => [
  { label: t('allBoards'), value: 'all' },
  { label: t('notFinished'), value: 'notFinished' },
  { label: t('finished'), value: 'finished' },
])

const sortOptions = computed(() => boardSorts.map((sort) => ({ label: t(sort), value: sort })))

const changeFilter = (value: string): void => {
  state.filter = boardFilters.find((filter) => filter === value) ?? 'all'
}

const changeSort = (value: string): void => {
  state.sort = boardSorts.find((sort) => sort === value) ?? 'newest'
}

const matchesFilter: Record<BoardFilter, (board: SpaceBoardSummary) => boolean> = {
  all: () => true,
  finished: (board) => board.status === 'Done',
  notFinished: (board) => board.status !== 'Done',
}

const compareBoards: Record<BoardSort, (a: SpaceBoardSummary, b: SpaceBoardSummary) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
}

const visibleBoards = computed(() =>
  regularBoards.value.filter(matchesFilter[state.filter]).toSorted(compareBoards[state.sort]),
)

const statusLabel = (status: 'Active' | 'Done' | 'New') =>
  ({ Active: t('inProgress'), Done: t('done'), New: t('new') })[status]

const boardStatusVariant = { Active: 'warning', Done: 'success', New: 'neutral' } as const
</script>

<style scoped>
.space-page {
  align-content: start;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

/* Name, progress, count, chevron: the same columns for the backlog and every board. */
.space-row {
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  color: var(--color-text);
  display: grid;
  gap: var(--space-2) var(--space-4);
  /* The name keeps its room: grid grows a capped track to its cap before an fr one gets anything,
     so the progress may shrink to nothing but never takes the name's space. */
  grid-template-columns: minmax(12rem, 1fr) minmax(0, 28rem) 6rem var(--icon-size);
  min-height: 2.75rem;
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
}

.space-row:hover {
  background: var(--color-row-hover);
}

.space-row:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.space-row-name {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.space-row-name > svg {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.space-row-title {
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* One line, centred with the name and the count: a short bar, its legend beside it. */
.space-row-progress {
  align-items: center;
  display: flex;
  gap: var(--space-3);
  min-width: 0;
  overflow: hidden;
}

/* The board's statuses as one bar, each its share of the issues. */
.meter {
  background: var(--color-soft);
  border-radius: var(--radius-full);
  display: flex;
  flex: none;
  gap: 2px;
  height: 4px;
  overflow: hidden;
  width: 7.5rem;
}

/* A legend for the bar: the caption size kept for small annotations. */
.space-row-statuses {
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-caption);
  gap: 0 var(--space-3);
  min-width: 0;
  overflow: hidden;
}

.space-row-statuses > span {
  align-items: center;
  display: inline-flex;
  gap: var(--space-1);
  white-space: nowrap;
}

.space-row-statuses :deep(svg) {
  flex: none;
  height: 12px;
  width: 12px;
}

.space-row-count {
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
  grid-column: 3;
  text-align: right;
  white-space: nowrap;
}

.space-row-chevron {
  color: var(--color-muted);
  height: var(--icon-size);
  width: var(--icon-size);
}

/* A group inside the list: a quiet label, no fill, so it never reads as a hovered row. Its filter and
   sort sit at the end of the same line. */
.space-group {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: space-between;
  margin: var(--space-6) 0 0;
  padding: var(--space-2) var(--space-4);
}

.space-group-title {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  margin: 0;
}

.space-group-controls {
  display: flex;
  gap: var(--space-1);
}

/* Under 1100px the one-line row would cut the legend: the progress goes under the name, the count
   stays at the end of the first line. */
@media (max-width: 1100px) {
  .space-row {
    grid-template-columns: minmax(0, 1fr) auto var(--icon-size);
  }

  .space-row-count {
    grid-column: 2;
    grid-row: 1;
  }

  .space-row-chevron {
    grid-column: 3;
    grid-row: 1;
  }

  .space-row-progress {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  /* The legend wraps instead of being cut: no hover shows it whole on a phone. */
  .space-row-statuses {
    flex-wrap: wrap;
  }
}

/* On a phone the bar takes the row's width and the legend goes under it. */
@media (max-width: 767px) {
  .space-row-progress {
    align-items: stretch;
    flex-direction: column;
    gap: var(--space-2);
  }

  .meter {
    width: 100%;
  }
}
</style>
