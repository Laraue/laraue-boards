<template>
  <span>{{ t('assignee') }}:</span>
  <div class="history-value-change">
    <span :title="change.oldValue ?? t('none')">
      <BaseAvatar
        v-if="change.oldValue !== null"
        :color="change.oldColor ?? 'var(--color-border)'"
        :initials="initials(change.oldValue)"
        size="xs" />
      <i
        v-else-if="change.oldColor"
        :style="{ background: change.oldColor }" />
      {{ change.oldValue ?? t('none') }}
    </span>
    <IconArrowRight />
    <span
      class="history-new-value"
      :title="change.newValue ?? t('none')">
      <BaseAvatar
        v-if="change.newValue !== null"
        :color="change.newColor ?? 'var(--color-border)'"
        :initials="initials(change.newValue)"
        size="xs" />
      <i
        v-else-if="change.newColor"
        :style="{ background: change.newColor }" />
      {{ change.newValue ?? t('none') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { IconArrowRight } from '@tabler/icons-vue'

import type { HistoryAssigneeChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryAssigneeChangeViewModel }>()

const { t } = useI18n({
  en: { assignee: 'Assignee', none: 'None' },
  ru: { assignee: 'Исполнитель', none: 'Нет' },
})

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
</script>
