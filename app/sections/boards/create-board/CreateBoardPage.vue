<template>
  <section class="form-page">
    <div class="page-heading">
      <AppBackLink
        label="Back to space"
        :to="organizationRoutes.space(spaceKey)" />
      <div class="page-heading-text">
        <h1>Create board</h1>
      </div>
    </div>
    <form @submit.prevent="create">
      <label for="create-board-name">Name</label>
      <input
        id="create-board-name"
        v-model="form.name"
        required />
      <label>Color</label>
      <AppColorPicker v-model="form.color" />
      <label for="create-board-source">Copy statuses from</label>
      <select
        id="create-board-source"
        v-model="form.sourceBoardId"
        @change="copyStatuses">
        <option value="">Don't copy</option>
        <option
          v-for="board in data?.boards ?? []"
          :key="board.value"
          :value="board.value">
          {{ board.label }}
        </option>
      </select>
      <label>Statuses</label>
      <div
        v-for="(status, index) in form.statuses"
        :key="status.id"
        class="status-row">
        <AppColorPicker v-model="status.color" />
        <input
          v-model="status.name"
          aria-label="Status name"
          required />
        <button
          aria-label="Delete status"
          class="icon-btn danger"
          type="button"
          @click="form.statuses.splice(index, 1)">
          <Trash2 />
        </button>
      </div>
      <button
        class="secondary add-status"
        type="button"
        @click="addStatus">
        <Plus />
        Add status
      </button>
      <p
        v-if="message"
        class="form-error">
        {{ message }}
      </p>
      <div class="form-actions">
        <button
          class="primary"
          :disabled="pending">
          {{ pending ? 'Creating…' : 'Create board' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from '@lucide/vue'

import { DEFAULT_COLOR } from '~/constants/colors'
import type { CreateBoardPageDeps } from '~/sections/boards/create-board/CreateBoardPage.deps'

const props = defineProps<{
  deps: CreateBoardPageDeps
  onCreated: (boardId: string) => Promise<void> | void
  spaceKey: string
}>()

const organizationRoutes = useOrganizationRoutes()

const form = reactive({
  color: DEFAULT_COLOR,
  name: '',
  sourceBoardId: '',
  statuses: [] as Array<{ color: string; id: number; name: string }>,
})

const { data } = await useQuery(
  () => `create-board:${props.spaceKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ signal, spaceKey: props.spaceKey }),
  { watch: [() => props.spaceKey] },
)

let nextStatusId = 0
const addStatus = () => {
  nextStatusId += 1
  form.statuses.push({ color: DEFAULT_COLOR, id: nextStatusId, name: '' })
}

const copyStatuses = () => {
  const source = data.value?.boards.find((board) => board.value === form.sourceBoardId)
  form.statuses = (source?.statuses ?? []).map((status) => ({ ...status, id: ++nextStatusId }))
}

const create = () => {
  void submit({
    color: form.color,
    name: form.name,
    spaceKey: props.spaceKey,
    statuses: form.statuses.map(({ color, name }) => ({ color, name })),
  })
}

useHead({ title: 'Create board' })

const {
  execute: submit,
  message,
  pending,
} = useAction(props.deps.create, {
  onSuccess: (board) => props.onCreated(board.boardId),
})
</script>

<style scoped>
.status-row {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: minmax(min-content, 0.2fr) minmax(0, 1fr) auto;
  margin-top: var(--space-2);
}

.status-row :deep(.color-picker) {
  width: 100%;
}

.add-status {
  margin-top: var(--space-2);
}
</style>
