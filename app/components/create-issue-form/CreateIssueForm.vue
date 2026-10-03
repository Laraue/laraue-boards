<template>
  <form
    class="issue-form"
    @submit.prevent="submit">
    <div class="issue-form-main">
      <div class="issue-head">
        <textarea
          :id="`${idPrefix}-title`"
          :aria-label="t('title')"
          class="issue-title-input"
          :maxlength="256"
          :placeholder="t('titlePlaceholder')"
          rows="1"
          :value="form.title"
          @input="changeTitle"
          @keydown.enter.prevent />
        <IssueDescription
          v-model="form.content"
          v-model:title="form.title"
          :deps="deps.description">
          <template #actions>
            <IconButton
              :disabled="pending"
              :label="t('attachImages')"
              :tooltip="t('attachImagesHint')"
              @click="attachments?.pick()">
              <IconPaperclip />
            </IconButton>
          </template>
        </IssueDescription>
      </div>
      <IssueAttachments
        ref="attachments"
        :attachments="[]"
        :disabled="pending"
        :files="form.files"
        :on-change="changeFiles" />
    </div>
    <aside
      :aria-label="t('properties')"
      class="issue-form-side">
      <h2>{{ t('properties') }}</h2>
      <div class="issue-properties">
        <template v-if="board">
          <span class="issue-property-label">{{ t('space') }}</span>
          <div class="selected-entity">
            <SpaceIcon :style="{ color: board.spaceColor }" />
            <span>{{ board.spaceName ?? board.spaceKey }}</span>
          </div>
          <span class="issue-property-label">{{ t('board') }}</span>
          <div class="selected-entity">
            <component
              :is="board.isBacklog ? IconListDetails : BoardIcon"
              :style="{ color: board.color }" />
            <span>{{ board.name }}</span>
          </div>
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

        <label :for="`${idPrefix}-assignee`">{{ t('assignee') }}</label>
        <AssigneeSelect
          :id="`${idPrefix}-assignee`"
          v-model="form.assigneeId"
          :deps="deps.assigneeSelect"
          eager
          select-current-user
          :space-key="spaceKey" />
        <IssueAttributeFields
          v-model="form.attributeValues"
          :attributes="attributes" />
      </div>
    </aside>
    <div class="issue-actions">
      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <BaseButton
        :disabled="pending || !form.content.trim() || !form.statusId || !form.assigneeId"
        :loading="pending"
        type="submit"
        variant="primary">
        {{ pending ? t('adding') : t('addIssue') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconListDetails, IconPaperclip } from '@tabler/icons-vue'

import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import IssueAttachments from '~/components/issue-attachments/IssueAttachments.vue'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import IssueAttributeFields from '~/components/issue-attribute-fields/IssueAttributeFields.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { BoardIcon, SpaceIcon } from '~/constants/icons'
import IssueDescription from '~/sections/issues/issue/components/IssueDescription/IssueDescription.vue'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import type { CreateIssueFormDeps } from './CreateIssueForm.deps'

const props = defineProps<{
  attributes: IssueAttributeField[]
  // A fixed destination; without it the user picks the space and the board.
  board?: {
    color?: string
    id: string
    isBacklog?: boolean
    name: string
    spaceColor?: string
    spaceKey: string
    spaceName?: string
  }
  deps: CreateIssueFormDeps
  initialStatusId?: string
  onCreated: (issueKey: string) => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    adding: 'Adding…',
    addIssue: 'Add issue',
    assignee: 'Assignee',
    attachImages: 'Attach images',
    attachImagesHint: 'Attach PNG or JPG images, or paste them with Ctrl+V',
    board: 'Board',
    properties: 'Properties',
    space: 'Space',
    status: 'Status',
    title: 'Title',
    titlePlaceholder: 'Leave empty to generate it with AI',
  },
  ru: {
    adding: 'Добавление…',
    addIssue: 'Добавить задачу',
    assignee: 'Исполнитель',
    attachImages: 'Прикрепить изображения',
    attachImagesHint: 'Прикрепите PNG или JPG либо вставьте их через Ctrl+V',
    board: 'Доска',
    properties: 'Свойства',
    space: 'Раздел',
    status: 'Статус',
    title: 'Заголовок',
    titlePlaceholder: 'Оставьте пустым, чтобы создать его с помощью ИИ',
  },
})

const idPrefix = useId()
const attachments = useTemplateRef<InstanceType<typeof IssueAttachments>>('attachments')
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

const changeTitle = (event: Event) => {
  form.title = (event.target as HTMLTextAreaElement).value.replaceAll(/\s*\n\s*/g, ' ')
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
  column-gap: var(--space-8);
  display: grid;
  grid-template-areas:
    'main side'
    'actions actions';
  grid-template-columns: minmax(0, 1fr) 304px;
  margin-inline: auto;
  max-width: 1240px;
  row-gap: var(--space-4);
  width: 100%;
}

.issue-title-input {
  background: transparent;
  border: 0;
  border-radius: 0;
  color: var(--color-text);
  font-size: 26px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
  line-height: 1.25;
  max-height: none;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  resize: none;
}

.issue-title-input:is(:hover, :focus, :disabled) {
  border: 0;
  box-shadow: none;
}

.issue-head {
  display: grid;
  gap: var(--space-4);
}

.issue-form-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  grid-area: main;
  min-width: 0;
  padding-right: var(--space-3);
}

.issue-form-side {
  display: grid;
  font-size: 13px;
  gap: var(--space-4);
  grid-area: side;
  min-width: 0;
}

.issue-form-side h2 {
  font-size: inherit;
  margin: 0;
}

.issue-properties {
  --control-height: var(--control-height-small);

  align-items: center;
  display: grid;
  gap: var(--space-2) var(--space-3);
  grid-auto-rows: var(--control-height);
  grid-template-columns: 88px minmax(0, 1fr);
}

.issue-properties :deep(label),
.issue-property-label {
  color: var(--color-muted);
  font-weight: normal;
  margin: 0;
  overflow-wrap: anywhere;
}

.issue-properties :deep(.base-select-root) {
  justify-items: start;
}

.issue-properties :deep(.base-select) {
  width: fit-content;
}

.issue-properties :deep(:is(input, .base-select)) {
  background: transparent;
  border-color: transparent;
  font-size: inherit;
}

.issue-properties :deep(.base-select-content) {
  font-size: inherit;
}

.issue-properties :deep(:is(input, .base-select):hover:not(:disabled)) {
  background: var(--color-hover);
  border-color: var(--color-border);
}

.issue-properties:has(label:hover)
  :deep(:is(input, .base-select):not(:focus-visible, [data-state='open'])) {
  background: transparent;
  border-color: transparent;
}

.issue-properties :deep(:is(input, .base-select):is(:focus-visible, [data-state='open'])) {
  border-color: var(--color-focus);
}

.selected-entity {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
  min-width: 0;
  padding: 0 var(--space-3);
}

.selected-entity > svg {
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.selected-entity > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-actions {
  grid-area: actions;
}

.issue-actions .form-error {
  margin: 0 0 var(--space-3);
}

@media (max-width: 767px) {
  .issue-title-input {
    font-size: var(--font-size-title);
  }

  .issue-form {
    column-gap: 0;
    grid-template-areas:
      'main'
      'side'
      'actions';
    grid-template-columns: 1fr;
    row-gap: var(--space-5);
  }
}
</style>
