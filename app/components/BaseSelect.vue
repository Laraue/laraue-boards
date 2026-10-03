<template>
  <!-- One root: closed, Reka still renders a holder for the options next to the trigger. -->
  <div class="base-select-root">
    <SelectRoot
      v-model="selected"
      :disabled="disabled"
      @update:open="$event && onOpen?.()">
      <SelectTrigger
        v-bind="$attrs"
        :aria-busy="loading || undefined"
        class="base-select"
        :class="{ placeholder: !selectedOption }">
        <slot name="prefix" />
        <span class="base-select-value">{{ selectedOption?.label ?? placeholder }}</span>
        <IconSelector class="base-select-chevron" />
      </SelectTrigger>
      <!-- Not portaled: a popup outside an open <dialog> would be under it and inert. -->
      <SelectContent
        class="base-select-content"
        :collision-padding="12"
        position="popper"
        :side-offset="4">
        <SelectViewport class="base-select-viewport">
          <p
            v-if="message"
            class="base-select-message">
            {{ message }}
          </p>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            class="base-select-item"
            :disabled="option.disabled"
            :value="toItemValue(option.value)">
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="base-select-check">
              <IconCheck />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectRoot>
  </div>
</template>

<script setup lang="ts">
import { IconCheck, IconSelector } from '@tabler/icons-vue'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from 'reka-ui'

export type BaseSelectOption = { disabled?: boolean; label: string; value: string }

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    // Shown above the options instead of them: loading, nothing to pick, a load error.
    message?: string
    onOpen?: () => void
    options: BaseSelectOption[]
    placeholder?: string
  }>(),
  {
    disabled: false,
    loading: false,
    message: undefined,
    onOpen: undefined,
    placeholder: '',
  },
)

const model = defineModel<string>({ required: true })

// Reka reserves '' for "nothing selected", so an option for '' (like "None") gets another value.
const emptyValue = '\u0000'
const toItemValue = (value: string) => (value === '' ? emptyValue : value)

const selectedOption = computed(() => props.options.find((option) => option.value === model.value))

const selected = computed({
  get: () => (selectedOption.value ? toItemValue(model.value) : ''),
  set: (value: string) => (model.value = value === emptyValue ? '' : value),
})
</script>

<style scoped>
.base-select-root {
  display: grid;
  min-width: 0;
}

.base-select {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  font-size: var(--font-size-body);
  gap: var(--space-2);
  height: var(--control-height);
  max-width: 100%;
  min-width: 0;
  padding: 0 var(--space-3);
  text-align: left;
  transition: border-color var(--duration-fast) var(--ease-standard);
  width: 100%;
}

.base-select.placeholder {
  color: var(--color-muted);
}

.base-select:focus-visible,
.base-select[data-state='open'] {
  border-color: var(--color-focus);
  box-shadow: none;
}

.base-select-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.base-select-chevron {
  color: var(--color-muted);
  height: 14px;
  margin-left: auto;
  width: 14px;
}

/* Hover strengthens the border, like a text field's. */
@media (hover: hover) and (pointer: fine) {
  .base-select:hover:not(:disabled, [data-state='open'], :focus-visible) {
    border-color: color-mix(in srgb, var(--color-border) 55%, var(--color-muted));
  }
}
</style>

<style>
/* Unscoped: the content is rendered by Reka, outside this component's root. */
.base-select-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  max-height: var(--reka-select-content-available-height);
  max-width: calc(100vw - var(--space-6));
  min-width: var(--reka-select-trigger-width);
  overflow: hidden;
  z-index: 50;
}

.base-select-viewport {
  padding: var(--space-1);
}

.base-select-item {
  align-items: center;
  border-radius: var(--radius-control);
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height-small);
  outline: none;
  overflow-wrap: anywhere;
  padding: var(--space-1) var(--space-2);
  user-select: none;
}

.base-select-item[data-highlighted] {
  background: var(--color-hover);
}

.base-select-item[data-state='checked'] {
  color: var(--color-accent);
}

.base-select-item[data-disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-select-check {
  display: flex;
  margin-left: auto;
}

.base-select-message {
  color: var(--color-muted);
  padding: var(--space-1) var(--space-2);
}
</style>
