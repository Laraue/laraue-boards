<!-- The board's own status in the page header: a menu to change it for an editor, a plain badge
     for everyone else. -->
<template>
  <BaseMenu
    v-if="canUpdate"
    align="end">
    <template #trigger>
      <BaseButton
        :aria-label="t('changeStatus', { status: statusLabel(status) })"
        class="board-status-trigger"
        :loading="saving"
        size="small"
        variant="ghost">
        <BaseBadge :variant="statusVariant[status]">{{ statusLabel(status) }}</BaseBadge>
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
  <BaseBadge
    v-else
    :variant="statusVariant[status]">
    {{ statusLabel(status) }}
  </BaseBadge>
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
const statusVariant = { Active: 'warning', Done: 'success', New: 'neutral' } as const

const statusLabel = (status: BoardStatus) =>
  ({ Active: t('inProgress'), Done: t('done'), New: t('new') })[status]

const select = (status: BoardStatus) => {
  if (status !== props.status) {
    void props.onChange(status)
  }
}
</script>

<style scoped>
.board-status-trigger {
  gap: var(--space-1);
}

.board-status-chevron {
  color: var(--color-muted);
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
