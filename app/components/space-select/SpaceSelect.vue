<template>
  <select
    v-bind="$attrs"
    v-model="model"
    :aria-busy="pending"
    :disabled="disabled"
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
      Loading spaces…
    </option>
    <option
      v-else-if="loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No spaces available
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
    Could not load spaces.
  </p>
</template>

<script setup lang="ts">
import type { SpaceSelectDeps } from './SpaceSelect.deps'
import type { SpaceSelectOption } from './SpaceSelect.types'

const props = withDefaults(
  defineProps<{
    deps: SpaceSelectDeps
    disabled?: boolean
    initialOption?: SpaceSelectOption
    organizationId?: string
    placeholder?: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    organizationId: undefined,
    placeholder: 'Select space',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { data, execute, message, pending, status } = await useQuery(
  () => `space-select:${props.organizationId ?? ''}`,
  (_nuxtApp, { signal }) => props.deps.loadSpaces({ organizationId: props.organizationId, signal }),
  { cached: true, immediate: false },
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
  if (data.value === undefined && !pending.value) {
    void execute()
  }
}

watch(
  () => props.organizationId,
  () => {
    model.value = ''
  },
)
</script>
