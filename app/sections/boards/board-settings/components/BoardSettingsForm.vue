<template>
  <form
    class="board-settings-form"
    @submit.prevent="submit">
    <section
      :aria-labelledby="`${idPrefix}-general`"
      class="settings-section">
      <h2 :id="`${idPrefix}-general`">{{ t('general') }}</h2>
      <div class="settings-fields">
        <div class="settings-field">
          <label
            class="field-label"
            for="board-settings-name">
            {{ t('name') }}
          </label>
          <BaseInput
            id="board-settings-name"
            v-model="state.name"
            :disabled="!viewModel.canUpdate || submitting"
            required />
        </div>
        <div class="settings-field">
          <span
            :id="`${idPrefix}-color`"
            class="field-label">
            {{ t('color') }}
          </span>
          <AppColorPicker
            v-model="state.color"
            :aria-labelledby="`${idPrefix}-color`"
            :disabled="!viewModel.canUpdate || submitting" />
        </div>
        <div class="settings-field">
          <label
            class="field-label"
            for="board-settings-status">
            {{ t('boardStatus') }}
          </label>
          <div class="settings-status">
            <BaseSelect
              id="board-settings-status"
              :disabled="!viewModel.canUpdate || submitting"
              :model-value="state.status"
              :options="statusOptions"
              @update:model-value="updateStatus" />
          </div>
        </div>
      </div>
    </section>
    <section
      :aria-labelledby="`${idPrefix}-columns`"
      class="settings-section">
      <div class="settings-section-heading">
        <div>
          <h2 :id="`${idPrefix}-columns`">{{ t('columns') }}</h2>
          <p class="settings-hint">{{ t('columnsHint') }}</p>
        </div>
        <BaseButton
          v-if="viewModel.canUpdate"
          :disabled="submitting"
          @click="addColumn">
          <IconPlus />
          {{ t('addColumn') }}
        </BaseButton>
      </div>
      <DragDropProvider
        :plugins="defaultPreset.plugins"
        :sensors="sensors"
        @drag-end="handleDragEnd">
        <div class="column-settings">
          <div
            aria-hidden="true"
            class="column-settings-header">
            <span class="column-heading-name">{{ t('name') }}</span>
            <span class="column-heading-category">{{ t('logicalStatus') }}</span>
          </div>
          <BoardColumnSetting
            v-for="(column, index) in state.columns"
            :id="column.key"
            :key="column.key"
            :can-update="viewModel.canUpdate"
            :category="column.category"
            :color="column.color"
            :disabled="submitting"
            :index="index"
            :name="column.name"
            :on-delete="() => removeColumn(column.key)"
            :on-update-category="(value) => (column.category = value)"
            :on-update-color="(value) => (column.color = value)"
            :on-update-name="(value) => (column.name = value)" />
        </div>
      </DragDropProvider>
    </section>
    <p
      v-if="error"
      class="form-error"
      role="alert">
      {{ error }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { defaultPreset, PointerActivationConstraints } from '@dnd-kit/dom'
import { arrayMove } from '@dnd-kit/helpers'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent } from '@dnd-kit/vue'
import { isSortable } from '@dnd-kit/vue/sortable'
import { IconPlus } from '@tabler/icons-vue'

import { DEFAULT_COLOR } from '~/constants/colors'
import type { BoardSettingsPageData } from '~/sections/boards/board-settings/BoardSettingsPage.deps'
import BoardColumnSetting from '~/sections/boards/board-settings/components/BoardColumnSetting/BoardColumnSetting.vue'

import type {
  BoardSettingsFormColumnDraft,
  BoardSettingsFormProps,
} from './BoardSettingsForm.types'

const props = defineProps<BoardSettingsFormProps>()

const { t } = useI18n({
  en: {
    addColumn: 'Add column',
    boardStatus: 'Board status',
    color: 'Color',
    columns: 'Columns',
    columnsHint: 'Column order and logical statuses.',
    done: 'Done',
    general: 'General',
    inProgress: 'In progress',
    logicalStatus: 'Logical status',
    name: 'Name',
    new: 'New',
    newColumn: 'New column',
  },
  ru: {
    addColumn: 'Добавить колонку',
    boardStatus: 'Статус доски',
    color: 'Цвет',
    columns: 'Колонки',
    columnsHint: 'Порядок и логические статусы колонок.',
    done: 'Готово',
    general: 'Основные настройки',
    inProgress: 'В работе',
    logicalStatus: 'Логический статус',
    name: 'Название',
    new: 'Новая',
    newColumn: 'Новая колонка',
  },
})

