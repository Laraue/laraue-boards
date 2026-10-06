<template>
  <div class="issue-description">
    <MarkdownEditor
      ref="editor"
      v-model="model"
      :disabled="disabled"
      :label="t('content')"
      :placeholder="t('descriptionPlaceholder')"
      @update:model-value="message = undefined" />
    <div
      v-if="!disabled"
      class="issue-description-footer">
      <slot name="actions" />
      <!-- The blocks "/" offers, found by a button rather than a line of text to read. -->
      <IconButton
        :label="t('insertBlock')"
        :tooltip="t('insertBlockHint')"
        @click="editor?.insertSlash()">
        <IconSlash />
      </IconButton>
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
import { IconSlash, IconSparkles } from '@tabler/icons-vue'

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
    insertBlock: 'Insert a block',
    insertBlockHint: 'Heading, list, table and more (or type /)',
  },
  ru: {
    content: 'Содержимое',
    descriptionPlaceholder: 'Добавьте описание… / — заголовок, список или таблица',
    improveWithAi: 'Улучшить с ИИ',
    improveWithAiHint: 'Поправит текст и придумает заголовок',
    improvingWithAi: 'Улучшаем…',
    insertBlock: 'Вставить блок',
    insertBlockHint: 'Заголовок, список, таблица и другое (или введите /)',
  },
})

const model = defineModel<string>({ required: true })
// The AI summary comes with a title; the page owning the title field shares it here.
const titleModel = defineModel<string>('title', { default: '' })

const editor = useTemplateRef<InstanceType<typeof MarkdownEditor>>('editor')

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
  min-height: calc(3 * 1.7em);
}

.issue-description :deep(.markdown :is(p, li, ul, ol, blockquote)) {
  line-height: 1.7;
}

.issue-description :deep(.markdown > * + *) {
  margin-top: var(--space-4);
}

.issue-description-footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.issue-description-footer .form-error {
  margin: 0 0 0 var(--space-2);
}
</style>
