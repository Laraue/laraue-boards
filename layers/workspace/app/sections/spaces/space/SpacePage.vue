<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="SpaceIcon"
        :icon-color="data?.color"
        :on-refresh="refresh"
        :title="data?.name ?? t('space')">
        <template
          v-if="data"
          #title-actions>
          <SpaceAbout :about="data.about" />
        </template>
        <template
          v-if="data"
          #actions>
          <BaseButton
            v-if="data.canManage"
            :aria-label="t('spaceSettings')"
            icon
            :to="organizationRoutes.spaceSettings(spaceKey)"
            :tooltip="t('spaceSettings')">
            <IconSettings />
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
      <template #default>
        <section class="space-page">
          <div class="space-toolbar">
            <NuxtLink
              v-if="backlog"
              class="backlog-link"
              :to="organizationRoutes.backlog(spaceKey)">
              <span class="backlog-name">
                <IconListDetails :style="{ color: backlog.color }" />
                <span class="backlog-title">{{ t('backlog') }}</span>
              </span>
              <span class="backlog-count">{{ tp('issues', backlog.issueCount) }}</span>
              <IconChevronRight class="backlog-chevron" />
            </NuxtLink>

            <div
              v-if="regularBoards.length"
              class="space-group">
              <div class="space-group-controls">
                <span>{{ t('sortBy') }}:</span>
                <BaseSelect
                  :aria-label="t('sortBy')"
                  :model-value="state.sort"
                  :options="sortOptions"
                  variant="inline"
                  @update:model-value="changeSort" />
              </div>
              <BasePopover
                align="end"
                class="boards-status-help">
                <template #trigger="{ open, toggle }">
                  <BaseIconButton
                    :aria-expanded="open"
                    :label="t('aboutBoardStatus')"
                    @click="toggle">
                    <IconInfoCircle />
                  </BaseIconButton>
                </template>
                <div class="boards-hint">
                  <p>{{ t('automaticStatus') }}</p>
                  <ul>
                    <li>
                      <strong>{{ t('new') }}</strong>
                      — {{ t('statusToDoHint') }}
                    </li>
                    <li>
                      <strong>{{ t('inProgress') }}</strong>
                      — {{ t('statusActiveHint') }}
                    </li>
                    <li>
                      <strong>{{ t('done') }}</strong>
                      — {{ t('statusDoneHint') }}
                    </li>
                  </ul>
                  <p>{{ t('statusChangeHint') }}</p>
                </div>
              </BasePopover>
            </div>
          </div>

          <div
            v-if="sortedBoards.length"
            :aria-label="t('boards')"
            class="boards-kanban"
            role="group">
            <section
              v-for="group in boardGroups"
              :key="group.status"
              :aria-label="statusLabel(group.status)"
              class="boards-column">
              <div class="boards-column-header">
                <h2 class="boards-column-heading">
                  <StatusIndicator
                    :category="boardStatusAppearance[group.status].category"
                    :color="boardStatusAppearance[group.status].color" />
                  {{ statusLabel(group.status) }}
                  <span class="muted">{{ group.boards.length }}</span>
                </h2>
                <BaseIconButton
                  v-if="group.status === 'New' && data?.canCreateBoards"
                  :label="t('addBoard')"
                  :to="organizationRoutes.newBoard(spaceKey)">
                  <IconPlus />
                </BaseIconButton>
              </div>
              <NuxtLink
                v-for="board in group.boards"
                :key="board.id"
                class="board-card"
                :draggable="false"
                :to="organizationRoutes.board(spaceKey, board.id)">
                <span class="board-card-header">
                  <span class="board-card-icon">
                    <BoardIcon
                      aria-hidden="true"
                      :style="{ color: board.color }" />
                  </span>
                  <span class="board-card-name">{{ board.name }}</span>
                  <IconChevronRight
                    aria-hidden="true"
                    class="board-card-chevron" />
                </span>
                <span class="board-card-progress">
                  <span
                    aria-hidden="true"
                    class="meter">
                    <span
                      v-for="status in board.statuses"
                      :key="status.name"
                      :style="{ background: status.color, flex: status.count || 0 }" />
                  </span>
                  <span class="board-card-count">{{ tp('issues', board.issueCount) }}</span>
                </span>
              </NuxtLink>
              <p
                v-if="!group.boards.length"
                class="boards-column-empty">
                {{ t('noBoards') }}
              </p>
            </section>
          </div>
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
  IconInfoCircle,
  IconLayoutGridAdd,
  IconListDetails,
  IconPlus,
  IconSettings,
} from '@tabler/icons-vue'
import { computed, reactive } from 'vue'

