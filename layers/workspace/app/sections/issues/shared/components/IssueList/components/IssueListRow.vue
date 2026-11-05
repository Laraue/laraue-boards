<template>
  <!-- The title is the link to the issue and its hit area covers the row, so the space and board
       can be links of their own: a link may not sit inside another. -->
  <div
    class="issue-list-row"
    :class="{ selected, 'selection-mode': selectionMode }"
    role="listitem">
    <BaseCheckbox
      v-if="canMove && selectionMode"
      class="row-select-target"
      :model-value="selected"
      @update:model-value="props.onToggleSelection()">
      <span class="visually-hidden">{{ t('selectIssue') }}</span>
    </BaseCheckbox>
    <NuxtLink
      class="issue-content"
      :title="title"
      :to="to">
      <span
        class="issue-key"
        :title="issueKey">
        {{ issueKey }}
      </span>
      <span class="issue-title">
        <span
          v-if="blocked"
          :aria-label="t('blocked')"
          class="issue-blocked"
          role="img"
          :title="t('blocked')">
          <IconLock aria-hidden="true" />
        </span>
        {{ title }}
      </span>
    </NuxtLink>
    <IssueAttributeLabels
      v-if="attributes?.length"
      :attributes="attributes"
      class="issue-attributes" />
    <div
      v-if="showLocation || !hideStatus"
      class="issue-metadata">
      <!-- The space stays a named icon link; the full path is available on hover. -->
      <span
        v-if="showLocation"
        class="issue-location"
        :title="spaceName ? `${spaceName} / ${boardName}` : boardName">
        <NuxtLink
          v-if="spaceName && spaceKey"
          :aria-label="spaceName"
          class="issue-location-space"
          :title="spaceName"
          :to="organizationRoutes.space(spaceKey)">
          <SpaceIcon :style="{ color: spaceColor }" />
          <span class="visually-hidden">{{ spaceName }}</span>
        </NuxtLink>
        <span
          v-if="spaceName && spaceKey"
          aria-hidden="true">
          /
        </span>
        <component
          :is="spaceKey && boardId ? NuxtLink : 'span'"
          class="issue-location-board"
          :to="spaceKey && boardId ? organizationRoutes.board(spaceKey, boardId) : undefined">
          <BoardIcon :style="{ color: boardColor }" />
          <span class="truncate">{{ boardName }}</span>
        </component>
      </span>
      <div
        v-if="!hideStatus"
        class="issue-status"
        :title="displayStatus">
        <StatusSelect
          v-if="canMove && quickEdit && boardId && statusId && status !== null"
          :aria-label="t('status')"
          :board-id="boardId"
          :deps="quickEdit.statusSelect"
          :disabled="saving"
          :initial-option="{
            value: statusId,
            label: displayStatus,
            color: statusColor,
            category: statusCategory,
          }"
          :model-value="statusId"
          :show-chevron="false"
          variant="inline"
          @update:model-value="save('status', $event)" />
        <template v-else>
          <StatusIndicator
            :category="statusCategory"
            :color="statusColor" />
          <span class="truncate">{{ displayStatus }}</span>
        </template>
      </div>
    </div>
    <div class="issue-footer">
      <div
        class="issue-person"
        :title="assignee">
        <AssigneeSelect
          v-if="canMove && quickEdit && spaceKey && assigneeId"
          :aria-label="t('assignee')"
          :deps="quickEdit.assigneeSelect"
          :disabled="saving"
          icon-only
          :initial-option="{
            color: assigneeColor,
            initials: assigneeInitial,
            isCurrentUser: false,
            label: assignee,
            value: assigneeId,
          }"
          :model-value="assigneeId"
          :show-chevron="false"
          :space-key="spaceKey"
          variant="inline"
          @update:model-value="save('assignee', $event)" />
        <template v-else>
          <BaseAvatar
            :color="assigneeColor"
            :initials="assigneeInitial"
            size="sm" />
          <span class="truncate">{{ assignee }}</span>
        </template>
      </div>
      <span class="issue-created">
        <IssueSourceIcon
          v-if="source"
          :source="source" />
        <time
          class="issue-time"
          :datetime="time"
          :title="`${t('created')} ${formatDateTime(time)}`">
          {{ formatCompactDate(time) }}
        </time>
      </span>
      <BaseMenu
        v-if="canMove"
        align="end"
        class="row-actions"
        side="bottom">
        <template #trigger>
          <BaseIconButton :label="t('actions')">
            <IconDots />
          </BaseIconButton>
        </template>
        <BaseMenuItem @select="props.onToggleSelection()">
          <IconSquareCheck />
          {{ selected ? t('deselectIssue') : t('selectIssue') }}
        </BaseMenuItem>
        <BaseMenuItem @select="props.onMove()">
          <IconArrowsLeftRight />
          {{ t('moveToBoard') }}
        </BaseMenuItem>
        <BaseMenuItem
          v-if="onDelete"
          :disabled="deleting"
          variant="danger"
          @select="props.onDelete?.()">
          <IconTrash />
          {{ t('deleteIssue') }}
        </BaseMenuItem>
      </BaseMenu>
    </div>
    <p
      v-if="saveMessage"
      class="form-error row-error"
      role="alert">
      {{ saveMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  IconArrowsLeftRight,
  IconDots,
  IconLock,
  IconSquareCheck,
  IconTrash,
} from '@tabler/icons-vue'
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { NuxtLink } from '#components'
import type { components } from '#infrastructure/api/generated'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseAvatar from '#layers/core/app/ui/components/BaseAvatar.vue'
import BaseCheckbox from '#layers/core/app/ui/components/BaseCheckbox.vue'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BaseMenu from '#layers/core/app/ui/components/BaseMenu.vue'
import BaseMenuItem from '#layers/core/app/ui/components/BaseMenuItem.vue'
import StatusIndicator from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusIndicator.vue'
import StatusSelect from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusSelect.vue'
import AssigneeSelect from '#layers/workspace/app/sections/issues/shared/components/AssigneeSelect/AssigneeSelect.vue'
import type { IssueAttributeLabel } from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeLabels/IssueAttributeLabels.types'
import IssueAttributeLabels from '#layers/workspace/app/sections/issues/shared/components/IssueAttributeLabels/IssueAttributeLabels.vue'
import type { IssueListQuickEditDeps } from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.deps'
import type { IssueSource } from '#layers/workspace/app/sections/issues/shared/components/IssueSourceIcon/IssueSourceIcon.types'
import IssueSourceIcon from '#layers/workspace/app/sections/issues/shared/components/IssueSourceIcon/IssueSourceIcon.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useFormatters } from '#layers/workspace/app/shared/composables/useFormatters'
import { BoardIcon, SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  assignee: string
  assigneeColor: string
  assigneeId?: string
  assigneeInitial: string
  attributes?: IssueAttributeLabel[]
  blocked: boolean
  boardColor: string
  boardId?: string
  boardName: string
  canMove: boolean
  deleting?: boolean
  hideStatus?: boolean
  issueKey: string
  onDelete?: () => void
  onMove: () => void
  onToggleSelection: () => void
  onUpdated?: () => Promise<void> | void
  organizationRoutes: OrganizationRoutes
  quickEdit?: IssueListQuickEditDeps
  selected: boolean
  selectionMode?: boolean
  showLocation: boolean
  source?: IssueSource
  spaceColor?: string
  spaceKey?: string
  spaceName?: string
  status: null | string
  statusCategory?: components['schemas']['StatusCategory']
  statusColor: string
  statusId?: string
  time: string
  title: string
  to: RouteLocationRaw
}>()

const { t } = useI18n({
  en: {
    actions: 'Issue actions',
    assignee: 'Assignee',
    backlog: 'Backlog',
    blocked: 'Blocked',
    created: 'Created',
    deleteIssue: 'Delete issue',
    deselectIssue: 'Deselect issue',
    moveToBoard: 'Move to board',
    selectIssue: 'Select issue',
    status: 'Status',
  },
  ru: {
    actions: 'Действия с задачей',
    assignee: 'Исполнитель',
    backlog: 'Бэклог',
    blocked: 'Заблокирована',
    created: 'Создана',
    deleteIssue: 'Удалить задачу',
    deselectIssue: 'Снять выделение',
    moveToBoard: 'Переместить на доску',
    selectIssue: 'Выбрать задачу',
    status: 'Статус',
  },
})

const displayStatus = computed(() => props.status ?? t('backlog'))
const { formatCompactDate, formatDateTime } = useFormatters()
const {
  execute: saveField,
  message: saveMessage,
  pending: saving,
} = useApiAction(async (field: 'assignee' | 'status', value: string) => {
  if (field === 'status') {
    await props.quickEdit?.saveStatus({ issueKey: props.issueKey, statusId: value })
  } else {
    await props.quickEdit?.saveAssignee({ assigneeId: value, issueKey: props.issueKey })
  }
})
const save = async (field: 'assignee' | 'status', value: string) => {
  if (saving.value || value === (field === 'status' ? props.statusId : props.assigneeId)) {
    return
  }
  if (await saveField(field, value)) {
    await props.onUpdated?.()
  }
}
</script>

<style scoped>
.issue-list-row {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: grid;
  font-size: var(--font-size-body);
  gap: var(--space-2);
  grid-template-columns: [select] var(--control-height-small) [content] minmax(0, 1fr);
  min-height: 3rem;
  min-width: 0;
  padding: var(--space-3);
  position: relative;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.issue-list-row:hover {
  border-color: var(--color-border-hover);
}

.issue-list-row.selected {
  background: var(--color-accent-soft);
}

.issue-list-row:has([data-state='open']) {
  z-index: 2;
}

.row-select-target {
  display: flex;
  grid-column: select;
  grid-row: 1;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.selection-mode:has(.row-select-target) .issue-content {
  grid-column: content / -1;
}

.issue-content {
  -webkit-box-orient: vertical;
  color: inherit;
  display: -webkit-box;
  font-weight: var(--font-weight-medium);
  grid-column: 1 / -1;
  grid-row: 1;
  -webkit-line-clamp: 3;
  line-height: var(--line-height-body);
  min-width: 0;
  overflow: hidden;
  overflow-wrap: anywhere;
  text-decoration: none;
}

.issue-key {
  color: var(--color-muted);
  margin-inline-end: var(--space-1);
  min-width: 0;
  white-space: nowrap;
}

.issue-title {
  display: inline;
  min-width: 0;
  overflow: hidden;
}

.issue-blocked {
  color: var(--color-warning);
  display: inline-flex;
  vertical-align: -0.125em;
}

.issue-blocked .tabler-icon {
  height: 1em;
  width: 1em;
}

/* The title opens the row; controls and other links stay above its hit area. */
.issue-content::after {
  content: '';
  inset: 0;
  position: absolute;
}

.issue-content:focus-visible {
  box-shadow: none;
  outline: none;
}

.issue-list-row:has(.issue-content:focus-visible) {
  box-shadow: var(--shadow-focus);
}

.truncate {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-status,
.issue-person,
.issue-location-space,
.issue-location-board,
.row-actions,
.issue-attributes {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.issue-status {
  align-items: center;
  display: flex;
  flex: 0 1 auto;
  gap: var(--space-2);
  max-width: 50%;
  min-height: var(--control-height-small);
}

.issue-status :deep(.base-select-root) {
  max-width: 100%;
}

.issue-status:not(:has(.base-select)) {
  padding-inline: calc(var(--space-2) + 1px);
}

.issue-person {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex: none;
  gap: var(--space-2);
  grid-column: person;
  grid-row: 3;
  justify-content: center;
  width: var(--control-height-small);
}

.issue-person :deep(.base-select-root) {
  max-width: 100%;
}

/* Keep the accessible name while the avatar takes only one control's width. */
.issue-person > .truncate {
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.row-actions {
  flex: none;
  grid-column: actions;
  grid-row: 3;
  justify-self: end;
}

.issue-attributes {
  grid-column: 1 / -1;
  grid-row: 2;
}

.issue-metadata {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  grid-column: 1 / -1;
  justify-content: space-between;
  min-width: 0;
}

.issue-footer {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  grid-column: 1 / -1;
  min-width: 0;
}

.issue-created {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
  font-size: var(--font-size-body);
  gap: var(--space-1);
  margin-left: auto;
  position: relative;
  white-space: nowrap;
  z-index: 1;
}

.issue-created :deep(.issue-source-icon) {
  font-size: var(--icon-size);
}

.issue-location {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex: 1;
  font-size: var(--font-size-body);
  gap: var(--space-1);
  min-width: 0;
}

.issue-location-space,
.issue-location-board {
  align-items: center;
  color: inherit;
  display: inline-flex;
  gap: var(--space-1);
  text-decoration: none;
}

.issue-location-space {
  flex: none;
}

.issue-location-board {
  flex: 0 1 auto;
}

a.issue-location-space:hover,
a.issue-location-board:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.issue-location .tabler-icon {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.row-error {
  grid-column: 1 / -1;
  position: relative;
  z-index: 1;
}

@container issue-list (min-width: 60rem) {
  .issue-list-row {
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--color-divider);
    border-radius: 0;
    column-gap: var(--space-2);
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    grid-template-rows: auto;
    padding: var(--space-2);
    row-gap: var(--space-1);
  }

  .issue-list-row:has(.issue-attributes) {
    grid-template-rows: auto auto;
  }

  .issue-list-row:hover {
    background: var(--color-row-hover);
    border-color: var(--color-divider);
  }

  .issue-content,
  .selection-mode:has(.row-select-target) .issue-content {
    display: grid;
    grid-column: key / span 2;
    grid-row: 1;
    grid-template-columns: subgrid;
    overflow: visible;
  }

  .issue-key {
    font-weight: 400;
    grid-column: key;
    grid-row: 1;
    margin-inline-end: 0;
  }

  .issue-title {
    display: block;
    grid-column: title;
    grid-row: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .issue-location {
    grid-column: location;
    grid-row: 1 / -1;
  }

  .issue-metadata,
  .issue-footer {
    display: contents;
  }

  .issue-created {
    grid-column: time;
    grid-row: 1 / -1;
  }

  .issue-status {
    grid-column: status;
    grid-row: 1 / -1;
    max-width: 100%;
  }

  .issue-person,
  .row-actions,
  .row-select-target {
    grid-row: 1 / -1;
  }

  .issue-attributes {
    grid-column: key / span 2;
  }

  .row-error {
    grid-row: auto;
  }
}
</style>
