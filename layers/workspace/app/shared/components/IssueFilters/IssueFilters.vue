<template>
  <FilterMenu
    v-if="assigneeSelect || attributes.length || spaces.length || epicStatuses.length"
    :active-count="activeCount"
    :items="filterItems"
    :label="t('issueFilters')"
    :loading="loading"
    :on-clear="clear">
    <template #panel="{ id, item }">
      <IssueAssigneeFilter
        v-if="item.id === ASSIGNEE_FILTER && assigneeSelect"
        :deps="assigneeSelect"
        :model-value="selectedAssignees"
        :space-key="spaceKey"
        @update:model-value="emit('update:modelValue', { ...modelValue, assigneeIds: $event })" />
      <fieldset
        v-else-if="item.id === EPIC_STATUS_FILTER"
        :aria-label="t('boardStatus')"
        class="filter-options">
        <BaseCheckbox
          v-for="option in epicStatuses"
          :key="option.value"
          :model-value="selectedEpicStatuses.includes(option.value)"
          @update:model-value="toggleEpicStatus(option.value)">
          <span class="filter-option">
            <StatusIndicator
              :category="boardStatusAppearance[option.value].category"
              :color="boardStatusAppearance[option.value].color" />
            <span>{{ option.label }}</span>
          </span>
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
          <span class="filter-option">
            <SpaceIcon
              aria-hidden="true"
              :style="{ color: option.color }" />
            <span>{{ option.label }}</span>
          </span>
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
import { IconUser } from '@tabler/icons-vue'
import { computed } from 'vue'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseCheckbox from '#layers/core/app/ui/components/BaseCheckbox.vue'
import StatusIndicator from '#layers/workspace/app/shared/components/StatusIndicator.vue'
import { boardStatusAppearance } from '#layers/workspace/app/shared/constants/boardStatus'
import type { AssigneeSelectDeps } from '#layers/workspace/app/shared/components/AssigneeSelect/AssigneeSelect.deps'
import type { IssueAttributeField } from '#layers/workspace/app/shared/components/IssueAttributeFields/IssueAttributeFields.types'
import type { FilterMenuItem } from '#layers/workspace/app/shared/components/FilterMenu/FilterMenu.types'
import FilterMenu from '#layers/workspace/app/shared/components/FilterMenu/FilterMenu.vue'
import { AttributeIcon, BoardIcon, SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import { assertNever } from '#layers/workspace/app/shared/utils/assertNever'

import IssueAssigneeFilter from './components/IssueAssigneeFilter.vue'
import IssueDateFilter from '#layers/workspace/app/shared/components/IssueDateFilter.vue'
import IssueDateTimeFilter from './components/IssueDateTimeFilter.vue'
import IssueDecimalFilter from './components/IssueDecimalFilter.vue'
import IssueIntegerFilter from './components/IssueIntegerFilter.vue'
import IssueListFilter from './components/IssueListFilter.vue'
import IssueTextFilter from './components/IssueTextFilter.vue'
import type { IssueFilterBoardStatus, IssueFiltersValue } from './IssueFilters.types'

const props = withDefaults(
  defineProps<{
    assigneeSelect?: AssigneeSelectDeps
    attributes: IssueAttributeField[]
    epicStatuses?: Array<{ label: string; value: IssueFilterBoardStatus }>
    loading: boolean
    modelValue: IssueFiltersValue
    spaceKey?: string
    spaces?: Array<{ color?: string; label: string; value: string }>
  }>(),
  { epicStatuses: () => [], spaces: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: IssueFiltersValue]
}>()

const { t } = useI18n({
  en: {
    assignees: 'Assignees',
    boardStatus: 'Board status',
    issueFilters: 'Issue filters',
    space: 'Space',
    spaces: 'Spaces',
  },
  ru: {
    assignees: 'Исполнители',
    boardStatus: 'Статус доски',
    issueFilters: 'Фильтры задач',
    space: 'Пространство',
    spaces: 'Пространства',
  },
})

const SPACE_FILTER = '__space__'
const ASSIGNEE_FILTER = '__assignee__'
const selectedAssignees = computed(() => props.modelValue.assigneeIds ?? [])
const EPIC_STATUS_FILTER = '__epic_status__'
const selectedSpaces = computed(() => props.modelValue.spaceIds ?? [])
const selectedEpicStatuses = computed(() => props.modelValue.epicStatuses ?? [])
const activeCount = computed(
  () =>
    Object.keys(props.modelValue.attributes).length +
    selectedAssignees.value.length +
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
  emit('update:modelValue', {
    ...(props.assigneeSelect ? { assigneeIds: [] } : {}),
    attributes: {},
    ...(props.epicStatuses.length ? { epicStatuses: [] } : {}),
    spaceIds: [],
  })
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
  ...(props.assigneeSelect
    ? [{
        count: selectedAssignees.value.length,
        icon: IconUser,
        id: ASSIGNEE_FILTER,
        label: t('assignees'),
      }]
    : []),
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

.filter-options :deep(.base-checkbox) {
  padding-inline: var(--space-2);
}

.filter-option {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}
</style>
