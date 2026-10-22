<!-- The board's own status in the page header: a menu to change it for an editor, a plain label
     for everyone else. Colored like a badge, but as big as the header's controls, so the color
     fills the whole button. -->
<template>
  <BaseMenu v-if="canUpdate">
    <template #trigger>
      <BaseButton
        :aria-label="t('changeStatus', { status: statusLabel(status) })"
        class="board-status"
        :class="statusClass[status]"
        :loading="saving">
        {{ statusLabel(status) }}
        <IconChevronDown class="board-status-chevron" />
      </BaseButton>
    </template>
    <BaseMenuItem
      v-for="option in statusOptions"
      :key="option"
      @select="select(option)">
      <IconCheck
        class="board-status-check"
        :class="{ hidden: option !== status }" />
      {{ statusLabel(option) }}
    </BaseMenuItem>
  </BaseMenu>
  <span
    v-else
    class="board-status"
    :class="statusClass[status]">
    {{ statusLabel(status) }}
  </span>
</template>

<script setup lang="ts">
import { IconCheck, IconChevronDown } from '@tabler/icons-vue'

import type { BoardStatus } from './BoardStatusMenu.types'

const props = defineProps<{
  canUpdate: boolean
  onChange: (status: BoardStatus) => Promise<void> | void
  saving: boolean
  status: BoardStatus
}>()

const { t } = useI18n({
  en: {
    changeStatus: 'Board status: {status}. Change',
    done: 'Done',
    inProgress: 'In progress',
    new: 'New',
  },
  ru: {
    changeStatus: 'Статус доски: {status}. Изменить',
    done: 'Готово',
    inProgress: 'В работе',
    new: 'Новая',
  },
})

const statusOptions: BoardStatus[] = ['New', 'Active', 'Done']
// The same words and colors as the boards list of the space page.
const statusClass = { Active: 'warning', Done: 'success', New: 'neutral' } as const

const statusLabel = (status: BoardStatus) =>
  ({ Active: t('inProgress'), Done: t('done'), New: t('new') })[status]

const select = (status: BoardStatus) => {
  if (status !== props.status) {
    void props.onChange(status)
  }
}
</script>

<style scoped>
.board-status {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  color: var(--color-muted);
  display: inline-flex;
  flex: none;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  gap: var(--space-1);
  height: var(--control-height);
  justify-content: center;
  padding: 0 var(--space-3);
  white-space: nowrap;
}

.board-status.warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.board-status.success {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.board-status-chevron {
  height: 0.75rem;
  width: 0.75rem;
}

.board-status-check {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.board-status-check.hidden {
  visibility: hidden;
}
</style>
