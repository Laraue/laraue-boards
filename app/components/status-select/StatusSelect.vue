<template>
  <BaseSelect
    v-bind="$attrs"
    v-model="model"
    :disabled="disabled || !boardId"
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
    :placeholder="placeholder ?? t('select')" />
</template>

<script setup lang="ts">
import type { StatusSelectDeps, StatusSelectOption } from './StatusSelect.deps'

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
    selectFirst: false,
  },
)

const { t } = useI18n({
  en: {
    empty: 'No statuses available',
    loadError: 'Could not load statuses.',
    loading: 'Loading statuses…',
    select: 'Select status',
  },
  ru: {
    empty: 'Статусы недоступны',
    loadError: 'Не удалось загрузить статусы.',
    loading: 'Загрузка статусов…',
    select: 'Выберите статус',
  },
})

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { clear, data, execute, message, pending, status } = await useApiQuery(
  `status-select:${useId()}`,
  (signal) => props.deps.loadStatuses({ boardId: props.boardId, signal }),
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
