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
        <!-- The key leads the title's first line; the title wraps under it. -->
        <p class="task-title">
          <!-- A native title, like the time below: a board renders too many cards for tooltips. -->
          <span
            v-if="viewModel.blocked"
            :aria-label="t('blocked')"
            class="task-blocked"
            role="img"
            :title="t('blocked')">
            <IconLock aria-hidden="true" />
          </span>
          <span class="task-key">{{ viewModel.issueKey }}</span>
          {{ viewModel.title }}
        </p>
        <div class="task-source">
          <BaseAvatar
            :color="viewModel.assigneeColor"
            :initials="viewModel.assigneeInitial"
            size="sm" />
          <span class="task-assignee">{{ viewModel.assigneeName }}</span>
          <AgentRunBadge
            v-if="viewModel.agentRunState"
            :in-review="inReview"
            :state="viewModel.agentRunState" />
          <!-- A native title: a board renders hundreds of cards, too many for tooltip components. -->
          <time
            :datetime="viewModel.time"
            :title="`${t('created')} ${formatDateTime(viewModel.time)}`">
            {{ formatRecent(viewModel.time) }}
          </time>
        </div>
      </a>
    </NuxtLink>
    <IconLoader
      v-if="moving"
      :aria-label="t('savingPosition')"
      class="task-progress" />
  </article>
</template>

<script setup lang="ts">
import { useSortable } from '@dnd-kit/vue/sortable'
import { IconLoader, IconLock } from '@tabler/icons-vue'

import AgentRunBadge from '~/components/agent-run-badge/AgentRunBadge.vue'

import type { IssueCardViewModel } from './IssueCard.types'

const props = defineProps<{
  columnId: string
  disabled: boolean
  // The card's column is a Review status.
  index: number
  inReview: boolean
  moving: boolean
  onOpenIssue: (issueKey: string) => void
  viewModel: IssueCardViewModel
}>()

const { t } = useI18n({
  en: {
    blocked: 'Blocked',
    created: 'Created',
    savingPosition: 'Saving issue position',
  },
  ru: {
    blocked: 'Заблокирована',
    created: 'Создана',
    savingPosition: 'Сохранение позиции задачи',
  },
})

const { formatDateTime, formatRecent } = useFormatters()

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
</script>

<style scoped>
/* A white block on the page, as the kit's lists and cards. */
.task {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-control);
  color: inherit;
  cursor: pointer;
  display: block;
  margin-bottom: var(--space-2);
  position: relative;
  text-decoration: none;
  -webkit-touch-callout: none;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    opacity var(--duration-fast) var(--ease-standard);
  -webkit-user-drag: none;
}

.task-link {
  color: inherit;
  display: block;
  padding: var(--space-3);
  text-decoration: none;
}

.task:focus-within {
  border-color: var(--color-focus);
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

.task-key {
  color: var(--color-muted);
}

.task-blocked {
  color: var(--color-warning);
  display: inline-flex;
  margin-right: var(--space-1);
  /* Centered on the title's lowercase letters, as an icon in a line of text. */
  vertical-align: -0.125em;
}

.task-blocked .tabler-icon {
  height: 1em;
  width: 1em;
}

.task-assignee {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-source {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  min-width: 0;
}

.task-source time {
  flex: none;
  margin-left: auto;
}

.task-progress {
  animation: var(--animation-spin);
  color: var(--color-accent);
  height: 16px;
  position: absolute;
  right: var(--space-5);
  top: var(--space-5);
  width: 16px;
}

.task-title {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  -webkit-line-clamp: 3;
  line-height: 1.5;
  margin: 0 0 var(--space-3);
  overflow: hidden;
  /* Room for the saving spinner in the corner. */
  padding-right: var(--control-height-small);
}

@media (hover: hover) and (pointer: fine) {
  .task:hover {
    border-color: var(--color-border-hover);
  }
}
</style>
