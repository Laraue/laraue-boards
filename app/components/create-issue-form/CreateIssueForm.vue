<template>
  <form
    class="issue-form issue-form-page"
    @submit.prevent="submit">
    <div class="issue-form-main">
      <div class="issue-field">
        <label :for="`${idPrefix}-title`">{{ t('title') }}</label>
        <input
          :id="`${idPrefix}-title`"
          v-model="form.title"
          class="issue-title-input"
          :maxlength="256"
          :placeholder="t('titlePlaceholder')" />
      </div>
      <div class="issue-field issue-field-description">
        <span class="issue-field-label">{{ t('description') }}</span>
        <IssueDescription
          v-model="form.content"
          v-model:title="form.title"
          :deps="deps.description" />
      </div>
      <IssueAttachments
        :attachments="[]"
        :disabled="pending"
        :files="form.files"
        :on-change="changeFiles" />
    </div>
    <div class="issue-form-side">
      <template v-if="board">
        <label>{{ t('board') }}</label>
        <div class="selected-entity">{{ board.name }}</div>
      </template>
      <template v-else>
        <label :for="`${idPrefix}-space`">{{ t('space') }}</label>
        <SpaceSelect
          :id="`${idPrefix}-space`"
          v-model="form.spaceKey"
          :deps="selectDeps.spaceSelect" />

        <label :for="`${idPrefix}-board`">{{ t('board') }}</label>
        <BoardSelect
          :id="`${idPrefix}-board`"
          v-model="form.boardId"
          :deps="selectDeps.boardSelect"
          :space-key="form.spaceKey" />
      </template>

      <label :for="`${idPrefix}-status`">{{ t('status') }}</label>
      <StatusSelect
        :id="`${idPrefix}-status`"
        v-model="form.statusId"
        :board-id="boardId"
        :deps="deps.statusSelect"
        eager
        select-first />

      <IssueAttributeFields
        v-model="form.attributeValues"
        :attributes="attributes" />

      <label :for="`${idPrefix}-assignee`">{{ t('assignee') }}</label>
      <AssigneeSelect
        :id="`${idPrefix}-assignee`"
        v-model="form.assigneeId"
        :deps="deps.assigneeSelect"
        eager
        select-current-user
        :space-key="spaceKey" />

      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
    </div>
    <div class="page-actions">
      <button
        class="primary"
        :disabled="pending || !form.content.trim() || !form.statusId || !form.assigneeId"
        type="submit">
        {{ pending ? t('adding') : t('addIssue') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import IssueAttachments from '~/components/issue-attachments/IssueAttachments.vue'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import IssueAttributeFields from '~/components/issue-attribute-fields/IssueAttributeFields.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import IssueDescription from '~/sections/issues/issue/components/IssueDescription/IssueDescription.vue'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import type { CreateIssueFormDeps } from './CreateIssueForm.deps'

const props = defineProps<{
  attributes: IssueAttributeField[]
  // A fixed destination; without it the user picks the space and the board.
  board?: { id: string; name: string; spaceKey: string }
  deps: CreateIssueFormDeps
  initialStatusId?: string
  onCreated: (issueKey: string) => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    adding: 'Adding…',
    addIssue: 'Add issue',
    assignee: 'Assignee',
    board: 'Board',
    description: 'Description',
    space: 'Space',
    status: 'Status',
    title: 'Title',
    titlePlaceholder: 'Leave empty to generate it with AI',
  },
  ru: {
    adding: 'Добавление…',
    addIssue: 'Добавить задачу',
    assignee: 'Исполнитель',
    board: 'Доска',
    description: 'Описание',
    space: 'Раздел',
    status: 'Статус',
    title: 'Заголовок',
    titlePlaceholder: 'Оставьте пустым, чтобы создать его с помощью ИИ',
  },
})

const idPrefix = useId()
const form = reactive({
  assigneeId: '',
  attributeValues: {} as Record<string, string>,
  boardId: '',
  content: '',
  files: [] as File[],
  spaceKey: '',
  statusId: props.initialStatusId ?? '',
  title: '',
})
const selectDeps = {
  boardSelect: props.deps.boardSelect,
  spaceSelect: props.deps.spaceSelect,
}
const boardId = computed(() => props.board?.id ?? form.boardId)
const spaceKey = computed(() => props.board?.spaceKey ?? form.spaceKey)
const { execute: create, message, pending } = useApiAction(props.deps.create)

const changeFiles = (files: File[]) => {
  form.files = files
}

const submit = async (): Promise<void> => {
  const created = await create({
    assigneeId: form.assigneeId,
    attributeValues: getIssueAttributeValueInput(form.attributeValues, props.attributes),
    content: form.content,
    files: form.files,
    statusId: form.statusId,
    title: form.title,
  })
  if (created) {
    await props.onCreated(created.value)
  }
}
</script>

<style scoped>
.issue-form {
  align-items: start;
  column-gap: var(--space-6);
  display: grid;
  grid-template-areas: 'main side';
  grid-template-columns: minmax(0, 5fr) minmax(0, 3fr);
  width: 100%;
}

.issue-title-input {
  font-size: var(--font-size-title);
  font-weight: normal;
}

.issue-field {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.issue-field-description {
  grid-template-rows: max-content minmax(0, 1fr);
  min-height: 0;
}

/* Same look as the global label: the description has no single control a label could point at. */
.issue-field-label {
  font-weight: var(--font-weight-semibold);
}

.issue-field > label {
  margin: 0;
}

.issue-form-main {
  align-self: stretch;
  display: grid;
  gap: var(--space-4);
  grid-area: main;
  grid-auto-rows: max-content;
  grid-template-rows: max-content minmax(200px, 1fr);
  min-height: 0;
  min-width: 0;
}

.issue-form textarea {
  min-height: 200px;
}

.issue-form-side {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-area: side;
  grid-auto-rows: minmax(var(--control-height), auto);
  grid-template-columns: max-content minmax(0, 1fr);
  place-self: start stretch;
}

.issue-form-side > label {
  margin: 0;
}

.issue-form-side > :is(.form-error, .page-actions) {
  grid-column: 1 / -1;
}

.issue-form-page {
  margin-top: var(--space-5);
}

.selected-entity {
  align-items: center;
  background: var(--color-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  display: flex;
  min-height: var(--control-height);
  padding: 0 var(--space-3);
}

@media (max-width: 767px) {
  .issue-form {
    column-gap: 0;
    grid-template-areas:
      'main'
      'side';
    grid-template-columns: 1fr;
    row-gap: var(--space-5);
  }
}
</style>
