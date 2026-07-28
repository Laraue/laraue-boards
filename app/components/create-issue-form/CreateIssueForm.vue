<template>
  <form
    class="issue-form issue-form-page"
    @submit.prevent="submit">
    <div class="issue-form-main">
      <textarea
        :id="`${idPrefix}-content`"
        v-model="form.content"
        aria-label="Content"
        placeholder="What needs attention?"
        required
        rows="8" />
      <IssueAttachments
        :attachments="[]"
        :disabled="pending"
        :files="form.files"
        :on-change="changeFiles" />
    </div>
    <div class="issue-form-side">
      <template v-if="board">
        <label>Board</label>
        <div class="selected-entity">{{ board.name }}</div>
      </template>
      <template v-else>
        <label :for="`${idPrefix}-space`">Space</label>
        <SpaceSelect
          :id="`${idPrefix}-space`"
          v-model="form.spaceKey"
          :deps="selectDeps.spaceSelect" />

        <label :for="`${idPrefix}-board`">Board</label>
        <BoardSelect
          :id="`${idPrefix}-board`"
          v-model="form.boardId"
          :deps="selectDeps.boardSelect"
          :space-key="form.spaceKey" />
      </template>

      <label :for="`${idPrefix}-status`">Status</label>
      <StatusSelect
        :id="`${idPrefix}-status`"
        v-model="form.statusId"
        :board-id="boardId"
        :deps="deps.statusSelect" />

      <IssueAttributeFields
        v-model="form.attributeValues"
        :attributes="attributes" />

      <label :for="`${idPrefix}-assignee`">Assignee</label>
      <AssigneeSelect
        :id="`${idPrefix}-assignee`"
        v-model="form.assigneeId"
        :deps="deps.assigneeSelect"
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
        :disabled="pending || !form.statusId || !form.assigneeId"
        type="submit">
        {{ pending ? 'Adding…' : 'Add issue' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import AssigneeSelect from '~/components/assignee-select/AssigneeSelect.vue'
import BoardSelect from '~/components/board-select/BoardSelect.vue'
import IssueAttachments from '~/components/issue-attachments/IssueAttachments.vue'
import IssueAttributeFields from '~/components/issue-attribute-fields/IssueAttributeFields.vue'
import SpaceSelect from '~/components/space-select/SpaceSelect.vue'
import StatusSelect from '~/components/status-select/StatusSelect.vue'
import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

import type { CreateIssueFormDeps } from './CreateIssueForm.deps'
import type { CreateIssueFormProps } from './CreateIssueForm.types'

const props = defineProps<CreateIssueFormProps & { deps: CreateIssueFormDeps }>()
const idPrefix = useId()
const form = reactive({
  assigneeId: '',
  attributeValues: {} as Record<string, string>,
  boardId: '',
  content: '',
  files: [] as File[],
  spaceKey: '',
  statusId: '',
})
const selectDeps = {
  boardSelect: props.deps.boardSelect,
  spaceSelect: props.deps.spaceSelect,
}
const boardId = computed(() => props.board?.id ?? form.boardId)
const spaceKey = computed(() => props.board?.spaceKey ?? form.spaceKey)
const {
  execute: create,
  message,
  pending,
} = useAction(props.deps.create, {
  onSuccess: (issue) => props.onCreated(issue.issueKey),
})

const changeFiles = (files: File[]) => {
  form.files = files
}

const submit = () => {
  if (!form.statusId || !form.assigneeId) {
    return
  }
  void create({
    assigneeId: form.assigneeId,
    attributeValues: getIssueAttributeValueInput(form.attributeValues, props.attributes),
    content: form.content,
    files: form.files,
    statusId: form.statusId,
  })
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

.issue-form-main {
  align-self: stretch;
  display: grid;
  gap: var(--space-4);
  grid-area: main;
  grid-auto-rows: max-content;
  grid-template-rows: minmax(200px, 1fr);
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

@media (max-width: 760px) {
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
