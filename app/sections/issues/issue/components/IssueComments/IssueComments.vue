<template>
  <section
    :aria-label="t('comments')"
    class="issue-comments">
    <p
      v-if="loadMessage || saveMessage || summarizeMessage"
      class="form-error"
      role="alert">
      {{ loadMessage || saveMessage || summarizeMessage }}
    </p>
    <p
      v-if="!comments"
      class="muted">
      {{ t('loading') }}
    </p>
    <div
      v-else-if="comments.length"
      class="issue-comment-list">
      <article
        v-for="comment in comments"
        :key="comment.id"
        class="issue-comment">
        <div class="issue-comment-body">
          <div class="issue-comment-head">
            <span
              class="avatar"
              :style="{ background: comment.owner.color }">
              {{ comment.owner.initials }}
            </span>
            <span class="issue-comment-name">{{ comment.owner.name }}</span>
            <time :datetime="comment.createdAt">{{ formatDateTime(comment.createdAt) }}</time>
            <div
              v-if="comment.canModify && state.editingId !== comment.id"
              class="issue-comment-actions">
              <IconButton
                :disabled="!!state.pendingId || summarizing"
                :label="`${t('editCommentBy')} ${comment.owner.name}`"
                :tooltip="t('edit')"
                @click="startEdit(comment)">
                <IconPencil />
              </IconButton>
              <IconButton
                :disabled="!!state.pendingId || summarizing"
                :label="`${t('deleteCommentBy')} ${comment.owner.name}`"
                :loading="state.pendingId === comment.id"
                :tooltip="t('delete')"
                @click="remove(comment.id)">
                <IconTrash />
              </IconButton>
            </div>
          </div>
          <div
            v-if="state.editingId === comment.id"
            class="issue-comment-composer">
            <MarkdownEditor
              v-model="state.editText"
              :disabled="!!state.pendingId || summarizing"
              :label="`${t('editCommentBy')} ${comment.owner.name}`"
              @submit="update(comment.id)"
              @update:model-value="clearMessage" />
            <div class="issue-comment-form-actions">
              <BaseButton
                v-if="state.editText.trim()"
                :disabled="!!state.pendingId || summarizing"
                :loading="state.summarizingId === comment.id"
                size="small"
                :tooltip="t('improveWithAiHint')"
                variant="ghost"
                @click="improveWithAi(comment.id)">
                <IconSparkles v-if="state.summarizingId !== comment.id" />
                {{ state.summarizingId === comment.id ? t('improvingWithAi') : t('improveWithAi') }}
              </BaseButton>
              <IconButton
                :disabled="!!state.pendingId || summarizing"
                :label="t('cancel')"
                @click="cancelEdit">
                <IconX />
              </IconButton>
              <IconButton
                :disabled="!state.editText.trim() || !!state.pendingId || summarizing"
                :label="t('save')"
                :loading="state.pendingId === comment.id"
                :tooltip="t('saveShortcut')"
                :variant="state.editText.trim() ? 'primary' : 'ghost'"
                @click="update(comment.id)">
                <IconCheck />
              </IconButton>
            </div>
          </div>
          <!-- eslint-disable vue/no-v-html -- sanitized by renderMarkdown -->
          <div
            v-else
            class="markdown"
            v-html="renderMarkdown(comment.text)" />
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </article>
    </div>
    <div class="issue-comment-composer">
      <MarkdownEditor
        v-model="state.newText"
        :disabled="!!state.pendingId || summarizing"
        :label="t('writeComment')"
        :placeholder="t('writeCommentPlaceholder')"
        @submit="create"
        @update:model-value="clearMessage" />
      <div class="issue-comment-form-actions">
        <BaseButton
          v-if="state.newText.trim()"
          :disabled="!!state.pendingId || summarizing"
          :loading="state.summarizingId === 'new'"
          size="small"
          :tooltip="t('improveWithAiHint')"
          variant="ghost"
          @click="improveWithAi('new')">
          <IconSparkles v-if="state.summarizingId !== 'new'" />
          {{ state.summarizingId === 'new' ? t('improvingWithAi') : t('improveWithAi') }}
        </BaseButton>
        <IconButton
          :disabled="!state.newText.trim() || !!state.pendingId || summarizing"
          :label="t('addComment')"
          :loading="state.pendingId === 'new'"
          :tooltip="t('addCommentShortcut')"
          :variant="state.newText.trim() ? 'primary' : 'ghost'"
          @click="create">
          <IconArrowUp />
        </IconButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  IconArrowUp,
  IconCheck,
  IconPencil,
  IconSparkles,
  IconTrash,
  IconX,
} from '@tabler/icons-vue'

import MarkdownEditor from '~/components/markdown-editor/MarkdownEditor.vue'
import { renderMarkdown } from '~/utils/renderMarkdown'

import type { IssueCommentsDeps, IssueCommentViewModel } from './IssueComments.deps'

const props = defineProps<{
  deps: IssueCommentsDeps
  issueKey: string
}>()

