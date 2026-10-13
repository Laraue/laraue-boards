<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconLayoutGridAdd"
        :parents="[
          {
            color: data?.spaceColor,
            icon: SpaceIcon,
            label: data?.spaceName ?? spaceKey,
            to: organizationRoutes.space(spaceKey),
          },
        ]"
        :title="t('createBoard')">
        <template #actions>
          <BaseButton
            :aria-label="t('createBoard')"
            :form="formId"
            icon-on-mobile
            :loading="pending"
            type="submit"
            variant="primary">
            <IconLayoutGridAdd />
            <template #label>{{ t('createBoard') }}</template>
          </BaseButton>
        </template>
      </PageHeader>
    </template>
    <section class="create-board-page">
      <form
        :id="formId"
        class="create-board-form"
        @submit.prevent="create">
        <BaseFieldGroup>
          <BaseField
            id="create-board-name"
            :label="t('name')">
            <input
              id="create-board-name"
              v-model="form.name"
              required />
          </BaseField>
          <BaseField
            v-slot="{ labelId }"
            :label="t('color')">
            <AppColorPicker
              v-model="form.color"
              :aria-labelledby="labelId" />
          </BaseField>
        </BaseFieldGroup>
        <section
          aria-labelledby="create-board-statuses"
          class="create-board-statuses">
          <BaseSectionHeader
            id="create-board-statuses"
            :description="t('statusesHint')"
            :title="t('statuses')">
            <template #actions>
              <BaseButton @click="addStatus">
                <IconPlus />
                {{ t('addStatus') }}
              </BaseButton>
            </template>
          </BaseSectionHeader>
          <BaseField
            id="create-board-source"
            :label="t('copyStatusesFrom')">
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
          </BaseField>
          <div
            v-if="form.statuses.length"
            :aria-label="t('statuses')"
            class="status-list"
            role="group">
            <div
              v-for="(status, index) in form.statuses"
              :key="status.id"
              class="status-row">
              <AppColorPicker v-model="status.color" />
              <input
                v-model="status.name"
                :aria-label="t('statusName')"
                required />
              <StatusCategorySelect v-model="status.category" />
              <BaseIconButton
                :label="t('deleteStatus')"
                variant="danger"
                @click="form.statuses.splice(index, 1)">
                <IconTrash />
              </BaseIconButton>
            </div>
          </div>
        </section>
        <p
          v-if="message"
          class="form-error">
          {{ message }}
        </p>
      </form>
    </section>
  </AppPage>
</template>

<script setup lang="ts">
import { IconLayoutGridAdd, IconPlus, IconTrash } from '@tabler/icons-vue'

import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'
import StatusCategorySelect from '~/components/status-category-select/StatusCategorySelect.vue'
import { DEFAULT_COLOR } from '~/constants/colors'
import { SpaceIcon } from '~/constants/icons'
import type { CreateBoardPageDeps } from '~/sections/boards/create-board/CreateBoardPage.deps'

const props = defineProps<{
  deps: CreateBoardPageDeps
  onCreated: (boardId: string) => Promise<void> | void
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    addStatus: 'Add status',
    color: 'Color',
    copyStatusesFrom: 'Copy statuses from',
    createBoard: 'Create board',
    deleteStatus: 'Delete status',
    dontCopy: "Don't copy",
    name: 'Name',
    statuses: 'Statuses',
    statusesHint: 'The board columns, left to right.',
    statusName: 'Status name',
  },
  ru: {
    addStatus: 'Добавить статус',
    color: 'Цвет',
    copyStatusesFrom: 'Скопировать статусы из',
    createBoard: 'Создать доску',
    deleteStatus: 'Удалить статус',
    dontCopy: 'Не копировать',
    name: 'Название',
    statuses: 'Статусы',
    statusesHint: 'Колонки доски слева направо.',
    statusName: 'Название статуса',
  },
})

const organizationRoutes = useOrganizationRoutes()
const formId = `create-board-${useId()}`

const form = reactive({
  color: DEFAULT_COLOR,
  name: '',
  sourceBoardId: '',
  statuses: [] as Array<{ category: StatusCategory; color: string; id: number; name: string }>,
})

const { data } = await useApiQuery(
  () => `create-board:${props.spaceKey}`,
  (signal) => props.deps.view({ signal, spaceKey: props.spaceKey }),
)

let nextStatusId = 0
const addStatus = () => {
  nextStatusId += 1
  form.statuses.push({
    category: form.statuses.length === 0 ? 'Created' : 'InProgress',
    color: DEFAULT_COLOR,
    id: nextStatusId,
    name: '',
  })
}

const copyStatuses = () => {
  const source = data.value?.boards.find((board) => board.value === form.sourceBoardId)
  form.statuses = (source?.statuses ?? []).map((status) => ({ ...status, id: ++nextStatusId }))
}

const { execute: submit, message, pending } = useApiAction(props.deps.create)

const create = async () => {
  const created = await submit({
    color: form.color,
    name: form.name,
    spaceKey: props.spaceKey,
    statuses: form.statuses.map(({ category, color, name }) => ({ category, color, name })),
  })
  if (created) {
    await props.onCreated(created.value)
  }
}
</script>

<style scoped>
.create-board-page {
  margin-inline: auto;
  max-width: 768px;
  width: 100%;
}

.create-board-form,
.create-board-statuses {
  display: grid;
  gap: var(--space-5);
}

.create-board-form {
  gap: var(--space-8);
}

.status-list {
  display: grid;
  gap: var(--space-2);
}

.status-row {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: minmax(min-content, 0.2fr) minmax(0, 1fr) minmax(min-content, 0.3fr) auto;
}

.status-row :deep(.color-picker) {
  width: 100%;
}
</style>
