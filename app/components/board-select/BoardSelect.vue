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
      <component
        :is="option?.isBacklog ? IconListDetails : BoardIcon"
        class="select-icon"
        :style="{ color: option?.isBacklog ? undefined : option?.color }" />
    </template>
  </BaseSelect>
</template>

<script setup lang="ts">
import { IconListDetails } from '@tabler/icons-vue'

import { BoardIcon } from '~/constants/icons'

import type { BoardSelectDeps, BoardSelectOption } from './BoardSelect.deps'

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
  },
)

const { t } = useI18n({
  en: {
    empty: 'No boards available',
    loadError: 'Could not load boards.',
    loading: 'Loading boards…',
    select: 'Select board',
  },
  ru: {
    empty: 'Доски недоступны',
    loadError: 'Не удалось загрузить доски.',
    loading: 'Загрузка досок…',
    select: 'Выберите доску',
  },
})

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { clear, data, execute, message, pending, status } = await useApiQuery(
  `board-select:${useId()}`,
  (signal) => props.deps.loadBoards({ signal, spaceKey: props.spaceKey }),
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

<style scoped>
.select-icon {
  color: var(--color-muted);
}
</style>
