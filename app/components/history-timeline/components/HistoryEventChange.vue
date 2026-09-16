<template>
  <span>{{ t(EVENT_KEYS[change.entityType][change.action]) }}</span>
</template>

<script setup lang="ts">
import type { HistoryEventChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryEventChangeViewModel }>()

const { t } = useI18n({
  en: {
    commentCreated: 'Comment added',
    commentDeleted: 'Comment deleted',
    commentUpdated: 'Comment updated',
    issueCreated: 'Issue created',
    issueDeleted: 'Issue deleted',
    issueUpdated: 'Issue updated',
  },
  ru: {
    commentCreated: 'Комментарий добавлен',
    commentDeleted: 'Комментарий удалён',
    commentUpdated: 'Комментарий изменён',
    issueCreated: 'Задача создана',
    issueDeleted: 'Задача удалена',
    issueUpdated: 'Задача изменена',
  },
})

const EVENT_KEYS = {
  Comment: { Create: 'commentCreated', Delete: 'commentDeleted', Update: 'commentUpdated' },
  Issue: { Create: 'issueCreated', Delete: 'issueDeleted', Update: 'issueUpdated' },
} as const satisfies Record<
  HistoryEventChangeViewModel['entityType'],
  Record<HistoryEventChangeViewModel['action'], string>
>
</script>
