<template>
  <!-- The title is the link to the issue and its hit area covers the row, so the space and board
       can be links of their own: a link may not sit inside another. -->
  <div
    class="issue-list-row"
    :class="{ 'has-actions': canMove, 'selection-mode': selectionMode }">
    <label
      v-if="canMove && selectionMode"
      class="row-select-target"
      @click.stop>
      <input
        :aria-label="t('selectIssue')"
        :checked="selected"
        class="row-select"
        type="checkbox"
        @change="props.onToggleSelection" />
    </label>
    <span class="issue-key">{{ issueKey }}</span>
    <NuxtLink
      class="issue-content"
      :to="to">
      <!-- Before the title, so the one-line clamp cuts the title and not the mark. A native title: a
           list renders many rows, too many for tooltip components. -->
      <span
        v-if="blocked"
        :aria-label="t('blocked')"
        class="issue-blocked"
        role="img"
        :title="t('blocked')">
        <IconLock aria-hidden="true" />
      </span>
      <IssueSourceIcon
        v-if="source"
        class="issue-created-via"
        :source="source" />
      {{ title }}
    </NuxtLink>
    <!-- Space and board; the space gives up room first, the full path is on hover. -->
    <span
      class="issue-location"
      :title="spaceName ? `${spaceName} / ${boardName}` : boardName">
      <NuxtLink
        v-if="spaceName && spaceKey"
        class="issue-location-space"
        :to="organizationRoutes.space(spaceKey)">
        <SpaceIcon :style="{ color: spaceColor }" />
        <span class="truncate">{{ spaceName }}</span>
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
      class="issue-status"
      :title="displayStatus"
      @click.stop.prevent>
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
    <div
      class="issue-person"
      :title="assignee"
      @click.stop.prevent>
      <AssigneeSelect
        v-if="canMove && quickEdit && spaceKey && assigneeId"
        :aria-label="t('assignee')"
        :deps="quickEdit.assigneeSelect"
        :disabled="saving"
        icon-only-on-mobile
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
    <!-- The row is a link: the menu's clicks must neither bubble to it nor follow it. -->
    <BaseMenu
      v-if="canMove"
      align="end"
      class="row-actions"
      @click.stop.prevent>
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
import type { RouteLocationRaw } from 'vue-router'

import type { components } from '#infrastructure/api/generated'
import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import type { IssueListQuickEditDeps } from '~/components/issue-list/IssueList.deps'
import type { IssueSource } from '~/components/issue-source-icon/IssueSourceIcon.types'
import IssueSourceIcon from '~/components/issue-source-icon/IssueSourceIcon.vue'
import StatusIndicator from '~/components/status-select/StatusIndicator.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { BoardIcon, SpaceIcon } from '~/constants/icons'

const props = defineProps<{
  assignee: string
  assigneeColor: string
  assigneeId?: string
  assigneeInitial: string
  blocked: boolean
  boardColor: string
  boardId?: string
  boardName: string
  canMove: boolean
  deleting?: boolean
  issueKey: string
  onDelete?: () => void
  onMove: () => void
  onToggleSelection: () => void
  onUpdated?: () => Promise<void> | void
  quickEdit?: IssueListQuickEditDeps
  selected: boolean
  selectionMode?: boolean
  source?: IssueSource
  spaceColor?: string
  spaceKey?: string
  spaceName?: string
  status: null | string
  statusCategory?: components['schemas']['StatusCategory']
  statusColor: string
  statusId?: string
  title: string
  to: RouteLocationRaw
}>()
const NuxtLink = resolveComponent('NuxtLink')
const organizationRoutes = useOrganizationRoutes()

const { t } = useI18n({
  en: {
    actions: 'Issue actions',
    assignee: 'Assignee',
    backlog: 'Backlog',
    blocked: 'Blocked',
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
    deleteIssue: 'Удалить задачу',
    deselectIssue: 'Снять выделение',
    moveToBoard: 'Переместить на доску',
    selectIssue: 'Выбрать задачу',
    status: 'Статус',
  },
})

// Issues without a status live in the backlog.
const displayStatus = computed(() => props.status ?? t('backlog'))
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
  background: transparent;
  border-bottom: 1px solid var(--color-divider);
  color: var(--color-text);
  display: grid;
  font-size: var(--font-size-body);
  gap: var(--space-3);
  /* Select, key, title, where it lives, status, assignee, actions. The location gets room for both
     names before the title gives any up. */
  grid-template-columns:
    1.25rem 4.5rem minmax(0, 1fr) minmax(10rem, 18rem) 7rem 8rem
    var(--icon-btn-size);
  min-height: 2.75rem;
  min-width: 0;
  padding: var(--space-2) var(--space-4);
  position: relative;
  text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.issue-content {
  color: inherit;
  text-decoration: none;
}

/* The title's hit area covers the whole row; the controls and links in it sit above. */
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

.row-select-target,
.issue-location-space,
.issue-location-board,
.issue-status,
.issue-person,
.row-actions {
  position: relative;
  z-index: 1;
}

/* Those layers tie across rows; a row with an open menu or select rises so its popup is on top. */
.issue-list-row:has([data-state='open']) {
  z-index: 2;
}

a.issue-location-space,
a.issue-location-board {
  color: inherit;
  text-decoration: none;
}

a.issue-location-space:hover,
a.issue-location-board:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.issue-list-row:last-child {
  border-bottom: none;
}

.issue-list-row:hover {
  background: var(--color-row-hover);
}

