<template>
  <BaseSelect
    v-bind="$attrs"
    v-model="model"
    :disabled="disabled"
    :loading="pending"
    :message="status"
    :on-open="load"
    :options="visibleOptions"
    :placeholder="placeholder ?? t('select')" />
</template>

<script setup lang="ts">
import type { OrganizationSelectDeps, OrganizationSelectOption } from './OrganizationSelect.deps'

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
  },
)

const { t } = useI18n({
  en: {
    empty: 'No organizations available',
    loadError: 'Could not load organizations.',
    loading: 'Loading organizations…',
    select: 'Select organization',
  },
  ru: {
    empty: 'Организации недоступны',
    loadError: 'Не удалось загрузить организации.',
    loading: 'Загрузка организаций…',
    select: 'Выберите организацию',
  },
})

defineOptions({ inheritAttrs: false })

const model = defineModel<string>({ required: true })

const { data, execute, message, pending, status: loadStatus } = await useApiQuery(
  `organization-select:${useId()}`,
  (signal) => props.deps.loadOrganizations({ signal }),
  { immediate: false },
)

// Shown in the list instead of the options while they load, fail or are none.
const status = computed(() => {
  if (message.value) {
    return t('loadError')
  }
  if (pending.value) {
    return t('loading')
  }
  return loadStatus.value !== 'idle' && visibleOptions.value.length === 0 ? t('empty') : undefined
})

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