const idPrefix = useId()
const statusOptions = [
  { label: t('new'), value: 'New' },
  { label: t('inProgress'), value: 'Active' },
  { label: t('done'), value: 'Done' },
] satisfies Array<{
  label: string
  value: BoardSettingsPageData['status']
}>
const updateStatus = (value: string) => {
  const option = statusOptions.find((candidate) => candidate.value === value)
  if (option) {
    state.status = option.value
  }
}
const toDraftColumns = (columns: BoardSettingsPageData['columns']) =>
  columns.map((column) => ({
    ...column,
    key: `column-${column.id}`,
  }))

const state = reactive<{
  color: string
  columns: BoardSettingsFormColumnDraft[]
  name: string
  newColumnId: number
  status: BoardSettingsPageData['status']
}>({
  color: props.viewModel.color,
  columns: toDraftColumns(props.viewModel.columns),
  name: props.viewModel.name,
  newColumnId: 0,
  status: props.viewModel.status,
})
const sensors = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ tolerance: 5, value: 250 })]
        : [new PointerActivationConstraints.Distance({ value: 6 })],
    preventActivation: () => false,
  }),
  KeyboardSensor,
]

const addColumn = () => {
  state.newColumnId += 1
  state.columns.push({
    category: 'InProgress',
    color: DEFAULT_COLOR,
    id: null,
    key: `new-column-${state.newColumnId}`,
    name: t('newColumn'),
  })
}

const removeColumn = (key: string) => {
  state.columns = state.columns.filter((column) => column.key !== key)
}

const handleDragEnd = (event: DragEndEvent) => {
  const source = event.operation.source
  if (!event.canceled && isSortable(source)) {
    state.columns = arrayMove(state.columns, source.initialIndex, source.index)
  }
}

const submit = () => {
  if (!props.viewModel.canUpdate || props.submitting) {
    return
  }
  props.onUpdate({
    color: state.color,
    columns: state.columns.map(({ category, color, id, name }) => ({ category, color, id, name })),
    name: state.name,
    status: state.status,
  })
}

watch(
  () => props.viewModel,
  (value) => {
    state.name = value.name
    state.color = value.color
    state.columns = toDraftColumns(value.columns)
    state.status = value.status
  },
)
</script>

<style scoped>
.board-settings-form {
  --board-column-grid: var(--icon-btn-size) var(--icon-btn-size) minmax(0, 1fr) 200px
    var(--icon-btn-size);
  display: grid;
  gap: var(--space-6);
}

.settings-section {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.settings-section + .settings-section {
  border-top: 1px solid var(--color-divider);
  padding-top: var(--space-5);
}

.settings-section h2 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.settings-section-heading {
  align-items: center;
  display: flex;
  gap: var(--space-4);
  justify-content: space-between;
}

.settings-hint {
  color: var(--color-muted);
  line-height: 1.5;
  margin-top: var(--space-1);
}

.settings-fields {
  column-gap: var(--space-4);
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  row-gap: var(--space-3);
}

.settings-field {
  align-items: center;
  display: grid;
  gap: var(--space-4);
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  min-width: 0;
}

.column-settings {
  display: flex;
  flex-direction: column;
}

.column-settings-header {
  color: var(--color-muted);
  display: grid;
  gap: var(--space-2);
  grid-template-columns: var(--board-column-grid);
  padding-bottom: var(--space-2);
}

.column-heading-name {
  grid-column: 3;
  padding-left: var(--space-3);
}

.column-heading-category {
  grid-column: 4;
  padding-left: var(--space-3);
}

@media (max-width: 600px) {
  .settings-fields {
    column-gap: var(--space-2);
  }

  .settings-field {
    gap: var(--space-2);
  }

  .column-settings-header {
    display: none;
  }
  .settings-section-heading {
    align-items: flex-start;
    gap: var(--space-3);
  }
}
</style>
