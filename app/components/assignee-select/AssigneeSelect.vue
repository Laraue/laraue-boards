<template>
  <div class="assignee-select">
    <span
      class="avatar"
      :style="{ background: selectedOption.color }">
      {{ selectedOption.initials }}
    </span>
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
        Loading assignees…
      </option>
      <option
        v-else-if="loaded && visibleOptions.length === 0"
        disabled
        value="__empty">
        No assignees available
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
      Could not load assignees.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { AssigneeSelectDeps } from './AssigneeSelect.deps'
import type { AssigneeSelectOption } from './AssigneeSelect.types'

const props = withDefaults(
  defineProps<{
    deps: AssigneeSelectDeps
    disabled?: boolean
    initialOption?: AssigneeSelectOption
    placeholder?: string
    spaceKey: string
  }>(),
  {
    disabled: false,
    initialOption: undefined,
    placeholder: 'Select assignee',
  },
)

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { data, execute, message, pending, status } = await useQuery(
  () => `assignee-select:${props.spaceKey}`,
  (_nuxtApp, { signal }) => props.deps.loadAssignees({ signal, spaceKey: props.spaceKey }),
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

const selectedOption = computed(
  () =>
    visibleOptions.value.find((option) => option.value === model.value) ?? {
      color: 'var(--color-muted)',
      initials: '?',
    },
)

const load = () => {
  if (props.spaceKey && data.value === undefined && !pending.value) {
    void execute()
  }
}

watch(
  () => props.spaceKey,
  () => {
    model.value = ''
  },
)
</script>

<style scoped>
.assignee-select {
  align-items: center;
  display: grid;
  gap: var(--space-2);
  grid-template-columns: auto minmax(0, 1fr);
  min-height: var(--control-height);
}

.avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  width: 28px;
}

.form-error {
  grid-column: 1 / -1;
}
</style>
