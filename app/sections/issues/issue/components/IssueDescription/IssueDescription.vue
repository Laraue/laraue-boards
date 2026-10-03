<template>
  <div class="issue-description">
    <MarkdownEditor
      v-model="model"
      :disabled="disabled"
      :label="t('content')"
      :placeholder="t('descriptionPlaceholder')"
      @update:model-value="message = undefined" />
    <div
      v-if="!disabled"
      class="issue-description-footer">
      <slot name="actions" />
      <!-- With a label, so it is seen; only with text, as there is nothing to improve before. -->
      <BaseButton
        v-if="model.trim()"
        :loading="summarizing"
        size="small"
        :tooltip="t('improveWithAiHint')"
        variant="ghost"
        @click="summarizeContent">
        <IconSparkles v-if="!summarizing" />
        {{ summarizing ? t('improvingWithAi') : t('improveWithAi') }}
      </BaseButton>
      <span class="issue-description-hint">
        {{ t('slashHintBefore') }}
        <kbd>/</kbd>
        {{ t('slashHintAfter') }}
      </span>
      <p
        v-if="message"
        class="form-error"
        role="alert">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSparkles } from '@tabler/icons-vue'

import MarkdownEditor from '~/components/markdown-editor/MarkdownEditor.vue'

import type { IssueDescriptionDeps } from './IssueDescription.deps'

const props = defineProps<{ deps: IssueDescriptionDeps; disabled?: boolean }>()

const { t } = useI18n({
  en: {
    content: 'Content',
    descriptionPlaceholder: 'Add a description… Type / for a heading, list or table',
    improveWithAi: 'Improve with AI',
    improveWithAiHint: 'Fixes the text and writes a title',
    improvingWithAi: 'Improving…',
    slashHintAfter: 'for a heading, list, table and more',
    slashHintBefore: 'Type',
  },
  ru: {
    content: 'Содержимое',
    descriptionPlaceholder: 'Добавьте описание… / — заголовок, список или таблица',
    improveWithAi: 'Улучшить с ИИ',
    improveWithAiHint: 'Поправит текст и придумает заголовок',
    improvingWithAi: 'Улучшаем…',
    slashHintAfter: '— заголовок, список, таблица и другое',
    slashHintBefore: 'Введите',
  },
})

const model = defineModel<string>({ required: true })
// The AI summary comes with a title; the page owning the title field shares it here.
const titleModel = defineModel<string>('title', { default: '' })

const {
  execute: summarize,
  message,
  pending: summarizing,
} = useApiAction(props.deps.summarizeContent)

const summarizeContent = async (): Promise<void> => {
  const summary = await summarize({ content: model.value })
  if (!summary) {
    return
  }
  model.value = summary.value.content
  if (summary.value.title) {
    titleModel.value = summary.value.title
  }
}
</script>

<style scoped>
.issue-description {
  display: grid;
  gap: var(--space-5);
}

.issue-description :deep(.markdown) {
  min-height: calc(3 * 1.6em);
}

.issue-description-footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.issue-description-hint {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  margin-left: var(--space-2);
}

.issue-description-hint kbd {
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-small);
  font-family: var(--font-family-mono);
  font-size: var(--font-size-caption);
  padding: 0 var(--space-1);
}

.issue-description-footer .form-error {
  margin: 0 0 0 var(--space-2);
}
</style>
