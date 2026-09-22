<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section class="space-page">
        <div class="title-row">
          <div class="page-heading">
            <SpaceIcon
              class="page-heading-icon"
              :style="{ color: page.color }" />
            <div class="page-heading-text">
              <h1>{{ page.name }}</h1>
            </div>
          </div>
          <div class="title-actions">
            <NuxtLink
              v-if="page.canManage"
              :aria-label="t('spaceSettings')"
              class="secondary"
              :to="organizationRoutes.spaceSettings(page.key)">
              <Settings />
              <span class="btn-label">{{ t('settings') }}</span>
            </NuxtLink>
            <NuxtLink
              v-if="page.canCreateBoards"
              :aria-label="t('createBoard')"
              class="primary"
              :to="organizationRoutes.newBoard(page.key)">
              <Plus />
              <span class="btn-label">{{ t('createBoard') }}</span>
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="backlog"
          class="space-section">
          <h2 class="space-section-title">{{ t('backlog') }}</h2>
          <NuxtLink
            class="backlog-summary"
            :to="organizationRoutes.backlog(page.key)">
            <div class="summary-title">
              <ListTodo :style="{ color: backlog.color }" />
              <strong>{{ t('backlog') }}</strong>
              <span class="muted issue-count">{{ tp('issues', backlog.issueCount) }}</span>
            </div>
          </NuxtLink>
        </div>

        <div class="space-section">
          <h2 class="space-section-title">
            {{ t('boards') }}
            <span class="muted">{{ regularBoards.length }}</span>
          </h2>
          <div
            v-if="regularBoards.length"
            class="board-grid">
            <NuxtLink
              v-for="board in regularBoards"
              :key="board.id"
              class="board-summary"
              :to="organizationRoutes.board(page.key, board.id)">
              <div class="summary-title">
                <BoardIcon :style="{ color: board.color }" />
                <strong>{{ board.name }}</strong>
                <span
                  class="board-status"
                  :class="{
                    'board-status--active': board.status === 'Active',
                    'board-status--done': board.status === 'Done',
                  }">
                  {{ statusLabel(board.status) }}
                </span>
                <span class="muted issue-count">{{ tp('issues', board.issueCount) }}</span>
              </div>
              <div class="meter">
                <span
                  v-for="status in board.statuses"
                  :key="status.name"
                  :style="{
                    flex: status.count || 0,
                    background: status.color,
                  }" />
              </div>
              <div class="summary-statuses">
                <span
                  v-for="status in board.statuses"
                  :key="status.name">
                  <span
                    class="dot"
                    :style="{ background: status.color }" />
                  {{ status.count }} {{ status.name }}
                </span>
              </div>
            </NuxtLink>
          </div>
          <AppEmptyState
            v-else
            :hint="t('emptyHint')"
            :title="t('emptyTitle')" />
        </div>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ListTodo, Plus, Settings } from '@lucide/vue'

import { BoardIcon, SpaceIcon } from '~/constants/icons'
import type { SpacePageDeps } from '~/sections/spaces/space/SpacePage.deps'

const props = defineProps<{ deps: SpacePageDeps; spaceKey: string }>()

const { t, tp } = useI18n({
  en: {
    backlog: 'Backlog',
    boards: 'Boards',
    createBoard: 'Create board',
    done: 'Done',
    emptyHint:
      "A board shows this space's issues as columns — one column per status, so work moves from To do to Done by dragging it.",
    emptyTitle: 'No boards yet',
    inProgress: 'In progress',
    issues: 'issue | issues',
    loadError: 'Could not load space',
    loading: 'Loading space…',
    new: 'New',
    settings: 'Settings',
    space: 'Space',
    spaceSettings: 'Space settings',
  },
  ru: {
    backlog: 'Бэклог',
    boards: 'Доски',
    createBoard: 'Создать доску',
    done: 'Готово',
    emptyHint:
      'Доска показывает задачи раздела в виде колонок. Перемещайте задачи перетаскиванием от «К выполнению» до «Готово».',
    emptyTitle: 'Досок пока нет',
    inProgress: 'В работе',
    issues: 'задача | задачи | задач',
    loadError: 'Не удалось загрузить раздел',
    loading: 'Загрузка раздела…',
    new: 'Новая',
    settings: 'Настройки',
    space: 'Раздел',
    spaceSettings: 'Настройки раздела',
  },
})

const organizationRoutes = useOrganizationRoutes()

const { data, message, pending, refresh } = await useQuery(
  () => `space:${props.spaceKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ signal, spaceKey: props.spaceKey }),
  { watch: [() => props.spaceKey] },
)

const boards = computed(() => data.value?.boards ?? [])

const backlog = computed(() => boards.value.find((board) => board.kind === 'backlog'))

const regularBoards = computed(() => boards.value.filter((board) => board.kind === 'board'))

const statusLabel = (status: 'Active' | 'Done' | 'New') =>
  ({ Active: t('inProgress'), Done: t('done'), New: t('new') })[status]

useHead({
  title: computed(() => data.value?.name ?? t('space')),
})
</script>

<style scoped>
.space-page {
  align-content: start;
  display: grid;
  gap: var(--space-4);
  grid-template-columns: minmax(0, 1fr);
}

.space-section {
  display: grid;
  gap: var(--space-2);
}

.space-section-title {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  gap: var(--space-2);
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
}

.board-grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.board-summary,
.backlog-summary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  color: var(--color-text);
  min-width: 0;
  padding: var(--space-4);
  text-decoration: none;
  transition: var(--transition-press);
}

.board-summary:active,
.backlog-summary:active {
  translate: 0 var(--press-offset);
}

.backlog-summary:hover,
.board-summary:hover {
  border-color: var(--color-accent);
}

.backlog-summary {
  background: var(--color-soft);
  border-style: dashed;
}

.summary-title {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.summary-title strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.board-status {
  --board-status-color: var(--color-chart-neutral);

  background: color-mix(in srgb, var(--board-status-color) 14%, transparent);
  border-radius: var(--radius-pill);
  color: var(--board-status-color);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  padding: 2px 8px;
}

.board-status--active {
  --board-status-color: var(--color-chart-2);
}

.board-status--done {
  --board-status-color: var(--color-chart-done);
}

.meter {
  background: var(--color-soft);
  border-radius: var(--radius-pill);
  display: flex;
  gap: 1px;
  height: 2px;
  margin-top: var(--space-3);
  opacity: 0.9;
  overflow: hidden;
}

.summary-statuses {
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-size-caption);
  gap: var(--space-1);
  margin-top: var(--space-3);
}

.summary-statuses > span {
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: inline-flex;
  gap: var(--space-1);
  padding: 2px 8px;
}

@media (max-width: 1100px) {
  .board-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .board-grid {
    grid-template-columns: 1fr;
  }
}
</style>
