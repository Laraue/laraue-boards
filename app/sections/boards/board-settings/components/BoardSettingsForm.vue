<template>
  <form @submit.prevent="submit">
    <label for="board-settings-name">Name</label>
    <input
      id="board-settings-name"
      v-model="state.name"
      :disabled="!viewModel.canUpdate"
      required />
    <label>Color</label>
    <AppColorPicker
      v-model="state.color"
      :disabled="!viewModel.canUpdate" />
    <label for="board-settings-status">Board status</label>
    <select
      id="board-settings-status"
      v-model="state.status"
      :disabled="!viewModel.canUpdate">
      <option
        v-for="option in statusOptions"
        :key="option.value"
        :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <label>Columns</label>
    <DragDropProvider
      :plugins="defaultPreset.plugins"
      :sensors="sensors"
      @drag-end="handleDragEnd">
      <div class="column-settings">
        <BoardColumnSetting
          v-for="(column, index) in state.columns"
          :id="column.key"
          :key="column.key"
          :can-update="viewModel.canUpdate"
          :color="column.color"
          :disabled="submitting"
          :index="index"
          :name="column.name"
          :on-delete="() => removeColumn(column.key)"
          :on-update-color="(value) => (column.color = value)"
          :on-update-name="(value) => (column.name = value)" />
      </div>
    </DragDropProvider>
    <button
      v-if="viewModel.canUpdate"
      class="secondary add-column"
      :disabled="submitting"
      type="button"
      @click="addColumn">
      <Plus />
      Add column
    </button>
    <p
      v-if="error"
      class="form-error">
      {{ error }}
    </p>
    <div class="form-actions">
      <button
        v-if="viewModel.canUpdate"
        class="primary"
        :disabled="submitting"
        type="submit">
        {{ submitting ? 'Saving…' : 'Save changes' }}
      </button>
      <button
        v-if="viewModel.canDelete"
        class="secondary danger"
        :disabled="submitting"
        type="button"
        @click="props.onDelete">
        Delete board
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { defaultPreset, PointerActivationConstraints } from '@dnd-kit/dom'
import { arrayMove } from '@dnd-kit/helpers'
import { DragDropProvider, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import type { DragEndEvent } from '@dnd-kit/vue'
import { isSortable } from '@dnd-kit/vue/sortable'
import { Plus } from '@lucide/vue'

import { DEFAULT_COLOR } from '~/constants/colors'
import type { BoardSettingsPageData } from '~/sections/boards/board-settings/BoardSettingsPage.types'
import BoardColumnSetting from '~/sections/boards/board-settings/components/BoardColumnSetting/BoardColumnSetting.vue'

import type {
  BoardSettingsFormColumnDraft,
  BoardSettingsFormProps,
} from './BoardSettingsForm.types'

const props = defineProps<BoardSettingsFormProps>()
const statusOptions = [
  { label: 'New', value: 'New' },
  { label: 'In progress', value: 'Active' },
  { label: 'Done', value: 'Done' },
] as const satisfies ReadonlyArray<{
  label: string
  value: BoardSettingsPageData['status']
}>
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
    color: DEFAULT_COLOR,
    id: null,
    key: `new-column-${state.newColumnId}`,
    name: 'New column',
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
  props.onUpdate({
    color: state.color,
    columns: state.columns.map(({ color, id, name }) => ({ color, id, name })),
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
.column-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.add-column {
  margin-top: var(--space-2);
}
</style>