import { NuxtLink } from '#components'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseEmptyState from '#layers/core/app/ui/components/BaseEmptyState.vue'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BasePopover from '#layers/core/app/ui/components/BasePopover.vue'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'
import SpaceAbout from '#layers/workspace/app/sections/spaces/space/components/SpaceAbout/SpaceAbout.vue'
import type {
  SpaceBoardStatus,
  SpaceBoardSummary,
  SpacePageDeps,
} from '#layers/workspace/app/sections/spaces/space/SpacePage.deps'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import StatusIndicator from '#layers/workspace/app/shared/components/StatusIndicator.vue'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { boardStatusAppearance } from '#layers/workspace/app/shared/constants/boardStatus'
import { BoardIcon, SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: SpacePageDeps
  organizationRoutes: OrganizationRoutes
  spaceKey: string
}>()

const { t, tp } = useI18n({
  en: {
    aboutBoardStatus: 'How board statuses work',
    addBoard: 'Add board',
    automaticStatus: 'A board’s status is calculated automatically from its issues:',
    backlog: 'Backlog',
    boards: 'Boards',
    createBoard: 'Create board',
    done: 'Done',
    emptyHint:
      "A board shows this space's issues as columns — one column per status, so work moves from To do to Done by dragging it. Create the first one with Create board.",
    emptyTitle: 'No boards yet',
    inProgress: 'In progress',
    issues: 'issue | issues',
    loadError: 'Could not load space',
    loading: 'Loading space…',
    name: 'Name',
    new: 'To do',
    newest: 'Newest first',
    noBoards: 'No boards',
    oldest: 'Oldest first',
    settings: 'Settings',
    sortBy: 'Sort by',
    space: 'Space',
    spaceSettings: 'Space settings',
    statusActiveHint: 'a mix of issue statuses, or work has started.',
    statusChangeHint:
      'To change a board’s status, update the issues inside it. Board cards cannot be dragged between these columns.',
    statusDoneHint: 'all issues are completed.',
    statusToDoHint: 'all issues are still to do.',
  },
  ru: {
    aboutBoardStatus: 'Как определяются статусы',
    addBoard: 'Добавить доску',
    automaticStatus: 'Статус доски рассчитывается автоматически по её задачам:',
    backlog: 'Бэклог',
    boards: 'Доски',
    createBoard: 'Создать доску',
    done: 'Готово',
    emptyHint:
      'Доска показывает задачи пространства в виде колонок. Перемещайте задачи перетаскиванием от «К выполнению» до «Готово». Создайте первую кнопкой «Создать доску».',
    emptyTitle: 'Досок пока нет',
    inProgress: 'В работе',
    issues: 'задача | задачи | задач',
    loadError: 'Не удалось загрузить пространство',
    loading: 'Загрузка пространства…',
    name: 'По названию',
    new: 'К выполнению',
    newest: 'Сначала новые',
    noBoards: 'Нет досок',
    oldest: 'Сначала старые',
    settings: 'Настройки',
    sortBy: 'Сортировка',
    space: 'Пространство',
    spaceSettings: 'Настройки пространства',
    statusActiveHint: 'задачи в разных статусах или работа уже началась.',
    statusChangeHint:
      'Чтобы изменить статус доски, меняйте статусы задач внутри неё. Карточки досок нельзя перетаскивать между этими колонками.',
    statusDoneHint: 'все задачи завершены.',
    statusToDoHint: 'все задачи ещё предстоит выполнить.',
  },
})

