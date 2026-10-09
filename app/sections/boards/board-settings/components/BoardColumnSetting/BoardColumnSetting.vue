<template>
  <div
    ref="element"
    class="setting-row"
    :class="{ 'setting-row--dragging': isDragging }">
    <div
      v-if="canUpdate"
      ref="handle"
      class="column-drag">
      <BaseIconButton
        :disabled="disabled"
        :label="t('reorder')"
        style="cursor: grab; touch-action: none">
        <IconGripVertical />
      </BaseIconButton>
    </div>
    <span
      v-else
      aria-hidden="true" />
    <div class="column-color">
      <AppColorPicker
        compact
        :disabled="!canUpdate || disabled"
        :label="t('color')"
        :model-value="color"
        @update:model-value="props.onUpdateColor" />
    </div>
    <BaseInput
      :aria-label="t('name')"
      class="column-name"
      :disabled="!canUpdate || disabled"
      :model-value="name"
      required
      variant="inline"
      @update:model-value="props.onUpdateName" />
    <div class="column-category">
      <StatusCategorySelect
        :color="color"
        :disabled="!canUpdate || disabled"
        full-width
        :model-value="category"
        variant="inline"
        @update:model-value="props.onUpdateCategory" />
    </div>
    <div
      v-if="canUpdate"
      class="column-delete">
      <BaseIconButton
        :disabled="disabled"
        :label="t('delete')"
        variant="danger"
        @click="props.onDelete">
        <IconTrash />
      </BaseIconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@dnd-kit/vue/sortable'
import { IconGripVertical, IconTrash } from '@tabler/icons-vue'

import type { StatusCategory } from '~/components/status-category-select/StatusCategorySelect.types'
import StatusCategorySelect from '~/components/status-category-select/StatusCategorySelect.vue'

const props = defineProps<{
  canUpdate: boolean
  category: StatusCategory
  color: string
  disabled: boolean
  id: string
  index: number
  name: string
  onDelete: () => void
  onUpdateCategory: (category: StatusCategory) => void
  onUpdateColor: (color: string) => void
  onUpdateName: (name: string) => void
}>()

const { t } = useI18n({
  en: {
    color: 'Column color',
    delete: 'Delete column',
    name: 'Column name',
    reorder: 'Reorder column',
  },
  ru: {
    color: 'Цвет колонки',
    delete: 'Удалить колонку',
    name: 'Название колонки',
    reorder: 'Изменить порядок колонок',
  },
})

const element = useTemplateRef('element')
const handleRoot = useTemplateRef('handle')
const handle = computed(() => handleRoot.value?.querySelector<HTMLButtonElement>('button') ?? null)
const { isDragging } = useSortable({
  disabled: computed(() => !props.canUpdate || props.disabled),
  element,
  handle,
  id: computed(() => props.id),
  index: computed(() => props.index),
})
</script>

<style scoped>
.setting-row {
  align-items: center;
  border-bottom: 1px solid var(--color-divider);
  display: grid;
  gap: var(--space-2);
  grid-template-columns: var(--board-column-grid);
  min-width: 0;
  padding: var(--space-2) 0;
}

.setting-row--dragging {
  opacity: 0.45;
}

.column-color,
.column-category {
  min-width: 0;
}

@media (max-width: 600px) {
  .setting-row {
    border-bottom: 1px solid var(--color-divider);
    grid-template-columns: var(--icon-btn-size) var(--icon-btn-size) minmax(0, 1fr) var(
        --icon-btn-size
      );
    padding-bottom: var(--space-3);
  }

  .column-drag {
    grid-column: 1;
    grid-row: 1;
  }

  .column-name {
    grid-column: 3;
    grid-row: 1;
  }

  .column-delete {
    grid-column: 4;
    grid-row: 1;
  }

  .column-color {
    grid-column: 2;
    grid-row: 1;
  }

  .column-category {
    grid-column: 3 / 5;
    grid-row: 2;
  }
}
</style>
