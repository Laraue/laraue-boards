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
    <div
      v-if="!comments"
      class="issue-comments-loading"
      role="status">
      <IconLoader2 />
      <span>{{ t('loading') }}</span>
    </div>
    <div
      v-else-if="comments.length"
      class="issue-comment-list">
      <article
        v-for="comment in comments"
        :key="comment.id"
        class="issue-comment">
        <div class="issue-comment-body">
          <div class="issue-comment-head">
            <BaseAvatar
              :color="comment.owner.color"
              :initials="comment.owner.initials"
              size="sm" />
            <span class="issue-comment-name">{{ comment.owner.name }}</span>
            <!-- Like the history: a comment an agent or a script wrote through an API key says which key. -->
            <span
              v-if="comment.owner.apiKeyName"
              class="issue-comment-key">
              <IconKey />
              {{ t('viaKey', { key: comment.owner.apiKeyName }) }}
            </span>
            <time :datetime="comment.createdAt">{{ formatDateTime(comment.createdAt) }}</time>
            <BaseMenu
              v-if="comment.canModify && state.editingId !== comment.id"
              align="end"
              class="issue-comment-actions">
              <template #trigger>
                <BaseIconButton
                  :disabled="!!state.pendingId || summarizing"
                  :label="`${t('actionsFor')} ${comment.owner.name}`"
                  :loading="state.pendingId === comment.id">
                  <IconDots />
                </BaseIconButton>
              </template>
              <BaseMenuItem @select="startEdit(comment)">
                <IconPencil />
                {{ t('edit') }}
              </BaseMenuItem>
              <BaseMenuItem
                variant="danger"
                @select="remove(comment.id)">
                <IconTrash />
                {{ t('delete') }}
              </BaseMenuItem>
            </BaseMenu>
          </div>
          <div
            v-if="state.editingId === comment.id"
            class="issue-comment-composer"
            @paste="editAttachments?.[0]?.paste($event)">
            <MarkdownEditor
              v-model="state.editText"
              :disabled="!!state.pendingId || summarizing"
              :label="`${t('editCommentBy')} ${comment.owner.name}`"
              @submit="update(comment.id)"
              @update:model-value="clearMessage" />
            <IssueAttachments
              ref="editAttachments"
              :attachments="comment.attachments"
              :disabled="!!state.pendingId || summarizing"
              :files="state.editFiles"
              :on-change="(files) => (state.editFiles = files)"
              :on-remove-attachment="(id) => state.editRemovedAttachmentIds.push(id)"
              paste-from-parent
              :removed-attachment-ids="state.editRemovedAttachmentIds" />
            <div class="issue-comment-form-actions">
              <BaseIconButton
                class="issue-comment-attach"
                :disabled="!!state.pendingId || summarizing"
                :label="t('attachFiles')"
                :tooltip="t('attachFilesHint')"
                @click="editAttachments?.[0]?.pick()">
                <IconPaperclip />
              </BaseIconButton>
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
              <BaseIconButton
                :disabled="!!state.pendingId || summarizing"
                :label="t('cancel')"
                @click="cancelEdit">
                <IconX />
              </BaseIconButton>
              <BaseIconButton
                :disabled="!state.editText.trim() || !!state.pendingId || summarizing"
                :label="t('save')"
                :loading="state.pendingId === comment.id"
                :tooltip="t('saveShortcut')"
                :variant="state.editText.trim() ? 'primary' : 'ghost'"
                @click="update(comment.id)">
                <IconCheck />
              </BaseIconButton>
            </div>
          </div>
          <!-- eslint-disable vue/no-v-html -- sanitized by renderMarkdown -->
          <div
            v-else
            class="markdown"
            v-html="renderMarkdown(comment.text)" />
          <!-- eslint-enable vue/no-v-html -->
          <!-- Only shown: they're changed while editing the comment. -->
          <IssueAttachments
            v-if="state.editingId !== comment.id && comment.attachments.length"
            :attachments="comment.attachments"
            :disabled="false" />
        </div>
      </article>
    </div>
    <!-- Only once loaded, as the history: a comment written before would land out of place. -->
    <!-- A file pasted here goes to the comment; elsewhere on the page, to the issue. -->
    <div
      v-if="comments"
      class="issue-comment-composer"
      @paste="newAttachments?.paste($event)">
      <MarkdownEditor
        v-model="state.newText"
        :disabled="!!state.pendingId || summarizing"
        :label="t('writeComment')"
        :placeholder="t('writeCommentPlaceholder')"
        @submit="create"
        @update:model-value="clearMessage" />
      <IssueAttachments
        ref="newAttachments"
        :attachments="[]"
        :disabled="!!state.pendingId || summarizing"
        :files="state.newFiles"
        :on-change="(files) => (state.newFiles = files)"
        paste-from-parent />
      <div class="issue-comment-form-actions">
        <BaseIconButton
          class="issue-comment-attach"
          :disabled="!!state.pendingId || summarizing"
          :label="t('attachFiles')"
          :tooltip="t('attachFilesHint')"
          @click="newAttachments?.pick()">
          <IconPaperclip />
        </BaseIconButton>
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
        <BaseIconButton
          :disabled="!state.newText.trim() || !!state.pendingId || summarizing"
          :label="t('addComment')"
          :loading="state.pendingId === 'new'"
          :tooltip="t('addCommentShortcut')"
          :variant="state.newText.trim() ? 'primary' : 'ghost'"
          @click="create">
          <IconArrowUp />
        </BaseIconButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  IconArrowUp,
  IconCheck,
  IconDots,
  IconKey,
  IconLoader2,
  IconPaperclip,
  IconPencil,
  IconSparkles,
  IconTrash,
  IconX,
} from '@tabler/icons-vue'