const { data, message, pending, refresh } = await useApiQuery(
  () => `space:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)

const boards = computed(() => data.value?.boards ?? [])

const backlog = computed(() => boards.value.find((board) => board.kind === 'backlog'))

const regularBoards = computed(() => boards.value.filter((board) => board.kind === 'board'))

const boardSorts = ['newest', 'oldest', 'name'] as const
type BoardSort = (typeof boardSorts)[number]

const state = reactive<{ sort: BoardSort }>({ sort: 'newest' })

const sortOptions = computed(() => boardSorts.map((sort) => ({ label: t(sort), value: sort })))

const changeSort = (value: string): void => {
  state.sort = boardSorts.find((sort) => sort === value) ?? 'newest'
}

const compareBoards: Record<BoardSort, (a: SpaceBoardSummary, b: SpaceBoardSummary) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
}

const sortedBoards = computed(() => regularBoards.value.toSorted(compareBoards[state.sort]))

const boardStatuses: SpaceBoardStatus[] = ['New', 'Active', 'Done']
const boardGroups = computed(() =>
  boardStatuses.map((status) => ({
    boards: sortedBoards.value.filter((board) => board.status === status),
    status,
  })),
)

const statusLabel = (status: SpaceBoardStatus) =>
  ({ Active: t('inProgress'), Done: t('done'), New: t('new') })[status]
</script>

<style scoped>
.space-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.space-toolbar {
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
}

.backlog-link {
  align-items: center;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
  padding: 0 var(--space-2);
  text-decoration: none;
}

.backlog-link:hover {
  background: var(--color-row-hover);
}

.backlog-link:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.backlog-name {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.backlog-name > svg {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.backlog-title {
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The board's statuses as one bar, each its share of the issues. */
.meter {
  background: var(--color-soft);
  border-radius: var(--radius-full);
  display: flex;
  flex: none;
  gap: 2px;
  height: 0.25rem;
  overflow: hidden;
  width: 100%;
}

.backlog-count {
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.backlog-chevron {
  color: var(--color-muted);
  height: var(--icon-size);
  width: var(--icon-size);
}

.space-group {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
  margin-left: auto;
}

.space-group-controls {
  align-items: center;
  display: flex;
  gap: var(--space-1);
}

.boards-status-help {
  --base-popover-width: 20rem;
}

.boards-hint {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);
}

.boards-hint p,
.boards-hint ul {
  margin: 0;
}

.boards-hint ul {
  display: grid;
  gap: var(--space-2);
  padding-left: var(--space-4);
}

.boards-kanban {
  align-items: stretch;
  display: grid;
  flex: 1;
  gap: var(--space-4);
  grid-template-columns: repeat(3, minmax(16rem, 1fr));
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.boards-column {
  align-content: start;
  background: var(--color-feed);
  border-radius: var(--radius-popover);
  display: grid;
  gap: var(--space-2);
  min-height: 0;
  min-width: 0;
  padding: var(--space-2);
}

.boards-column-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.boards-column-heading {
  align-items: center;
  display: flex;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  margin: 0;
  min-height: var(--control-height-small);
  padding: 0 var(--space-2);
}

.board-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-control);
  color: var(--color-text);
  cursor: pointer;
  display: grid;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-3);
  text-decoration: none;
}

.board-card:hover {
  border-color: var(--color-border-hover);
}

.board-card:focus-visible {
  border-color: var(--color-focus);
  box-shadow: var(--shadow-focus);
  outline: none;
}

.board-card-header {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.board-card-icon {
  align-items: center;
  display: flex;
  height: var(--icon-size);
  justify-content: center;
  width: var(--icon-size);
}

.board-card-icon > svg {
  height: var(--icon-size);
  width: var(--icon-size);
}

.board-card-name {
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body);
  min-width: 0;
  overflow-wrap: anywhere;
}

.board-card-chevron {
  color: var(--color-muted);
  height: 0.75rem;
  width: 0.75rem;
}

.board-card-progress {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: minmax(0, 1fr) auto;
}

.board-card-count {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.board-card-count,
.boards-column-empty {
  color: var(--color-muted);
  font-size: var(--font-size-small);
}

.boards-column-empty {
  margin: 0;
  padding: var(--space-5) var(--space-2);
  text-align: center;
}

@media (max-width: 767px) {
  .backlog-link {
    margin-right: auto;
  }

  .space-group {
    width: 100%;
  }

  .boards-kanban {
    grid-auto-columns: 90%;
    grid-auto-flow: column;
    grid-template-columns: none;
    overscroll-behavior-inline: contain;
    scroll-snap-type: x proximity;
  }

  .boards-column {
    scroll-snap-align: start;
  }
}
</style>
