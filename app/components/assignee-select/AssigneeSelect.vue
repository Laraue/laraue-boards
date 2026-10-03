<template>
  <BaseSelect
    v-bind="$attrs"
    v-model="model"
    :disabled="disabled || !spaceKey"
    :loading="pending"
    :message="
      message
        ? t('loadError')
        : pending
          ? t('loading')
          : loaded && visibleOptions.length === 0
            ? t('empty')
            : undefined
    "
    :on-open="load"
    :options="visibleOptions"
    :placeholder="placeholder ?? t('select')">
    <template #icon="{ option }">
      <span
        class="avatar"
        :style="{ background: option?.color ?? 'var(--color-muted)' }">
        {{ option?.initials ?? '?' }}
      </span>
    </template>
  </BaseSelect>
</template>

<script setup lang="ts">
import type { AssigneeSelectDeps, AssigneeSelectOption } from './AssigneeSelect.deps'

const props = withDefaults(
  defineProps<{
    deps: AssigneeSelectDeps
    disabled?: boolean
    eager?: boolean
    initialOption?: AssigneeSelectOption
    placeholder?: string
    selectCurrentUser?: boolean
    spaceKey: string
  }>(),
  {
    disabled: false,
    eager: false,
    initialOption: undefined,
    selectCurrentUser: false,
  },
)

const { t } = useI18n({
  en: {
    empty: 'No assignees available',
    loadError: 'Could not load assignees.',
    loading: 'Loading assignees…',
    select: 'Select assignee',
  },
  ru: {
    empty: 'Исполнители недоступны',
    loadError: 'Не удалось загрузить исполнителей.',
    loading: 'Загрузка исполнителей…',
    select: 'Выберите исполнителя',
  },
})

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { clear, data, execute, message, pending, status } = await useApiQuery(
  `assignee-select:${useId()}`,
  (signal) => props.deps.loadAssignees({ signal, spaceKey: props.spaceKey }),
  { immediate: props.eager && Boolean(props.spaceKey) },
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
  if (props.spaceKey && data.value === undefined && !pending.value) {
    void execute()
  }
}

watch(
  data,
  (loadedOptions) => {
    if (props.selectCurrentUser && !model.value) {
      model.value = loadedOptions?.find((option) => option.isCurrentUser)?.value ?? ''
    }
  },
  { immediate: true },
)

watch(
  () => props.spaceKey,
  () => {
    clear()
    model.value = ''
    if (props.eager && props.spaceKey) {
      void execute()
    }
  },
)
</script>

<style scoped>
.avatar {
  font-size: var(--font-size-caption);
  height: 20px;
  width: 20px;
}
</style>
