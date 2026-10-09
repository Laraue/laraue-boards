<template>
  <BasePopover
    class="color-picker"
    :class="{ 'color-picker-compact': compact }">
    <template #trigger="{ open, toggle }">
      <BaseIconButton
        v-if="compact"
        v-bind="$attrs"
        :aria-expanded="open"
        aria-haspopup="listbox"
        :disabled="disabled"
        :label="label ?? colorName"
        @click="toggle">
        <span
          class="color-trigger-swatch"
          :style="{ background: model }" />
      </BaseIconButton>
      <BaseButton
        v-else
        v-bind="$attrs"
        :aria-expanded="open"
        aria-haspopup="listbox"
        class="color-trigger"
        :disabled="disabled"
        @click="toggle">
        <span
          class="color-trigger-swatch"
          :style="{ background: model }" />
        {{ colorName }}
      </BaseButton>
    </template>
    <template #default="{ close }">
      <div
        class="color-grid"
        role="listbox">
        <button
          v-for="color in COLOR_PALETTE"
          :key="color.value"
          :aria-label="t(color.key)"
          :aria-selected="color.value === model"
          class="color-swatch"
          :class="{ selected: color.value === model }"
          role="option"
          :style="{ background: color.value }"
          type="button"
          @click="select(color.value, close)" />
      </div>
    </template>
  </BasePopover>
</template>

<script setup lang="ts">
import { COLOR_PALETTE } from '~/constants/colors'

defineProps<{ compact?: boolean; disabled?: boolean; label?: string }>()
defineOptions({ inheritAttrs: false })
const model = defineModel<string>({ required: true })
const { t } = useI18n({
  en: {
    amber: 'Amber',
    blue: 'Blue',
    coral: 'Coral',
    cyan: 'Cyan',
    emerald: 'Emerald',
    gray: 'Gray',
    green: 'Green',
    indigo: 'Indigo',
    lime: 'Lime',
    orange: 'Orange',
    pink: 'Pink',
    purple: 'Purple',
    red: 'Red',
    rose: 'Rose',
    sky: 'Sky',
    teal: 'Teal',
  },
  ru: {
    amber: 'Янтарный',
    blue: 'Синий',
    coral: 'Коралловый',
    cyan: 'Циановый',
    emerald: 'Изумрудный',
    gray: 'Серый',
    green: 'Зелёный',
    indigo: 'Индиго',
    lime: 'Лаймовый',
    orange: 'Оранжевый',
    pink: 'Розовый',
    purple: 'Фиолетовый',
    red: 'Красный',
    rose: 'Малиновый',
    sky: 'Небесно-синий',
    teal: 'Бирюзовый',
  },
})
const colorName = computed(() => {
  const color = COLOR_PALETTE.find((item) => item.value === model.value)
  return color ? t(color.key) : model.value
})
const select = (value: string, close: () => void) => {
  model.value = value
  close()
}
</script>

<style scoped>
.color-picker {
  width: 100%;
}

.color-picker-compact {
  width: fit-content;
}

.color-trigger {
  justify-content: flex-start;
  width: 100%;
}

.color-trigger-swatch {
  border: 1px solid #0002;
  border-radius: var(--radius-pill);
  flex: none;
  height: var(--icon-size);
  width: var(--icon-size);
}

.color-grid {
  display: grid;
  gap: var(--space-2);
  grid-template-columns: repeat(5, 1fr);
  padding: var(--space-3);
}

.color-swatch {
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  height: 24px;
  padding: 0;
  width: 24px;
}

.color-swatch:hover {
  border-color: var(--color-muted);
}

.color-swatch.selected {
  border-color: var(--color-text);
}
</style>