.issue-list-row:has(.row-select:checked) {
  background: var(--color-accent-soft);
}

.issue-list-row:not(:has(.row-select)) {
  grid-template-columns: 4.5rem minmax(0, 1fr) minmax(10rem, 18rem) 7rem 8rem var(--icon-btn-size);
}

.issue-list-row:not(.has-actions) {
  grid-template-columns: 4.5rem minmax(0, 1fr) minmax(10rem, 18rem) 7rem 8rem;
}

.issue-key {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.row-select-target {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  height: var(--icon-btn-size);
  justify-content: center;
  margin: -6px;
  visibility: hidden;
  width: var(--icon-btn-size);
}

.selection-mode .row-select-target {
  visibility: visible;
}

.issue-key {
  flex-shrink: 0;
}

.issue-content {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  flex: 1;
  font-weight: var(--font-weight-medium);
  -webkit-line-clamp: 1;
  line-height: 1.4;
  margin: 0;
  min-width: 0;
  overflow: hidden;
}

.issue-blocked {
  color: var(--color-warning);
  display: inline-flex;
  margin-right: var(--space-1);
  /* Centered on the title's lowercase letters, as an icon in a line of text. */
  vertical-align: -0.125em;
}

.issue-created-via {
  margin-right: var(--space-1);
  vertical-align: -0.125em;
}

.issue-blocked .tabler-icon {
  height: 1em;
  width: 1em;
}

.truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-location {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  font-size: var(--font-size-body);
  gap: var(--space-1);
  min-width: 0;
}

.issue-location-space,
.issue-location-board {
  align-items: center;
  display: inline-flex;
  gap: var(--space-2);
  min-width: 0;
}

/* The space is shorter and shared by many rows; it never takes more than half. */
.issue-location-space {
  flex: 0 1 auto;
  max-width: 50%;
}

.issue-location-board {
  flex: 1 1 auto;
}

.issue-location .tabler-icon {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.issue-status {
  align-items: center;
  border-radius: var(--radius-small);
  display: inline-flex;
  font-weight: 400;
  gap: var(--space-2);
  justify-self: start;
  max-width: 100%;
  min-height: 28px;
  padding: 0 var(--space-2);
}

.issue-status:has(.base-select) {
  padding: 0;
}

.row-error {
  grid-column: 1 / -1;
}

.issue-person {
  align-items: center;
  color: var(--color-muted);
  display: inline-flex;
  flex-shrink: 0;
  gap: var(--space-2);
  min-width: 0;
}

@media (max-width: 1100px) {
  .issue-list-row {
    grid-template-columns: 20px 64px minmax(0, 1fr) 8rem var(--icon-btn-size);
  }

  .issue-list-row:not(:has(.row-select)) {
    grid-template-columns: 64px minmax(0, 1fr) 8rem var(--icon-btn-size);
  }

  .issue-list-row:not(.has-actions) {
    grid-template-columns: 64px minmax(0, 1fr) 8rem;
  }

  .issue-content {
    grid-column: 3;
    grid-row: 1;
  }

  .issue-list-row:not(:has(.row-select)) .issue-content {
    grid-column: 2;
  }

  .issue-location {
    grid-column: 3;
    grid-row: 2;
  }

  .issue-list-row:not(:has(.row-select)) .issue-location {
    grid-column: 2;
  }

  .issue-person {
    grid-column: 4;
    grid-row: 2;
  }

  .issue-list-row:not(:has(.row-select)) .issue-person {
    grid-column: 3;
  }

  .issue-status {
    grid-column: 4;
    grid-row: 1;
  }

  .issue-list-row:not(:has(.row-select)) .issue-status {
    grid-column: 3;
  }

  .row-actions {
    grid-column: 5;
    grid-row: 1 / 3;
  }

  .issue-list-row:not(:has(.row-select)) .row-actions {
    grid-column: 4;
  }
}

@media (max-width: 600px) {
  .issue-list-row {
    gap: var(--space-2);
    grid-template-columns: 20px minmax(0, 1fr) minmax(0, 144px) var(--icon-btn-size);
    padding: var(--space-3) var(--space-4);
  }

  .issue-list-row:not(:has(.row-select)) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 144px) var(--icon-btn-size);
  }

  .issue-list-row:not(.has-actions) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 144px);
  }

  .issue-key {
    grid-column: 2;
    grid-row: 1;
  }

  .issue-list-row:not(:has(.row-select)) .issue-key {
    grid-column: 1;
  }

  .issue-content,
  .issue-list-row:not(:has(.row-select)) .issue-content {
    grid-column: 1 / -1;
    grid-row: 2;
    -webkit-line-clamp: 2;
  }

  .issue-location,
  .issue-list-row:not(:has(.row-select)) .issue-location {
    grid-column: 1 / -2;
    grid-row: 3;
  }

  .issue-person,
  .issue-list-row:not(:has(.row-select)) .issue-person {
    grid-column: -2 / -1;
    grid-row: 3;
    justify-self: end;
  }

  .issue-person > .truncate {
    display: none;
  }

  .issue-status,
  .issue-list-row:not(:has(.row-select)) .issue-status {
    grid-column: 3;
    justify-self: end;
  }

  .issue-list-row:not(:has(.row-select)) .issue-status {
    grid-column: 2;
  }

  .row-actions {
    grid-column: 4;
    grid-row: 1;
  }

  .issue-list-row:not(:has(.row-select)) .row-actions {
    grid-column: 3;
  }
}
</style>
