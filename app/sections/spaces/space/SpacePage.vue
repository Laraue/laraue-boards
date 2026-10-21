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

          <h2 class="space-group">
            {{ t('boards') }}
            <span class="muted">{{ regularBoards.length }}</span>
          </h2>

          <template v-if="regularBoards.length">
            <NuxtLink
              v-for="board in regularBoards"
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

const { data, message, pending, refresh } = await useApiQuery(
  () => `space:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)

const boards = computed(() => data.value?.boards ?? [])

const backlog = computed(() => boards.value.find((board) => board.kind === 'backlog'))

const regularBoards = computed(() => boards.value.filter((board) => board.kind === 'board'))

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

/* A group inside the list: a quiet label, no fill, so it never reads as a hovered row. */
.space-group {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  gap: var(--space-2);
  margin: var(--space-6) 0 0;
  padding: var(--space-2) var(--space-4);
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
