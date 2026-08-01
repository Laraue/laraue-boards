<template>
  <section
    aria-label="Comments"
    class="issue-comments">
    <strong class="section-label">Comments</strong>
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
            <time :datetime="comment.createdAt">{{ formatDate(comment.createdAt) }}</time>
            <div
              v-if="comment.canModify && state.editingId !== comment.id"
              class="issue-comment-actions">
              <button
                :aria-label="`Edit comment by ${comment.owner.name}`"
                class="icon-btn small"
                :disabled="state.pendingId === comment.id"
                title="Edit"
                type="button"
                @click="startEdit(comment)">
                <Pencil />
              </button>
              <button
                :aria-label="`Delete comment by ${comment.owner.name}`"
                class="icon-btn danger small"
                :disabled="state.pendingId === comment.id"
                title="Delete"
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
              :aria-label="`Edit comment by ${comment.owner.name}`"
              :disabled="state.pendingId === comment.id"
              rows="1" />
            <div class="form-actions issue-comment-form-actions">
              <button
                class="primary small"
                :disabled="!state.editText.trim() || state.pendingId === comment.id"
                type="button"
                @click="update(comment.id)">
                {{ state.pendingId === comment.id ? 'Saving…' : 'Save' }}
              </button>
              <button
                class="secondary small"
                :disabled="state.pendingId === comment.id"
                type="button"
                @click="cancelEdit">
                Cancel
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
      aria-label="Write a comment"
      :disabled="!!state.pendingId"
      placeholder="Write a comment…"
      rows="1" />
    <div
      v-if="state.newText.trim()"
      class="form-actions issue-comment-form-actions">
      <button
        class="secondary small"
        :disabled="!!state.pendingId"
        type="button"
        @click="create">
        {{ state.pendingId === 'new' ? 'Adding…' : 'Add comment' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { LoaderCircle, Pencil, Trash2 } from '@lucide/vue'

import type { IssueCommentsDeps } from './IssueComments.deps'
import type { IssueCommentViewModel } from './IssueComments.types'

const props = defineProps<{
  deps: IssueCommentsDeps
  initialComments: IssueCommentViewModel[]
  issueKey: string
}>()

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const state = reactive({
  comments: props.initialComments,
  editingId: '',
  editText: '',
  message: '',
  newText: '',
  pendingId: '',
})

const formatDate = (value: string) => dateTimeFormatter.format(new Date(value))

const refreshComments = async () => {
  const result = await props.deps.load({ issueKey: props.issueKey })

  if (result.status === 'success') {
    state.comments = result.data
  } else {
    state.message = 'Could not load comments.'
  }
}

const run = async (pendingId: string, action: () => ReturnType<IssueCommentsDeps['create']>) => {
  state.message = ''
  state.pendingId = pendingId
  const result = await action()

  if (result.status !== 'success') {
    state.pendingId = ''
    state.message =
      result.status === 'validation-error' ? result.message : 'Could not save comment.'
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

const remove = async (id: string) => {
  if (confirm('Delete this comment?')) {
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
