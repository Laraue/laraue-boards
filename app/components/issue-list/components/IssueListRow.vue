<template>
  <NuxtLink
    class="issue-list-row"
    :class="{ 'has-actions': canMove, 'selection-mode': selectionMode }"
    :to="to">
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
    <p class="issue-content">{{ title }}</p>
    <span
      class="issue-location"
      :title="spaceName ? `${spaceName} / ${boardName}` : boardName">
      <span
        v-if="spaceName"
        class="issue-location-part">
        <SpaceIcon />
        <span class="truncate">{{ spaceName }}</span>
      </span>
      <span v-if="spaceName">/</span>
      <span class="issue-location-part">
        <BoardIcon />
        <span class="truncate">{{ boardName }}</span>
      </span>
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
        <span
          class="avatar"
          :style="{ background: assigneeColor }">
          {{ assigneeInitial }}
        </span>
        <span class="truncate">{{ assignee }}</span>
      </template>
    </div>
    <!-- The row is a link: the menu's clicks must neither bubble to it nor follow it. -->
    <AppMenu
      v-if="canMove"
      align="end"
      class="row-actions"
      @click.stop.prevent>
      <template #trigger>
        <IconButton :label="t('actions')">
          <IconDots />
        </IconButton>
      </template>
      <AppMenuItem @select="props.onToggleSelection()">
        <IconSquareCheck />
        {{ selected ? t('deselectIssue') : t('selectIssue') }}
      </AppMenuItem>
      <AppMenuItem @select="props.onMove()">
        <IconArrowsLeftRight />
        {{ t('moveToBoard') }}
      </AppMenuItem>
      <AppMenuItem
        v-if="onDelete"
        :disabled="deleting"
        variant="danger"
        @select="props.onDelete?.()">
        <IconTrash />
        {{ t('deleteIssue') }}
      </AppMenuItem>
    </AppMenu>
    <p
      v-if="saveMessage"
      class="form-error row-error"
      role="alert">
      {{ saveMessage }}
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
import { IconArrowsLeftRight, IconDots, IconSquareCheck, IconTrash } from '@tabler/icons-vue'
import type { RouteLocationRaw } from 'vue-router'

import type { components } from '#infrastructure/api/generated'
import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import type { IssueListQuickEditDeps } from '~/components/issue-list/IssueList.deps'
import StatusIndicator from '~/components/status-select/StatusIndicator.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { BoardIcon, SpaceIcon } from '~/constants/icons'

const props = defineProps<{
  assignee: string
  assigneeColor: string
  assigneeId?: string
  assigneeInitial: string
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
  spaceKey?: string
  spaceName?: string
  status: null | string
  statusCategory?: components['schemas']['StatusCategory']
  statusColor: string
  statusId?: string
  title: string
  to: RouteLocationRaw
}>()

const { t } = useI18n({
  en: {
    actions: 'Issue actions',
    assignee: 'Assignee',
    backlog: 'Backlog',
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
  grid-template-columns: 20px 72px minmax(0, 1fr) minmax(120px, 200px) 100px 128px var(
      --icon-btn-size
    );
  min-height: 48px;
  min-width: 0;
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  transition: background-color var(--duration-fast) var(--ease-standard);
}

.issue-list-row:last-child {
  border-bottom: none;
}

.issue-list-row:hover {
  background: color-mix(in srgb, var(--color-hover) 20%, transparent);
}

.issue-list-row:has(.row-select:checked) {
  background: var(--color-accent-soft);
}

.issue-list-row:not(:has(.row-select)) {
  grid-template-columns: 72px minmax(0, 1fr) minmax(120px, 200px) 100px 128px var(--icon-btn-size);
}

.issue-list-row:not(.has-actions) {
  grid-template-columns: 72px minmax(0, 1fr) minmax(120px, 200px) 100px 128px;
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

.truncate {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-location,
.issue-location-part {
  align-items: center;
  display: inline-flex;
  min-width: 0;
}

.issue-location {
  color: var(--color-muted);
  font-size: var(--font-size-body);
  gap: var(--space-1);
}

.issue-location-part {
  gap: var(--space-2);
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
  font-size: var(--font-size-small);
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
  font-size: var(--font-size-small);
  gap: var(--space-2);
  min-width: 0;
}

.issue-person > .avatar {
  font-size: 10px;
  height: 20px;
  width: 20px;
}

@media (max-width: 1100px) {
  .issue-list-row {
    grid-template-columns: 20px 64px minmax(0, 1fr) 88px var(--icon-btn-size);
  }

  .issue-list-row:not(:has(.row-select)) {
    grid-template-columns: 64px minmax(0, 1fr) 88px var(--icon-btn-size);
  }

  .issue-list-row:not(.has-actions) {
    grid-template-columns: 64px minmax(0, 1fr) 88px;
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
    flex-wrap: wrap;
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
