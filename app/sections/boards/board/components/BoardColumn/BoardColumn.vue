<template>
  <section class="column">
    <div class="column-head">
      <div class="column-heading">
        <StatusIndicator
          :category="viewModel.category"
          :color="viewModel.color || COLORS.gray" />
        <h2>{{ viewModel.title }}</h2>
        <span class="column-count">{{ viewModel.issueCount }}</span>
      </div>
      <div class="column-head-actions">
        <IconButton
          v-if="canCreateIssues"
          :label="`${t('addIssueTo')} ${viewModel.title}`"
          @click="onCreateIssue(viewModel.id)">
          <IconPlus />
        </IconButton>
      </div>
    </div>
    <div
      ref="element"
      class="column-issues"
      :class="{ 'column-issues--enabled': canMoveIssues }">
      <p
        v-if="viewModel.issues.length === 0"
        class="empty">
        {{ t('noIssues') }}
      </p>
      <IssueCard
        v-for="(issue, index) in viewModel.issues"
        :key="issue.issueKey"
        :column-id="viewModel.id"
        :disabled="!canMoveIssues || movingIssueKeys.has(issue.issueKey)"
        :index="index"
        :moving="movingIssueKeys.has(issue.issueKey)"
        :on-open-issue="onOpenIssue"
        :view-model="issue" />
      <div
        v-if="viewModel.hasNext"
        ref="sentinel"
        class="column-sentinel">
        <IconLoader
          v-if="loadingMore"
          class="column-sentinel-loader" />
        <IconButton
          v-else-if="loadMoreFailed"
          :label="t('loadMoreRetry')"
          @click="onLoadMore(viewModel.id)">
          <IconRefresh />
        </IconButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CollisionPriority } from '@dnd-kit/abstract'
import { useDroppable } from '@dnd-kit/vue'
import { IconLoader, IconPlus, IconRefresh } from '@tabler/icons-vue'

import StatusIndicator from '~/components/status-select/StatusIndicator.vue'
import { COLORS } from '~/constants/colors'
import IssueCard from '~/sections/boards/board/components/BoardColumn/components/IssueCard.vue'

import type { BoardColumnViewModel } from './BoardColumn.types'

const props = defineProps<{
  canCreateIssues: boolean
  canMoveIssues: boolean
  loadingMore: boolean
  loadMoreFailed: boolean
  movingIssueKeys: Set<string>
  onCreateIssue: (statusId: string) => void
  onLoadMore: (statusId: string) => void
  onOpenIssue: (issueKey: string) => void
  viewModel: BoardColumnViewModel
}>()

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    addIssueTo: 'Add issue to',
    loadMoreRetry: 'Could not load more issues. Try again',
    noIssues: 'No issues',
  },
  ru: {
    addIssue: 'Добавить задачу',
    addIssueTo: 'Добавить задачу в',
    loadMoreRetry: 'Не удалось загрузить задачи. Повторить',
    noIssues: 'Задач нет',
  },
})

const element = useTemplateRef('element')
const sentinel = useTemplateRef('sentinel')

useDroppable({
  accept: 'item',
  collisionPriority: CollisionPriority.Low,
  disabled: computed(() => !props.canMoveIssues),
  element,
  id: computed(() => props.viewModel.id),
  type: 'column',
})

let observer: IntersectionObserver | undefined

watch([element, sentinel], ([rootEl, sentinelEl]) => {
  observer?.disconnect()
  observer = undefined
  if (!rootEl || !sentinelEl) {
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        props.onLoadMore(props.viewModel.id)
      }
    },
    { root: rootEl, rootMargin: '150px' },
  )
  observer.observe(sentinelEl)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.column {
  border-radius: var(--radius-control);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  width: 100%;
}

.column-issues {
  flex: 1;
  min-height: 200px;
  overflow: hidden auto;
}

.column-issues--enabled :deep(.task),
.column-issues--enabled :deep(.task-link) {
  cursor: grab;
}

.column-sentinel {
  display: flex;
  justify-content: center;
  padding: var(--space-2) 0;
}

.column-sentinel-loader {
  animation: var(--animation-spin);
  color: var(--color-accent);
  height: 16px;
  width: 16px;
}

.column-head {
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  flex: none;
  justify-content: space-between;
  margin-bottom: var(--space-2);
  min-height: var(--control-height-small);
  padding-bottom: var(--space-2);
}

.column-heading {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.column-heading h2 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-head-actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.column-count {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 767px) {
  .column {
    scroll-snap-align: start;
  }
}
</style>
