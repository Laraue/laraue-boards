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
        <span
          class="avatar"
          :style="{ background: comment.owner.color }">
          {{ comment.owner.initials }}
        </span>
        <div class="issue-comment-body">
          <div class="issue-comment-head">
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
          <template v-if="state.editingId === comment.id">
            <textarea
              v-model="state.editText"
              :aria-label="`${t('editCommentBy')} ${comment.owner.name}`"
              :disabled="!!state.pendingId || summarizing"
              rows="1"
              @input="clearMessage"
              @keydown.enter.ctrl.exact.prevent="update(comment.id)"
              @keydown.enter.meta.exact.prevent="update(comment.id)" />
            <div class="issue-comment-form-actions">
              <BaseButton
                size="small"
                v-if="state.editText.trim()"
                class="issue-comment-ai"
                :disabled="!!state.pendingId || summarizing"
                :loading="state.summarizingId === comment.id"
                @click="improveWithAi(comment.id)">
                <IconSparkles v-if="state.summarizingId !== comment.id" />
                {{ state.summarizingId === comment.id ? t('improvingWithAi') : t('improveWithAi') }}
              </BaseButton>
              <BaseButton
                size="small"
                :disabled="!!state.pendingId || summarizing"
                variant="ghost"
                @click="cancelEdit">
                {{ t('cancel') }}
              </BaseButton>
              <BaseButton
                size="small"
                :disabled="!state.editText.trim() || !!state.pendingId || summarizing"
                :loading="state.pendingId === comment.id"
                variant="primary"
                @click="update(comment.id)">
                {{ state.pendingId === comment.id ? t('saving') : t('save') }}
              </BaseButton>
            </div>
          </template>
          <p
            v-else
            class="issue-comment-text">
            {{ comment.text }}
          </p>
        </div>
      </article>
    </div>
    <div class="issue-comment-composer">
      <textarea
        v-model="state.newText"
        :aria-label="t('writeComment')"
        :disabled="!!state.pendingId || summarizing"
        :placeholder="t('writeCommentPlaceholder')"
        rows="2"
        @input="clearMessage"
        @keydown.enter.ctrl.exact.prevent="create"
        @keydown.enter.meta.exact.prevent="create" />
      <div class="issue-comment-form-actions">
        <BaseButton
          v-if="state.newText.trim()"
          size="small"
          class="issue-comment-ai"
          :disabled="!!state.pendingId || summarizing"
          :loading="state.summarizingId === 'new'"
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
import { IconArrowUp, IconPencil, IconSparkles, IconTrash } from '@tabler/icons-vue'

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
    improveWithAi: 'Clean up with AI',
    improvingWithAi: 'Cleaning up…',
    loading: 'Loading comments…',
    save: 'Save',
    saving: 'Saving…',
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
    improveWithAi: 'Привести в порядок с ИИ',
    improvingWithAi: 'Приводим в порядок…',
    loading: 'Загрузка комментариев…',
    save: 'Сохранить',
    saving: 'Сохранение…',
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

.issue-comment {
  align-items: start;
  border-bottom: 1px solid var(--color-divider);
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto minmax(0, 1fr);
  padding: var(--space-3) 0;
}

.issue-comment:first-child {
  padding-top: 0;
}

.issue-comment > .avatar {
  font-size: var(--font-size-caption);
  height: 24px;
  width: 24px;
}

.issue-comment-body {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.issue-comment-text {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  display: grid;
  gap: var(--space-2);
  padding: var(--space-2);
  transition: border-color var(--duration-fast) var(--ease-standard);
}

.issue-comment-composer:focus-within {
  border-color: var(--color-focus);
}

.issue-comment-composer textarea {
  background: transparent;
  border: 0;
  min-height: 64px;
  padding: var(--space-1) var(--space-2);
  resize: none;
}

.issue-comment-form-actions .issue-comment-ai {
  --ai-button-fill: var(--color-surface);

  background:
    linear-gradient(var(--ai-button-fill), var(--ai-button-fill)) padding-box,
    linear-gradient(90deg, var(--color-accent), #a855f7, #06b6d4) border-box;
  border-color: transparent;
}

@media (hover: hover) and (pointer: fine) {
  .issue-comment-composer:hover:not(:focus-within) {
    border-color: color-mix(in srgb, var(--color-border) 55%, var(--color-muted));
  }

  .issue-comment-form-actions .issue-comment-ai:hover:not(:disabled) {
    --ai-button-fill: var(--color-hover);

    background:
      linear-gradient(var(--ai-button-fill), var(--ai-button-fill)) padding-box,
      linear-gradient(90deg, var(--color-accent), #a855f7, #06b6d4) border-box;
  }
}
</style>
