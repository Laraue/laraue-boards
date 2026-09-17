<template>
  <select
    v-bind="$attrs"
    v-model="model"
    :aria-busy="pending"
    :disabled="disabled"
    @focus="load">
    <option
      v-if="!message"
      disabled
      value="">
      {{ placeholder ?? t('select') }}
    </option>
    <option
      v-if="message"
      disabled
      value="">
      {{ t('loadError') }}
    </option>
    <option
      v-else-if="pending"
      disabled
      value="__loading">
      {{ t('loading') }}
    </option>
    <option
      v-else-if="loaded && visibleOptions.length === 0"
      disabled
      value="__empty">
      {{ t('empty') }}
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

const { data, execute, message, pending, status } = await useQuery(
  `organization-select:${useId()}`,
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
