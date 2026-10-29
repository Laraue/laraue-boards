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
        :title="t('createBoard')" />
    </template>
    <section class="create-board-page">
      <!-- A form as Create attribute's: fields, the statuses with Add status under them, the submit
           at the end. -->
      <form
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
          <BaseField
            id="create-board-source"
            :label="t('copyStatusesFrom')">
            <BaseSelect
              id="create-board-source"
              :model-value="form.sourceBoardId"
              :options="[
                { label: t('dontCopy'), value: '' },
                ...(data?.boards ?? []).map(({ label, value }) => ({ label, value })),
              ]"
              @update:model-value="copyStatuses" />
          </BaseField>
        </BaseFieldGroup>
        <fieldset class="create-board-statuses">
          <legend>{{ t('statuses') }}</legend>
          <p class="create-board-hint">{{ t('statusesHint') }}</p>
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
          <BaseButton
            class="add-status"
            @click="addStatus">
            <IconPlus />
            {{ t('addStatus') }}
          </BaseButton>
        </fieldset>
        <p
          v-if="message"
          class="form-error">
          {{ message }}
        </p>
        <div class="form-actions">
          <BaseButton
            :loading="pending"
            type="submit"
            variant="primary">
            {{ t('createBoard') }}
          </BaseButton>
        </div>
      </form>
    </section>
  </AppPage>
</template>

<script setup lang="ts">
import { IconLayoutGridAdd, IconPlus, IconTrash } from '@tabler/icons-vue'
import { reactive } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseField from '#layers/core/app/ui/components/BaseField.vue'
import BaseFieldGroup from '#layers/core/app/ui/components/BaseFieldGroup.vue'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'
import type { CreateBoardPageDeps } from '#layers/workspace/app/sections/boards/create-board/CreateBoardPage.deps'
import type { StatusCategory } from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.types'
import StatusCategorySelect from '#layers/workspace/app/sections/boards/shared/components/StatusCategorySelect/StatusCategorySelect.vue'
import AppColorPicker from '#layers/workspace/app/shared/components/AppColorPicker.vue'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { DEFAULT_COLOR } from '#layers/workspace/app/shared/constants/colors'
import { SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: CreateBoardPageDeps
  onCreated: (boardId: string) => Promise<void> | void
  organizationRoutes: OrganizationRoutes
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

const copyStatuses = (sourceBoardId: string) => {
  form.sourceBoardId = sourceBoardId
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

.create-board-form {
  display: grid;
  gap: var(--space-5);
}

.create-board-statuses {
  border: 0;
  display: grid;
  gap: var(--space-2);
  margin: 0;
  min-width: 0;
  padding: 0;
}

.create-board-statuses legend {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-1);
  padding: 0;
}

.create-board-hint {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  margin: 0;
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

.add-status {
  justify-self: start;
}
</style>
