<template>
  <section class="column">
    <div class="column-head">
      <span>
        <i :style="{ background: viewModel.color || COLORS.gray }" />
        {{ viewModel.title }}
      </span>
      <span class="column-head-actions">
        <button
          v-if="canCreateIssues"
          :aria-label="`Add issue to ${viewModel.title}`"
          class="icon-btn small"
          title="Add issue"
          type="button"
          @click="onCreateIssue(viewModel.id)">
          <Plus />
        </button>
        <span>{{ viewModel.issueCount }}</span>
      </span>
    </div>
    <div
      ref="element"
      class="column-issues"
      :class="{ 'column-issues--enabled': canMoveIssues }">
      <p
        v-if="viewModel.issues.length === 0"
        class="empty">
        {{ canMoveIssues ? 'Drop issues here' : 'No issues' }}
      </p>
      <IssueCard
        v-for="(issue, index) in viewModel.issues"
        :key="issue.issueKey"
        :column-id="viewModel.id"
        :disabled="!canMoveIssues || movingIssueKeys.has(issue.issueKey)"
        :index="index"
        :moving="movingIssueKeys.has(issue.issueKey)"
        :on-move-to-backlog="onMoveToBacklog"
        :on-open-issue="onOpenIssue"
        :view-model="issue" />
      <div
        v-if="viewModel.hasNext"
        ref="sentinel"
        class="column-sentinel">
        <Loader
          v-if="loadingMore"
          class="column-sentinel-loader" />
        <button
          v-else-if="loadMoreError"
          class="column-sentinel-retry"
          type="button"
          @click="onLoadMore(viewModel.id)">
          {{ loadMoreError }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CollisionPriority } from '@dnd-kit/abstract'
import { useDroppable } from '@dnd-kit/vue'
import { Loader, Plus } from '@lucide/vue'

import { COLORS } from '~/constants/colors'
import IssueCard from '~/sections/boards/board/components/BoardColumn/components/IssueCard.vue'

import type { BoardColumnViewModel } from './BoardColumn.types'

const props = defineProps<{
  canCreateIssues: boolean
  canMoveIssues: boolean
  loadingMore: boolean
  loadMoreError: null | string
  movingIssueKeys: Set<string>
  onCreateIssue: (statusId: string) => void
  onLoadMore: (statusId: string) => void
  onMoveToBacklog: (issueKey: string) => void
  onOpenIssue: (issueKey: string) => void
  viewModel: BoardColumnViewModel
}>()

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
  background: var(--color-soft);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  padding: var(--space-3);
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

.column-sentinel-retry {
  background: none;
  border: none;
  color: var(--color-danger, #d1242f);
  cursor: pointer;
  font-size: var(--font-size-small);
  opacity: 1;
  text-decoration: underline;
  transition: opacity var(--duration-fast) var(--ease-standard);
}

.column-sentinel-retry:active {
  opacity: 0.6;
}

.column-head {
  align-items: center;
  display: flex;
  flex: none;
  font-weight: var(--font-weight-bold);
  justify-content: space-between;
  padding: 0 var(--space-1) var(--space-3);
}

.column-head > span:first-child {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.column-head i {
  border-radius: var(--radius-pill);
  flex: none;
  height: 8px;
  width: 8px;
}

.column-head-actions {
  align-items: center;
  display: flex;
  gap: var(--space-2);
}

.column-head-actions > span {
  background: var(--color-surface);
  border-radius: var(--radius-pill);
  color: var(--color-muted);
  font-size: var(--font-size-small);
  padding: 2px var(--space-2);
}

.column-head-actions > .icon-btn {
  color: var(--color-accent);
}

@media (max-width: 767px) {
  .column {
    scroll-snap-align: start;
  }
}
</style>
