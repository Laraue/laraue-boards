<template>
  <BaseSelect
    v-bind="$attrs"
    v-model="model"
    :disabled="disabled"
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
      <SpaceIcon
        class="select-icon"
        :style="{ color: option?.color }" />
    </template>
  </BaseSelect>
</template>

<script setup lang="ts">
import { SpaceIcon } from '~/constants/icons'

import type { SpaceSelectDeps, SpaceSelectOption } from './SpaceSelect.deps'

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
  },
)

const { t } = useI18n({
  en: {
    empty: 'No spaces available',
    loadError: 'Could not load spaces.',
    loading: 'Loading spaces…',
    select: 'Select space',
  },
  ru: {
    empty: 'Разделы недоступны',
    loadError: 'Не удалось загрузить разделы.',
    loading: 'Загрузка разделов…',
    select: 'Выберите раздел',
  },
})

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { clear, data, execute, message, pending, status } = await useApiQuery(
  `space-select:${useId()}`,
  (signal) => props.deps.loadSpaces({ organizationId: props.organizationId, signal }),
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

watch(
  () => props.organizationId,
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
