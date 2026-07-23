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
      Loading organizations…
    </option>
    <option
      v-else-if="loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      No organizations available
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
    Could not load organizations.
  </p>
</template>

<script setup lang="ts">
import type { OrganizationSelectDeps } from './OrganizationSelect.deps'
import type { OrganizationSelectOption } from './OrganizationSelect.types'

const props = withDefaults(
  defineProps<{
    deps: OrganizationSelectDeps
    disabled?: boolean
    initialOption?: OrganizationSelectOption
    placeholder?: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    placeholder: 'Select organization',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { data, execute, message, pending, status } = await useQuery(
  'organization-select',
  (_nuxtApp, { signal }) => props.deps.loadOrganizations({ signal }),
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
  if (data.value === undefined && !pending.value) {
    void execute()
  }
}
</script>
