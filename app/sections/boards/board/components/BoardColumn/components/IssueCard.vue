<template>
  <article
    ref="element"
    class="task"
    :class="{ 'task--moving': moving }">
    <NuxtLink
      v-slot="{ href }"
      custom
      :to="organizationRoutes.issue(viewModel.issueKey)">
      <a
        class="task-link"
        draggable="false"
        :href="href || undefined"
        @click.left.exact.prevent="onOpenIssue(viewModel.issueKey)">
        <div class="task-source">
          <span
            class="avatar"
            :style="{ background: viewModel.assigneeColor }">
            {{ viewModel.assigneeInitial }}
          </span>
          <strong>{{ viewModel.assigneeName }}</strong>
          <time :datetime="viewModel.time">· {{ formatTime(viewModel.time) }}</time>
        </div>
        <small>{{ viewModel.issueKey }}</small>
        <p>{{ viewModel.content }}</p>
      </a>
    </NuxtLink>
    <Transition
      mode="out-in"
      name="icon-pop">
      <Loader
        v-if="moving"
        key="loader"
        aria-label="Saving issue position"
        class="task-progress" />
      <button
        v-else-if="!disabled"
        key="backlog"
        aria-label="Move to backlog"
        class="task-backlog-btn"
        title="Move to backlog"
        type="button"
        @click="onMoveToBacklog(viewModel.issueKey)">
        <Undo2 />
      </button>
    </Transition>
  </article>
</template>

<script lang="ts">
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
})
</script>

<script setup lang="ts">
import { useSortable } from '@dnd-kit/vue/sortable'
import { Loader, Undo2 } from '@lucide/vue'

import type { IssueCardViewModel } from './IssueCard.types'

const props = defineProps<{
  columnId: string
  disabled: boolean
  index: number
  moving: boolean
  onMoveToBacklog: (issueKey: string) => void
  onOpenIssue: (issueKey: string) => void
  viewModel: IssueCardViewModel
}>()
const organizationRoutes = useOrganizationRoutes()

const element = useTemplateRef('element')

useSortable({
  accept: 'item',
  disabled: computed(() => props.disabled),
  element,
  group: computed(() => props.columnId),
  id: computed(() => props.viewModel.issueKey),
  index: computed(() => props.index),
  type: 'item',
})

const formatTime = (value: string) => timeFormatter.format(new Date(value))
</script>

<style scoped>
.task {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  box-shadow: var(--shadow-card);
  color: inherit;
  cursor: pointer;
  display: block;
  margin-bottom: var(--space-2);
  position: relative;
  text-decoration: none;
  -webkit-touch-callout: none;
  transition:
    var(--transition-press),
    opacity var(--duration-fast) var(--ease-standard);
  -webkit-user-drag: none;
}

.task-link {
  color: inherit;
  display: block;
  padding: var(--space-4);
  text-decoration: none;
}

.task:hover {
  border-color: var(--color-accent);
  box-shadow: 0 4px 12px #10182814;
}

.task:active {
  translate: 0 var(--press-offset);
}

/* The placeholder @dnd-kit clones into the slot the card would drop into. */
.task[data-dnd-placeholder] {
  border-style: dashed;
  box-shadow: none;
  opacity: 0.5;
}

/* Not while the card is still flying to its slot: that element is the one being dragged. */
.task--moving:not([data-dnd-dropping]) {
  cursor: default;
  opacity: 0.6;
}

.task small {
  color: var(--color-muted);
}

.task-source {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.task-progress {
  animation: spin 0.8s linear infinite;
  color: var(--color-accent);
  height: 16px;
  margin: 2px;
  position: absolute;
  right: var(--space-3);
  top: var(--space-3);
  width: 16px;
}

.task-backlog-btn {
  align-items: center;
  background: none;
  border: none;
  color: var(--color-muted);
  cursor: pointer;
  display: inline-flex;
  height: 20px;
  justify-content: center;
  opacity: 0;
  padding: 0;
  position: absolute;
  right: var(--space-3);
  top: var(--space-3);
  transition: var(--transition-press);
  width: 20px;
}

.task:hover .task-backlog-btn,
.task-backlog-btn:focus-visible {
  opacity: 1;
}

.task-backlog-btn:hover {
  color: var(--color-accent);
}

.task-backlog-btn:active {
  translate: 0 var(--press-offset);
}

.task-backlog-btn svg {
  height: 16px;
  width: 16px;
}

.task-source .avatar {
  font-size: 10px;
  height: 24px;
  width: 24px;
}

.task p {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  font-weight: var(--font-weight-semibold);
  -webkit-line-clamp: 3;
  line-height: 1.4;
  margin: var(--space-2) 0 var(--space-3);
  overflow: hidden;
}
</style>
