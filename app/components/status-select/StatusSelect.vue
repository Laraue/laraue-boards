<template>
  <select
    v-bind="$attrs"
    v-model="model"
    :aria-busy="pending"
    :disabled="disabled || !boardId"
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
      Loading statuses…
    </option>
    <option
      v-else-if="loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No statuses available
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
    Could not load statuses.
  </p>
</template>

<script setup lang="ts">
import type { StatusSelectDeps } from './StatusSelect.deps'
import type { StatusSelectOption } from './StatusSelect.types'

const props = withDefaults(
  defineProps<{
    boardId: string
    deps: StatusSelectDeps
    disabled?: boolean
    initialOption?: StatusSelectOption
    placeholder?: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    placeholder: 'Select status',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { clear, data, execute, message, pending, status } = await useQuery(
  `status-select:${useId()}`,
  (_nuxtApp, { signal }) => props.deps.loadStatuses({ boardId: props.boardId, signal }),
  { immediate: false },
)

const loaded = computed(() => status.value !== 'idle' && !pending.value)

const options = computed(() => data.value ?? [])

const visibleOptions = computed(() => {
  const initial = props.initialOption
  return initial &&
    initial.value === model.value &&
    !options.value.some((option) => option.value === initial.value)
    ? [initial, ...options.value]
    : options.value
})

const load = () => {
  if (props.boardId && data.value === undefined && !pending.value) {
    void execute()
  }
}

watch(
  () => props.boardId,
  () => {
    clear()
    model.value = ''
  },
)
</script>
