<template>
  <!-- One root: closed, Reka still renders a holder for the options next to the trigger. -->
  <div
    class="base-select-root"
    :class="{ 'base-select-root-inline': variant === 'inline' }">
    <SelectRoot
      v-model="selected"
      :disabled="disabled"
      @update:open="$event && onOpen?.()">
      <SelectTrigger
        v-bind="$attrs"
        :aria-busy="loading || undefined"
        class="base-select"
        :class="{
          'base-select-inline': variant === 'inline',
          'base-select-icon-only-mobile': iconOnlyOnMobile,
          placeholder: !selectedOption,
        }">
        <slot
          name="icon"
          :option="selectedOption" />
        <span class="base-select-value">{{ selectedOption?.label ?? placeholder }}</span>
        <IconChevronDown
          v-if="showChevron"
          class="base-select-chevron" />
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
            v-for="option in loading ? [] : options"
            :key="option.value"
            class="base-select-item"
            :disabled="option.disabled"
            :value="toItemValue(option.value)">
            <slot
              name="icon"
              :option="option" />
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

<script lang="ts">
export type BaseSelectOption = { disabled?: boolean; label: string; value: string }
export type BaseSelectVariant = 'default' | 'inline'
</script>

<script setup lang="ts" generic="T extends BaseSelectOption">
import { IconCheck, IconChevronDown } from '@tabler/icons-vue'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from 'reka-ui'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    iconOnlyOnMobile?: boolean
    loading?: boolean
    // Shown above the options instead of them: loading, nothing to pick, a load error.
    message?: string
    onOpen?: () => void
    options: T[]
    placeholder?: string
    showChevron?: boolean
    variant?: BaseSelectVariant
  }>(),
  {
    disabled: false,
    iconOnlyOnMobile: false,
    loading: false,
    message: undefined,
    onOpen: undefined,
    placeholder: '',
    showChevron: true,
    variant: 'default',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

defineSlots<{
  // The option's icon, avatar or color, in the field and in the list; no option is the placeholder.
  icon?: (props: { option: T | undefined }) => unknown
}>()

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
  height: 12px;
  margin-left: auto;
  width: 12px;
}

/* Hover strengthens the border, like a text field's. */
@media (hover: hover) and (pointer: fine) {
  .base-select:hover:not(:disabled, [data-state='open'], :focus-visible) {
    border-color: var(--color-border-hover);
  }
}

.base-select-root-inline {
  justify-items: start;
}

.base-select-inline {
  background: transparent;
  border-color: transparent;
  height: var(--control-height-small);
  width: fit-content;
}

.base-select-inline:is(:focus-visible, [data-state='open']) {
  border-color: var(--color-focus);
}

@media (max-width: 600px) {
  .base-select-icon-only-mobile {
    justify-content: center;
    padding: 0;
    width: var(--control-height-small);
  }

  .base-select-icon-only-mobile .base-select-value {
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    width: 1px;
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
  font-size: var(--font-size-body);
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

.base-select-check .tabler-icon {
  height: 14px;
  width: 14px;
}

.base-select-message {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  min-height: var(--control-height-small);
  padding: var(--space-1) var(--space-2);
}
</style>
