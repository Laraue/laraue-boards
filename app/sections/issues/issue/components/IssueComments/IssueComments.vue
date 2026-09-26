<template>
  <section
    :aria-label="t('comments')"
    class="issue-comments">
    <strong class="section-label">{{ t('comments') }}</strong>
    <p
      v-if="state.message"
      class="form-error"
      role="alert">
      {{ state.message }}
    </p>
    <div
      v-if="state.comments.length"
      class="issue-comment-list">
      <article
        v-for="comment in state.comments"
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
              <button
                :aria-label="`${t('editCommentBy')} ${comment.owner.name}`"
                class="icon-btn small"
                :disabled="!!state.pendingId || !!state.summarizingId"
                :title="t('edit')"
                type="button"
                @click="startEdit(comment)">
                <Pencil />
              </button>
              <button
                :aria-label="`${t('deleteCommentBy')} ${comment.owner.name}`"
                class="icon-btn danger small"
                :disabled="!!state.pendingId || !!state.summarizingId"
                :title="t('delete')"
                type="button"
                @click="remove(comment.id)">
                <LoaderCircle
                  v-if="state.pendingId === comment.id"
                  class="spin" />
                <Trash2 v-else />
              </button>
            </div>
          </div>
          <template v-if="state.editingId === comment.id">
            <textarea
              v-model="state.editText"
              :aria-label="`${t('editCommentBy')} ${comment.owner.name}`"
              :disabled="!!state.pendingId || !!state.summarizingId"
              rows="1"
              @input="state.message = ''" />
            <div class="form-actions issue-comment-form-actions">
              <button
                v-if="state.editText.trim()"
                class="secondary small"
                :disabled="!!state.pendingId || !!state.summarizingId"
                type="button"
                @click="improveWithAi(comment.id)">
                <LoaderCircle
                  v-if="state.summarizingId === comment.id"
                  class="spin" />
                <Sparkles v-else />
                {{ state.summarizingId === comment.id ? t('improvingWithAi') : t('improveWithAi') }}
              </button>
              <button
                class="primary small"
                :disabled="!state.editText.trim() || !!state.pendingId || !!state.summarizingId"
                type="button"
                @click="update(comment.id)">
                {{ state.pendingId === comment.id ? t('saving') : t('save') }}
              </button>
              <button
                class="secondary small"
                :disabled="!!state.pendingId || !!state.summarizingId"
                type="button"
                @click="cancelEdit">
                {{ t('cancel') }}
              </button>
            </div>
          </template>
          <p
            v-else
            class="issue-comment-bubble">
            {{ comment.text }}
          </p>
        </div>
      </article>
    </div>
    <textarea
      v-model="state.newText"
      :aria-label="t('writeComment')"
      :disabled="!!state.pendingId || !!state.summarizingId"
      :placeholder="t('writeCommentPlaceholder')"
      rows="1"
      @input="state.message = ''" />
    <div
      v-if="state.newText.trim()"
      class="form-actions issue-comment-form-actions">
      <button
        class="secondary small"
        :disabled="!!state.pendingId || !!state.summarizingId"
        type="button"
        @click="improveWithAi('new')">
        <LoaderCircle
          v-if="state.summarizingId === 'new'"
          class="spin" />
        <Sparkles v-else />
        {{ state.summarizingId === 'new' ? t('improvingWithAi') : t('improveWithAi') }}
      </button>
      <button
        class="secondary small"
        :disabled="!!state.pendingId || !!state.summarizingId"
        type="button"
        @click="create">
        {{ state.pendingId === 'new' ? t('adding') : t('addComment') }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { LoaderCircle, Pencil, Sparkles, Trash2 } from '@lucide/vue'

import { getErrorMessage } from '~/utils/getErrorMessage'

import type { IssueCommentsDeps } from './IssueComments.deps'
import type { IssueCommentViewModel } from './IssueComments.types'

const props = defineProps<{
  deps: IssueCommentsDeps
  initialComments: IssueCommentViewModel[]
  issueKey: string
}>()

const { locale, t } = useI18n({
  en: {
    addComment: 'Add comment',
    adding: 'Adding…',
    cancel: 'Cancel',
    comments: 'Comments',
    delete: 'Delete',
    deleteCommentBy: 'Delete comment by',
    deleteConfirm: 'Delete this comment?',
    edit: 'Edit',
    editCommentBy: 'Edit comment by',
    improveWithAi: 'Improve with AI',
    improvingWithAi: 'Improving…',
    loadError: 'Could not load comments.',
    save: 'Save',
    saveError: 'Could not save comment.',
    saving: 'Saving…',
    writeComment: 'Write a comment',
    writeCommentPlaceholder: 'Write a comment…',
  },
  ru: {
    addComment: 'Добавить комментарий',
    adding: 'Добавление…',
    cancel: 'Отмена',
    comments: 'Комментарии',
    delete: 'Удалить',
    deleteCommentBy: 'Удалить комментарий пользователя',
    deleteConfirm: 'Удалить этот комментарий?',
    edit: 'Изменить',
    editCommentBy: 'Изменить комментарий пользователя',
    improveWithAi: 'Улучшить с помощью ИИ',
    improvingWithAi: 'Улучшение…',
    loadError: 'Не удалось загрузить комментарии.',
    save: 'Сохранить',
    saveError: 'Не удалось сохранить комментарий.',
    saving: 'Сохранение…',
    writeComment: 'Написать комментарий',
    writeCommentPlaceholder: 'Напишите комментарий…',
  },
})

const { formatDateTime } = useFormatters()

const state = reactive({
  comments: props.initialComments,
  editingId: '',
  editText: '',
  message: '',
  newText: '',
  pendingId: '',
  summarizingId: '',
})

const refreshComments = async () => {
  const result = await props.deps.load({ issueKey: props.issueKey })

  if (result.status === 'success') {
    state.comments = result.data
  } else {
    state.message = t('loadError')
  }
}

const run = async (pendingId: string, action: () => ReturnType<IssueCommentsDeps['create']>) => {
  state.message = ''
  state.pendingId = pendingId
  const result = await action()

  if (result.status !== 'success') {
    state.pendingId = ''
    state.message =
      result.status === 'validation-error'
        ? result.message || getErrorMessage(400, locale.value)
        : t('saveError')
    return false
  }

  await refreshComments()
  state.pendingId = ''
  return true
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
  if (state.pendingId || state.summarizingId) {
    return
  }

  const content = (id === 'new' ? state.newText : state.editText).trim()
  if (!content) {
    return
  }

  state.message = ''
  state.summarizingId = id
  try {
    const result = await props.deps.summarizeContent({ content })
    if (result.status === 'success') {
      if (id === 'new') {
        state.newText = result.data
      } else if (state.editingId === id) {
        state.editText = result.data
      }
    } else if (result.status === 'validation-error') {
      state.message = result.message || getErrorMessage(400, locale.value)
    } else {
      state.message = getErrorMessage(result.code, locale.value)
    }
  } catch {
    state.message = getErrorMessage(0, locale.value)
  } finally {
    state.summarizingId = ''
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
  gap: var(--space-3);
  padding-bottom: var(--space-1);
}

.issue-comment-list {
  display: grid;
  gap: var(--space-4);
}

.issue-comment {
  align-items: start;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto minmax(0, 1fr);
}

.issue-comment > .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

.issue-comment-body {
  display: grid;
  gap: var(--space-1);
  justify-items: start;
  min-width: 0;
}

.issue-comment p {
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.issue-comment-bubble {
  background: var(--color-soft);
  border-radius: var(--radius-card);
  border-top-left-radius: var(--radius-small);
  max-width: 100%;
  padding: var(--space-1) var(--space-2);
}

.issue-comment-head {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  justify-self: stretch;
  min-height: var(--icon-btn-size-small);
}

.issue-comment-name {
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

.issue-comment-actions {
  display: flex;
  gap: var(--space-1);
  margin-left: auto;
}

.issue-comment-actions .icon-btn {
  background: transparent;
  border: 0;
  color: var(--color-muted);
}

.issue-comment-actions .icon-btn:hover:not(:disabled) {
  background: var(--color-soft);
  color: var(--color-text);
}

.issue-comment-actions .icon-btn.danger:hover:not(:disabled) {
  color: var(--color-danger);
}

.issue-comment-actions .spin {
  animation: var(--animation-spin);
}

.issue-comment-body textarea {
  width: 100%;
}

.issue-comment-form-actions {
  gap: var(--space-1);
  margin-top: 0;
}
</style>
