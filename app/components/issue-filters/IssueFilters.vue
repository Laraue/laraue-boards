<template>
  <FilterMenu
    v-if="attributes.length || spaces.length || epicStatuses.length"
    :active-count="activeCount"
    :items="filterItems"
    :label="t('issueFilters')"
    :loading="loading"
    :on-clear="clear">
    <template #panel="{ id, item }">
      <fieldset
        v-if="item.id === EPIC_STATUS_FILTER"
        :aria-label="t('boardStatus')"
        class="filter-options">
        <BaseCheckbox
          v-for="option in epicStatuses"
          :key="option.value"
          :model-value="selectedEpicStatuses.includes(option.value)"
          @update:model-value="toggleEpicStatus(option.value)">
          {{ option.label }}
        </BaseCheckbox>
      </fieldset>
      <fieldset
        v-else-if="item.id === SPACE_FILTER"
        :aria-label="t('spaces')"
        class="filter-options">
        <BaseCheckbox
          v-for="option in spaces"
          :key="option.value"
          :model-value="selectedSpaces.includes(option.value)"
          @update:model-value="toggleSpace(option.value)">
          {{ option.label }}
        </BaseCheckbox>
      </fieldset>
      <template v-else-if="item.attribute">
        <IssueTextFilter
          v-if="item.attribute.type === 'text'"
          :id="id"
          :model-value="String(modelValue.attributes[item.id] ?? '')"
          @update:model-value="updateValue(item.id, $event)" />
        <IssueListFilter
          v-else-if="item.attribute.type === 'list'"
          :model-value="arrayValue(item.id)"
          :options="item.attribute.options"
          @update:model-value="updateValue(item.id, $event)" />
        <IssueIntegerFilter
          v-else-if="item.attribute.type === 'integer'"
          :id="id"
          :model-value="arrayValue(item.id)"
          @update:model-value="updateValue(item.id, $event)" />
        <IssueDecimalFilter
          v-else-if="item.attribute.type === 'decimal'"
          :id="id"
          :model-value="arrayValue(item.id)"
          @update:model-value="updateValue(item.id, $event)" />
        <IssueDateFilter
          v-else-if="item.attribute.type === 'date'"
          :model-value="arrayValue(item.id)"
          @update:model-value="updateValue(item.id, $event)" />
        <IssueDateTimeFilter
          v-else-if="item.attribute.type === 'dateTime'"
          :model-value="arrayValue(item.id)"
          @update:model-value="updateValue(item.id, $event)" />
        <template v-else>{{ assertNever(item.attribute) }}</template>
      </template>
    </template>
  </FilterMenu>
</template>

<script setup lang="ts">
import type { FilterMenuItem } from '~/components/filter-menu/FilterMenu.types'
import FilterMenu from '~/components/filter-menu/FilterMenu.vue'
import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import { AttributeIcon, BoardIcon, SpaceIcon } from '~/constants/icons'
import { assertNever } from '~/utils/assertNever'

import IssueDateFilter from './components/IssueDateFilter.vue'
import IssueDateTimeFilter from './components/IssueDateTimeFilter.vue'
import IssueDecimalFilter from './components/IssueDecimalFilter.vue'
import IssueIntegerFilter from './components/IssueIntegerFilter.vue'
import IssueListFilter from './components/IssueListFilter.vue'
import IssueTextFilter from './components/IssueTextFilter.vue'
import type { IssueFilterBoardStatus, IssueFiltersValue } from './IssueFilters.types'

const props = withDefaults(
  defineProps<{
    attributes: IssueAttributeField[]
    epicStatuses?: Array<{ label: string; value: IssueFilterBoardStatus }>
    loading: boolean
    modelValue: IssueFiltersValue
    spaces?: Array<{ label: string; value: string }>
  }>(),
  { epicStatuses: () => [], spaces: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: IssueFiltersValue]
}>()

const { t } = useI18n({
  en: {
    boardStatus: 'Board status',
    issueFilters: 'Issue filters',
    space: 'Space',
    spaces: 'Spaces',
  },
  ru: {
    boardStatus: 'Статус доски',
    issueFilters: 'Фильтры задач',
    space: 'Пространство',
    spaces: 'Пространства',
  },
})

const SPACE_FILTER = '__space__'
const EPIC_STATUS_FILTER = '__epic_status__'
const selectedSpaces = computed(() => props.modelValue.spaceIds ?? [])
const selectedEpicStatuses = computed(() => props.modelValue.epicStatuses ?? [])
const activeCount = computed(
  () =>
    Object.keys(props.modelValue.attributes).length +
    selectedSpaces.value.length +
    selectedEpicStatuses.value.length,
)
const arrayValue = (id: string) => {
  const value = props.modelValue.attributes[id]
  return Array.isArray(value) ? value : []
}
const valueCount = (id: string) => {
  const value = props.modelValue.attributes[id]
  return Array.isArray(value) ? value.filter(Boolean).length : Number(Boolean(value))
}
const updateValue = (id: string, value: string | string[]) => {
  const attributes = { ...props.modelValue.attributes }
  if (Array.isArray(value) ? value.some(Boolean) : value.length > 0) {
    attributes[id] = value
  } else {
    delete attributes[id]
  }
  emit('update:modelValue', { ...props.modelValue, attributes })
}

const clear = () => {
  emit(
    'update:modelValue',
    props.epicStatuses.length
      ? { attributes: {}, epicStatuses: [], spaceIds: [] }
      : { attributes: {}, spaceIds: [] },
  )
}

const setSpaces = (spaceIds: string[]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    spaceIds,
  })
}

const setEpicStatuses = (epicStatuses: IssueFilterBoardStatus[]) => {
  emit('update:modelValue', { ...props.modelValue, epicStatuses })
}

const toggleEpicStatus = (status: IssueFilterBoardStatus) => {
  setEpicStatuses(
    selectedEpicStatuses.value.includes(status)
      ? selectedEpicStatuses.value.filter((value) => value !== status)
      : [...selectedEpicStatuses.value, status],
  )
}

const toggleSpace = (spaceId: string) => {
  setSpaces(
    selectedSpaces.value.includes(spaceId)
      ? selectedSpaces.value.filter((id) => id !== spaceId)
      : [...selectedSpaces.value, spaceId],
  )
}

type FilterItem = FilterMenuItem & { attribute?: IssueAttributeField }
const filterItems = computed<FilterItem[]>(() => [
  ...(props.spaces.length
    ? [
        {
          count: selectedSpaces.value.length,
          icon: SpaceIcon,
          id: SPACE_FILTER,
          label: t('space'),
        },
      ]
    : []),
  ...(props.epicStatuses.length
    ? [
        {
          count: selectedEpicStatuses.value.length,
          icon: BoardIcon,
          id: EPIC_STATUS_FILTER,
          label: t('boardStatus'),
        },
      ]
    : []),
  ...props.attributes.map((attribute) => ({
    attribute,
    color: attribute.color,
    count: valueCount(attribute.id),
    icon: AttributeIcon,
    id: attribute.id,
    label: attribute.name,
  })),
])
</script>

<style scoped>
.filter-options {
  border: 0;
  display: grid;
  margin: 0;
  min-width: 0;
  padding: 0;
}
</style>
