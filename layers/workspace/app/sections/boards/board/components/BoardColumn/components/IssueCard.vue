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
        <p class="task-title">
          <span class="task-key">{{ viewModel.issueKey }}</span>
          <span
            v-if="viewModel.blocked"
            :aria-label="t('blocked')"
            class="task-blocked"
            role="img"
            :title="t('blocked')">
            <IconLock aria-hidden="true" />
          </span>
          {{ viewModel.title }}
        </p>
        <IssueAttributeLabels
          v-if="viewModel.attributes?.length"
          :attributes="viewModel.attributes"
          class="task-attributes" />
      </a>
    </NuxtLink>
    <div
      class="task-source"
      @click.left.exact="openFromFooter">
      <div
        v-if="!disabled"
        class="task-assignee-control"
        :title="viewModel.assigneeName">
        <AssigneeSelect
          :aria-label="t('assignee')"
          :deps="deps.assigneeSelect"
          :disabled="saving"
          icon-only
          :initial-option="{
            color: viewModel.assigneeColor,
            initials: viewModel.assigneeInitial,
            isCurrentUser: false,
            label: viewModel.assigneeName,
            value: viewModel.assigneeId,
          }"
          :model-value="viewModel.assigneeId"
          :show-chevron="false"
          :space-key="spaceKey"
          variant="inline"
          @update:model-value="saveAssignee" />
      </div>
      <template v-else>
        <BaseAvatar
          :color="viewModel.assigneeColor"
          :initials="viewModel.assigneeInitial"
          size="sm" />
        <span class="visually-hidden">{{ viewModel.assigneeName }}</span>
      </template>
      <AgentRunBadge
        v-if="viewModel.agentRunState"
        :completed="completed"
        :in-review="inReview"
        :state="viewModel.agentRunState" />
      <!-- A native title: a board renders hundreds of cards, too many for tooltip components. -->
      <IssueSourceIcon
        v-if="viewModel.source"
        class="task-created-via"
        :source="viewModel.source" />
      <time
        :datetime="viewModel.time"
        :title="`${t('created')} ${formatDateTime(viewModel.time)}`">
        {{ formatCompactDate(viewModel.time) }}
      </time>
    </div>
    <p
      v-if="saveMessage"
      class="form-error task-error"
      role="alert">
      {{ saveMessage }}
    </p>
    <IconLoader
      v-if="moving"
      :aria-label="t('savingPosition')"
      class="task-progress" />
  </article>
</template>

<script setup lang="ts">
import { useSortable } from '@dnd-kit/vue/sortable'
import { IconLoader, IconLock } from '@tabler/icons-vue'
import { computed, useTemplateRef } from 'vue'

import { NuxtLink } from '#components'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseAvatar from '#layers/core/app/ui/components/BaseAvatar.vue'
import AgentRunBadge from '#layers/workspace/app/sections/issues/shared/components/AgentRunBadge/AgentRunBadge.vue'
import AssigneeSelect from '#layers/workspace/app/sections/issues/shared/components/AssigneeSelect/AssigneeSelect.vue'
import IssueAttributeLabels from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeLabels/IssueAttributeLabels.vue'
import IssueSourceIcon from '#layers/workspace/app/sections/issues/shared/components/IssueSourceIcon/IssueSourceIcon.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useFormatters } from '#layers/workspace/app/shared/composables/useFormatters'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

import type { IssueCardDeps, IssueCardViewModel } from './IssueCard.types'

const props = defineProps<{
  columnId: string
  organizationRoutes: OrganizationRoutes
  // The card's column is a Completed status.
  completed: boolean
  deps: IssueCardDeps
  disabled: boolean
  // The card's column is a Review status.
  index: number
  inReview: boolean
  moving: boolean
  onOpenIssue: (issueKey: string) => void
  onUpdated: () => Promise<void> | void
  spaceKey: string
  viewModel: IssueCardViewModel
}>()

const { t } = useI18n({
  en: {
    assignee: 'Assignee',
    blocked: 'Blocked',
    created: 'Created',
    savingPosition: 'Saving issue position',
  },
  ru: {
    assignee: 'Исполнитель',
    blocked: 'Заблокирована',
    created: 'Создана',
    savingPosition: 'Сохранение позиции задачи',
  },
})

const { formatCompactDate, formatDateTime } = useFormatters()
const {
  execute: updateAssignee,
  message: saveMessage,
  pending: saving,
} = useApiAction((assigneeId: string) =>
  props.deps.saveAssignee({ assigneeId, issueKey: props.viewModel.issueKey }),
)

const saveAssignee = async (assigneeId: string) => {
  if (saving.value || assigneeId === props.viewModel.assigneeId) {
    return
  }
  if (await updateAssignee(assigneeId)) {
    await props.onUpdated()
  }
}

const element = useTemplateRef('element')

const openFromFooter = (event: MouseEvent) => {
  if (event.target instanceof Element && event.target.closest('button')) {
    return
  }
  props.onOpenIssue(props.viewModel.issueKey)
}

useSortable({
  accept: 'item',
  disabled: computed(() => props.disabled || saving.value),
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
  padding: var(--space-3);
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
  text-decoration: none;
}

.task-link::after {
  content: '';
  inset: 0;
  position: absolute;
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

.task-source {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-1);
  min-width: 0;
  position: relative;
  z-index: 1;
}

.task-assignee-control {
  min-width: 0;
}

.task .task-assignee-control :deep(.base-select) {
  border-radius: var(--radius-full);
  height: auto;
  width: auto;
}

.task .task-assignee-control :deep(.base-select:focus-visible) {
  box-shadow: var(--shadow-focus);
}

.task-error {
  position: relative;
  z-index: 1;
}

/* The source icon goes to the right with the time, next to it. */
.task-created-via {
  margin-left: auto;
}

.task-source time {
  flex: none;
  margin-left: auto;
}

.task-created-via + time {
  margin-left: 0;
}

.task .task-attributes {
  margin: calc(var(--space-1) * -1) 0 var(--space-3);
  position: relative;
  z-index: 1;
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

.task-key {
  color: var(--color-muted);
  margin-inline-end: var(--space-1);
}

.task-blocked {
  color: var(--color-warning);
  display: inline-flex;
  vertical-align: -0.125em;
}

.task-blocked .tabler-icon {
  height: 1em;
  width: 1em;
}

.task-title {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  -webkit-line-clamp: 3;
  line-height: var(--line-height-body);
  margin: 0 0 var(--space-3);
  overflow: hidden;
  overflow-wrap: anywhere;
}

.task--moving .task-title {
  padding-right: var(--control-height-small);
}

@media (hover: hover) and (pointer: fine) {
  .task:hover {
    border-color: var(--color-border-hover);
  }
}
</style>
