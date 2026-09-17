<template>
  <span>{{ change.action === 'added' ? t('added') : t('removed') }}:</span>
  <div class="history-values">
    <span
      class="history-new-value"
      :title="fileName">
      <a
        v-if="change.imageUrl"
        :aria-label="`${t('open')} ${fileName}`"
        class="history-attachment"
        :href="change.imageUrl"
        target="_blank">
        <img
          :alt="fileName"
          :src="change.imageUrl" />
      </a>
      {{ fileName }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { HistoryAttachmentChangeViewModel } from '../HistoryTimeline.types'

const props = defineProps<{ change: HistoryAttachmentChangeViewModel }>()

const { t } = useI18n({
  en: {
    added: 'Added attachment',
    open: 'Open',
    removed: 'Removed attachment',
    untitledFile: 'Untitled file',
  },
  ru: {
    added: 'Вложение добавлено',
    open: 'Открыть',
    removed: 'Вложение удалено',
    untitledFile: 'Файл без названия',
  },
})

const fileName = props.change.fileName ?? t('untitledFile')
</script>

<style scoped>
.history-values,
.history-new-value {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  min-width: 0;
}

.history-values {
  flex: 1;
}

.history-new-value {
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-attachment {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  flex: 0 0 auto;
  height: 24px;
  overflow: hidden;
  width: 24px;
}

.history-attachment img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}
</style>
