<template>
  <section class="form-page">
    <div class="page-heading">
      <AppBackLink
        :label="t('backToSpace')"
        :to="organizationRoutes.space(spaceKey)" />
      <div class="page-heading-text">
        <h1>{{ t('createBoard') }}</h1>
      </div>
    </div>
    <form @submit.prevent="create">
      <label for="create-board-name">{{ t('name') }}</label>
      <input
        id="create-board-name"
        v-model="form.name"
        required />
      <label>{{ t('color') }}</label>
      <AppColorPicker v-model="form.color" />
      <label for="create-board-source">{{ t('copyStatusesFrom') }}</label>
      <select
        id="create-board-source"
        v-model="form.sourceBoardId"
        @change="copyStatuses">
        <option value="">{{ t('dontCopy') }}</option>
        <option
          v-for="board in data?.boards ?? []"
          :key="board.value"
          :value="board.value">
          {{ board.label }}
        </option>
      </select>
      <label>{{ t('statuses') }}</label>
      <div
        v-for="(status, index) in form.statuses"
        :key="status.id"
        class="status-row">
        <AppColorPicker v-model="status.color" />
        <input
          v-model="status.name"
          :aria-label="t('statusName')"
          required />
        <button
          :aria-label="t('deleteStatus')"
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
        {{ t('addStatus') }}
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
          {{ pending ? t('creating') : t('createBoard') }}
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

const { t } = useI18n({
  en: {
    addStatus: 'Add status',
    backToSpace: 'Back to space',
    color: 'Color',
    copyStatusesFrom: 'Copy statuses from',
    createBoard: 'Create board',
    creating: 'Creating…',
    deleteStatus: 'Delete status',
    dontCopy: "Don't copy",
    name: 'Name',
    statuses: 'Statuses',
    statusName: 'Status name',
  },
  ru: {
    addStatus: 'Добавить статус',
    backToSpace: 'Назад к разделу',
    color: 'Цвет',
    copyStatusesFrom: 'Скопировать статусы из',
    createBoard: 'Создать доску',
    creating: 'Создание…',
    deleteStatus: 'Удалить статус',
    dontCopy: 'Не копировать',
    name: 'Название',
    statuses: 'Статусы',
    statusName: 'Название статуса',
  },
})

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

useHead({ title: t('createBoard') })

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