import IssueAttachments from '~/components/issue-attachments/IssueAttachments.vue'
import MarkdownEditor from '~/components/markdown-editor/MarkdownEditor.vue'
import { renderMarkdown } from '~/utils/renderMarkdown'

import type { IssueCommentsDeps, IssueCommentViewModel } from './IssueComments.deps'

const props = defineProps<{
  deps: IssueCommentsDeps
  issueKey: string
}>()

const confirm = useConfirm()
const { t } = useI18n({
  en: {
    actionsFor: 'Actions for the comment by',
    addComment: 'Add comment',
    addCommentShortcut: 'Add comment (Ctrl+Enter)',
    attachFiles: 'Attach files to the comment',
    attachFilesHint:
      'Attach images (up to 3 MB) or documents — PDF, DOCX, Markdown, TXT, JSON (up to 10 MB) — or paste them into the comment with Ctrl+V',
    cancel: 'Cancel',
    comments: 'Comments',
    delete: 'Delete',
    deleteConfirm: 'Delete this comment?',
    edit: 'Edit',
    editCommentBy: 'Edit comment by',
    improveWithAi: 'Improve with AI',
    improveWithAiHint: 'Fixes the text',
    improvingWithAi: 'Improving…',
    loading: 'Loading comments…',
    save: 'Save',
    saveShortcut: 'Save (Ctrl+Enter)',
    viaKey: 'via {key}',
    writeComment: 'Write a comment',
    writeCommentPlaceholder: 'Write a comment…',
  },
  ru: {
    actionsFor: 'Действия с комментарием пользователя',
    addComment: 'Добавить комментарий',
    addCommentShortcut: 'Добавить комментарий (Ctrl+Enter)',
    attachFiles: 'Прикрепить файлы к комментарию',
    attachFilesHint:
      'Прикрепите изображения (до 3 МБ) или документы — PDF, DOCX, Markdown, TXT, JSON (до 10 МБ) — либо вставьте их в комментарий через Ctrl+V',
    cancel: 'Отмена',
    comments: 'Комментарии',
    delete: 'Удалить',
    deleteConfirm: 'Удалить этот комментарий?',
    edit: 'Изменить',
    editCommentBy: 'Изменить комментарий пользователя',
    improveWithAi: 'Улучшить с ИИ',
    improveWithAiHint: 'Поправит текст',
    improvingWithAi: 'Улучшаем…',
    loading: 'Загрузка комментариев…',
    save: 'Сохранить',
    saveShortcut: 'Сохранить (Ctrl+Enter)',
    viaKey: 'через {key}',
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
  editFiles: [] as File[],
  editingId: '',
  editRemovedAttachmentIds: [] as string[],
  editText: '',
  newFiles: [] as File[],
  newText: '',
  pendingId: '',
  summarizingId: '',
})

const newAttachments = useTemplateRef<InstanceType<typeof IssueAttachments>>('newAttachments')
// In the comment list, so an array: only the comment being edited has one.
const editAttachments =
  useTemplateRef<InstanceType<typeof IssueAttachments>[]>('editAttachments')

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
  const files = state.newFiles
  if (
    text &&
    (await run('new', () => props.deps.create({ files, issueKey: props.issueKey, text })))
  ) {
    state.newFiles = []
    state.newText = ''
  }
}

const startEdit = (comment: IssueCommentViewModel) => {
  state.editFiles = []
  state.editingId = comment.id
  state.editRemovedAttachmentIds = []
  state.editText = comment.text
}

const cancelEdit = () => {
  state.editFiles = []
  state.editingId = ''
  state.editRemovedAttachmentIds = []
  state.editText = ''
}

const update = async (id: string) => {
  const text = state.editText.trim()
  const files = state.editFiles
  const removeAttachmentIds = state.editRemovedAttachmentIds
  if (text && (await run(id, () => props.deps.update({ files, id, removeAttachmentIds, text })))) {
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
  if (await confirm({ danger: true, title: t('deleteConfirm') })) {
    await run(id, () => props.deps.delete({ id }))
  }
}
</script>

<style scoped>
.issue-comments {
  display: grid;
  gap: var(--space-4);
}

.issue-comments-loading {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
}

.issue-comments-loading svg {
  animation: var(--animation-spin);
  height: 14px;
  width: 14px;
}

.issue-comment-list {
  display: grid;
  gap: var(--space-2);
}

/* White blocks on the page, like the kit's lists and cards. */
.issue-comment-body,
.issue-comment-composer {
  background: var(--color-surface);
  border: 1px solid var(--color-border-surface);
  border-radius: var(--radius-card);
  transition: border-color var(--duration-fast) var(--ease-standard);
}

/* A card like a history entry: the author with the avatar on top, the text under it. */
.issue-comment-body {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-3) var(--space-4);
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

.issue-comment-key {
  align-items: center;
  display: inline-flex;
  gap: var(--space-1);
  min-width: 0;
  overflow-wrap: anywhere;
}

.issue-comment-key svg {
  flex: none;
  height: 14px;
  width: 14px;
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

/* The other actions are on the right, by the send button. */
.issue-comment-attach {
  margin-inline-end: auto;
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
  .issue-comment-composer:hover:not(:focus-within) {
    border-color: color-mix(in srgb, var(--color-border) 55%, var(--color-muted));
  }
}
</style>
