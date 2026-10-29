<!-- A text field that suggests options as the user types. The consumer loads the options for the
     typed text (`v-model:search`), so the list shows them as they are, unfiltered; picking one sets
     `v-model` to its value and the text to its label. Looks like the framed BaseSelect. -->
<template>
  <ComboboxRoot
    v-model="selected"
    v-model:open="open"
    class="base-combobox-root"
    :disabled="disabled"
    ignore-filter
    :reset-search-term-on-blur="false"
    :reset-search-term-on-select="false">
    <ComboboxAnchor class="base-combobox">
      <ComboboxInput
        ref="input"
        v-bind="$attrs"
        v-model="search"
        autocomplete="off"
        class="base-combobox-input"
        :placeholder="placeholder" />
    </ComboboxAnchor>
    <!-- Not portaled: a popup outside an open <dialog> would be under it and inert. -->
    <ComboboxContent
      class="base-select-content base-combobox-content"
      :collision-padding="12"
      position="popper"
      :side-offset="4">
      <ComboboxViewport class="base-select-viewport">
        <p
          v-if="message"
          class="base-select-message">
          {{ message }}
        </p>
        <ComboboxItem
          v-for="option in loading ? [] : options"
          :key="option.value"
          class="base-select-item base-combobox-item"
          :text-value="option.label"
          :value="option.value">
          <span class="base-combobox-label">{{ option.label }}</span>
          <span
            v-if="option.description"
            class="base-combobox-description">
            {{ option.description }}
          </span>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxContent>
  </ComboboxRoot>
</template>

<script lang="ts">
export type BaseComboboxOption = { description?: string; label: string; value: string }
</script>

<script setup lang="ts">
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
  ComboboxViewport,
} from 'reka-ui'
import { computed, ref, useTemplateRef, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    // Shown above the options instead of them: loading, nothing found, a load error.
    message?: string
    options: BaseComboboxOption[]
    placeholder?: string
  }>(),
  {
    disabled: false,
    loading: false,
    message: undefined,
    placeholder: '',
  },
)

defineOptions({ inheritAttrs: false })

// The picked option's value; '' while nothing is picked.
const model = defineModel<string>({ required: true })
const search = defineModel<string>('search', { required: true })

const open = ref(false)
const input = useTemplateRef<{ $el: HTMLInputElement }>('input')

const selected = computed({
  get: () => model.value,
  set: (value: string) => {
    model.value = value
    const option = props.options.find((item) => item.value === value)
    if (option) {
      search.value = option.label
    }
  },
})

// Typing changes what is picked: the text no longer names the picked option.
watch(search, (text) => {
  const picked = props.options.find((item) => item.value === model.value)
  if (model.value && text !== picked?.label) {
    model.value = ''
  }
  open.value = text.trim() !== '' && text !== picked?.label
})

defineExpose({ focus: () => input.value?.$el.focus() })
</script>

<style scoped>
.base-combobox-root {
  display: grid;
  min-width: 0;
}

.base-combobox {
  display: grid;
  min-width: 0;
}

.base-combobox-input {
  width: 100%;
}
</style>

<style>
/* Unscoped: the content is rendered by Reka, outside this component's root. The surface is the
   select list's (base-select-content); only the sizes come from the combobox. */
.base-combobox-content {
  max-height: var(--reka-combobox-content-available-height);
  min-width: var(--reka-combobox-trigger-width);
}

.base-combobox-item {
  align-items: baseline;
}

.base-combobox-label {
  flex: none;
}

.base-combobox-description {
  color: var(--color-muted);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