const { t } = useI18n({
  en: {
    addComment: 'Add comment',
    addCommentShortcut: 'Add comment (Ctrl+Enter)',
    cancel: 'Cancel',
    comments: 'Comments',
    delete: 'Delete',
    deleteCommentBy: 'Delete comment by',
    deleteConfirm: 'Delete this comment?',
    edit: 'Edit',
    editCommentBy: 'Edit comment by',
    improveWithAi: 'Improve with AI',
    improveWithAiHint: 'Fixes the text',
    improvingWithAi: 'Improving…',
    loading: 'Loading comments…',
    save: 'Save',
    saveShortcut: 'Save (Ctrl+Enter)',
    writeComment: 'Write a comment',
    writeCommentPlaceholder: 'Write a comment…',
  },
  ru: {
    addComment: 'Добавить комментарий',
    addCommentShortcut: 'Добавить комментарий (Ctrl+Enter)',
    cancel: 'Отмена',
    comments: 'Комментарии',
    delete: 'Удалить',
    deleteCommentBy: 'Удалить комментарий пользователя',
    deleteConfirm: 'Удалить этот комментарий?',
    edit: 'Изменить',
    editCommentBy: 'Изменить комментарий пользователя',
    improveWithAi: 'Улучшить с ИИ',
    improveWithAiHint: 'Поправит текст',
    improvingWithAi: 'Улучшаем…',
    loading: 'Загрузка комментариев…',
    save: 'Сохранить',
    saveShortcut: 'Сохранить (Ctrl+Enter)',
    writeComment: 'Написать комментарий',
    writeCommentPlaceholder: 'Напишите комментарий…',
  },
})

const { formatDateTime } = useFormatters()

// Lazy, so the issue itself shows without waiting for its comments.
const {
  data: comments,
  message: loadMessage,
  refresh: refreshComments,
} = await useApiQuery(
  () => `issue-comments:${props.issueKey}`,
  (signal) => props.deps.load({ issueKey: props.issueKey, signal }),
  { lazy: true },
)

const state = reactive({
  editingId: '',
  editText: '',
  newText: '',
  pendingId: '',
  summarizingId: '',
})

const {
  execute: summarizeContent,
  message: summarizeMessage,
  pending: summarizing,
} = useApiAction(props.deps.summarizeContent)
// Creating, editing and deleting share one message, so they run through one action.
const { execute: save, message: saveMessage } = useApiAction((action: () => Promise<void>) =>
  action(),
)
const clearMessage = () => {
  saveMessage.value = undefined
  summarizeMessage.value = undefined
}

const run = async (pendingId: string, action: () => Promise<void>) => {
  clearMessage()
  state.pendingId = pendingId
  const saved = await save(action)
  if (saved) {
    await refreshComments()
  }
  state.pendingId = ''
  return Boolean(saved)
}

const create = async () => {
  const text = state.newText.trim()
  if (text && (await run('new', () => props.deps.create({ issueKey: props.issueKey, text })))) {
    state.newText = ''
  }
}

const startEdit = (comment: IssueCommentViewModel) => {
  state.editingId = comment.id
  state.editText = comment.text
}

const cancelEdit = () => {
  state.editingId = ''
  state.editText = ''
}

const update = async (id: string) => {
  const text = state.editText.trim()
  if (text && (await run(id, () => props.deps.update({ id, text })))) {
    cancelEdit()
  }
}

const improveWithAi = async (id: string) => {
  if (state.pendingId || summarizing.value) {
    return
  }

  const content = (id === 'new' ? state.newText : state.editText).trim()
  if (!content) {
    return
  }

  clearMessage()
  state.summarizingId = id
  const summary = await summarizeContent({ content })
  state.summarizingId = ''
  if (!summary) {
    return
  }
  if (id === 'new') {
    state.newText = summary.value
  } else if (state.editingId === id) {
    state.editText = summary.value
  }
}

const remove = async (id: string) => {
  if (confirm(t('deleteConfirm'))) {
    await run(id, () => props.deps.delete({ id }))
  }
}
</script>

<style scoped>
.issue-comments {
  display: grid;
  gap: var(--space-4);
}

.issue-comment-list {
  display: grid;
  gap: var(--space-2);
}

/* Barely off the page, as in Linear: a tint and a faint line, so the text leads, not the box. */
.issue-comment-body,
.issue-comment-composer {
  background: var(--color-workspace);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-card);
  transition: border-color var(--duration-fast) var(--ease-standard);
}

/* A card like a history entry: the author with the avatar on top, the text under it. */
.issue-comment-body {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-2) var(--space-3);
}

.issue-comment-head .avatar {
  font-size: 9px;
  height: 20px;
  width: 20px;
}

.issue-comment-head {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  min-height: 24px;
}

.issue-comment-name {
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

/* The buttons are taller than the line: they overlap it instead of pushing the text down. */
.issue-comment-actions {
  display: flex;
  margin: calc(-1 * var(--space-1)) 0 calc(-1 * var(--space-1)) auto;
}

.issue-comment-form-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
}

.issue-comment-composer {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
}

/* Editing happens in the comment's own card, without a second frame. */
.issue-comment .issue-comment-composer {
  border: 0;
  padding: 0;
}

.issue-comment-composer:focus-within,
.issue-comment-body:has(.issue-comment-composer:focus-within) {
  border-color: var(--color-focus);
}

@media (hover: hover) and (pointer: fine) {
  /* The comment's buttons show on hover, so the list reads as text. */
  .issue-comment:not(:hover, :focus-within) .issue-comment-actions {
    opacity: 0;
  }

  .issue-comment-composer:hover:not(:focus-within) {
    border-color: color-mix(in srgb, var(--color-border) 55%, var(--color-muted));
  }
}
</style>
