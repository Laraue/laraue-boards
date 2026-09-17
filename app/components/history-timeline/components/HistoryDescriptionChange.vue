<template>
  <IssueDescriptionDiff
    :diff="change.diff"
    :label="t(change.commentAction ? COMMENT_KEYS[change.commentAction] : 'description')" />
</template>

<script setup lang="ts">
import IssueDescriptionDiff from '~/sections/issues/issue/components/IssueDescription/components/IssueDescriptionDiff/IssueDescriptionDiff.vue'

import type { HistoryAction, HistoryDescriptionChangeViewModel } from '../HistoryTimeline.types'

defineProps<{ change: HistoryDescriptionChangeViewModel }>()

const { t } = useI18n({
  en: {
    commentCreated: 'Comment added',
    commentDeleted: 'Comment deleted',
    commentUpdated: 'Comment updated',
    description: 'Description',
  },
  ru: {
    commentCreated: 'Комментарий добавлен',
    commentDeleted: 'Комментарий удалён',
    commentUpdated: 'Комментарий изменён',
    description: 'Описание',
  },
})

const COMMENT_KEYS = {
  Create: 'commentCreated',
  Delete: 'commentDeleted',
  Update: 'commentUpdated',
} as const satisfies Record<HistoryAction, string>
</script>
