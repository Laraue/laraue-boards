<template>
  <select
    v-bind="$attrs"
    v-model="model"
    :aria-busy="pending"
    :disabled="disabled || !spaceKey"
    @focus="load">
    <option
      disabled
      value="">
      {{ placeholder }}
    </option>
    <option
      v-if="pending"
      disabled
      value="__loading">
      Loading boards…
    </option>
    <option
      v-else-if="loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No boards available
    </option>
    <option
      v-for="option in visibleOptions"
      :key="option.value"
      :value="option.value">
      {{ option.label }}
    </option>
  </select>
  <p
    v-if="message"
    class="form-error">
    Could not load boards.
  </p>
</template>

<script setup lang="ts">
import type { BoardSelectDeps } from './BoardSelect.deps'
import type { BoardSelectOption } from './BoardSelect.types'

const props = withDefaults(
  defineProps<{
    deps: BoardSelectDeps
    disabled?: boolean
    excludedValue?: string
    initialOption?: BoardSelectOption
    placeholder?: string
    spaceKey: string
  }>(),
  {
    disabled: false,
    excludedValue: undefined,
    initialOption: undefined,
    placeholder: 'Select board',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { clear, data, execute, message, pending, status } = await useQuery(
  `board-select:${useId()}`,
  (_nuxtApp, { signal }) => props.deps.loadBoards({ signal, spaceKey: props.spaceKey }),
  { immediate: false },
)

const loaded = computed(() => status.value !== 'idle' && !pending.value)

const visibleOptions = computed(() => {
  const initial = props.initialOption
  const options = props.excludedValue
    ? (data.value ?? []).filter((option) => option.value !== props.excludedValue)
    : (data.value ?? [])
  return initial &&
    initial.value === model.value &&
    initial.value !== props.excludedValue &&
    !options.some((option) => option.value === initial.value)
    ? [initial, ...options]
    : options
})

const load = () => {
  if (props.spaceKey && data.value === undefined && !pending.value) {
    void execute()
  }
}

watch(
  () => props.spaceKey,
  () => {
    clear()
    model.value = ''
  },
)
</script>
