<template>
  <select
    v-bind="$attrs"
    v-model="model"
    :aria-busy="pending"
    :disabled="disabled || !boardId"
    @focus="load">
    <option
      v-if="!message"
      disabled
      value="">
      {{ placeholder }}
    </option>
    <option
      v-if="message"
      disabled
      value="">
      Could not load statuses.
    </option>
    <option
      v-else-if="pending"
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
</template>

<script setup lang="ts">
import type { StatusSelectDeps } from './StatusSelect.deps'
import type { StatusSelectOption } from './StatusSelect.types'

const props = withDefaults(
  defineProps<{
    boardId: string
    deps: StatusSelectDeps
    disabled?: boolean
    eager?: boolean
    initialOption?: StatusSelectOption
    placeholder?: string
    selectFirst?: boolean
  }>(),
  {
    disabled: false,
    eager: false,
    initialOption: undefined,
    placeholder: 'Select status',
    selectFirst: false,
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { clear, data, execute, message, pending, status } = await useQuery(
  `status-select:${useId()}`,
  (_nuxtApp, { signal }) => props.deps.loadStatuses({ boardId: props.boardId, signal }),
  { immediate: props.eager && Boolean(props.boardId) },
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
  data,
  (loadedOptions) => {
    if (
      props.selectFirst &&
      loadedOptions &&
      !loadedOptions.some((option) => option.value === model.value)
    ) {
      model.value = loadedOptions[0]?.value ?? ''
    }
  },
  { immediate: true },
)

watch(
  () => props.boardId,
  () => {
    clear()
    model.value = ''
    if (props.eager && props.boardId) {
      void execute()
    }
  },
)
</script>
