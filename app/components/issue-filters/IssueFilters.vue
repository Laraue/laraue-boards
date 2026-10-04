<template>
  <AppPopover v-if="attributes.length || spaces.length || epicStatuses.length">
    <template #trigger="{ open, toggle }">
      <BaseButton
        :loading="loading"
        :aria-expanded="open"
        aria-haspopup="dialog"
        @click="toggle">
        <IconFilter v-if="!loading" />
        {{ t('filters') }}
        <span v-if="activeCount">({{ activeCount }})</span>
      </BaseButton>
    </template>
    <div class="filter-menu">
      <div class="filter-menu-header">
        <span>{{ t('issueFilters') }}</span>
        <IconButton
          :disabled="!activeCount"
          :label="t('clearAll')"
          @click="clear()">
          <IconFilterOff />
        </IconButton>
      </div>
      <nav :aria-label="t('issueFilters')">
        <AppPopover
          v-for="item in filterItems"
          :key="item.id"
          :open="activeFilterId === item.id"
          hover
          side="right"
          class="filter-submenu"
          @update:open="setOpenFilter(item.id, $event)">
          <template #trigger="{ open, toggle }">
            <BaseButton
              menu
              :aria-expanded="open"
              :data-active="open || undefined"
              aria-haspopup="dialog"
              @click="toggle">
              <component
                :is="item.icon"
                aria-hidden="true"
                :style="{ color: item.color }" />
              <span class="filter-label">{{ item.label }}</span>
              <small v-if="item.count">{{ item.count }}</small>
              <IconChevronRight
                class="submenu-chevron"
                aria-hidden="true" />
            </BaseButton>
          </template>
          <section
            class="filter-editor"
            :aria-label="item.label">
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
                :id="`${idPrefix}-${item.id}`"
                :model-value="String(modelValue.attributes[item.id] ?? '')"
                @update:model-value="updateValue(item.id, $event)" />
              <IssueListFilter
                v-else-if="item.attribute.type === 'list'"
                :model-value="arrayValue(item.id)"
                :options="item.attribute.options"
                @update:model-value="updateValue(item.id, $event)" />
              <IssueIntegerFilter
                v-else-if="item.attribute.type === 'integer'"
                :id="`${idPrefix}-${item.id}`"
                :model-value="arrayValue(item.id)"
                @update:model-value="updateValue(item.id, $event)" />
              <IssueDecimalFilter
                v-else-if="item.attribute.type === 'decimal'"
                :id="`${idPrefix}-${item.id}`"
                :model-value="arrayValue(item.id)"
                @update:model-value="updateValue(item.id, $event)" />
              <IssueDateFilter
                v-else-if="item.attribute.type === 'date'"
                :id="`${idPrefix}-${item.id}`"
                :model-value="arrayValue(item.id)"
                @update:model-value="updateValue(item.id, $event)" />
              <IssueDateTimeFilter
                v-else-if="item.attribute.type === 'dateTime'"
                :id="`${idPrefix}-${item.id}`"
                :model-value="arrayValue(item.id)"
                @update:model-value="updateValue(item.id, $event)" />
              <template v-else>{{ assertNever(item.attribute) }}</template>
            </template>
          </section>
        </AppPopover>
      </nav>
    </div>
  </AppPopover>
</template>

<script setup lang="ts">
import { IconChevronRight, IconFilter, IconFilterOff } from '@tabler/icons-vue'

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
    clear: 'Clear',
    clearAll: 'Clear all',
    filters: 'Filters',
    issueFilters: 'Issue filters',
    space: 'Space',
    spaces: 'Spaces',
  },
  ru: {
    boardStatus: 'Статус доски',
    clear: 'Очистить',
    clearAll: 'Очистить всё',
    filters: 'Фильтры',
    issueFilters: 'Фильтры задач',
    space: 'Раздел',
    spaces: 'Разделы',
  },
})

const idPrefix = useId()
const SPACE_FILTER = '__space__'
const EPIC_STATUS_FILTER = '__epic_status__'
const activeFilterId = ref<string>()
const setOpenFilter = (id: string, open: boolean) => {
  if (open) activeFilterId.value = id
  else if (activeFilterId.value === id) activeFilterId.value = undefined
}
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

type FilterItem = {
  attribute?: IssueAttributeField
  color?: string
  count: number
  icon: typeof AttributeIcon
  id: string
  label: string
}
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
.filter-menu {
  padding: var(--space-1);
  width: 240px;
}
.filter-menu-header {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--space-3);
}
.filter-menu nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.filter-submenu {
  --app-popover-width: max-content;
  width: 100%;
}
.filter-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.submenu-chevron {
  flex: none;
  height: 12px;
  margin-left: auto;
  width: 12px;
}
.filter-editor {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - var(--space-8));
  overflow-y: auto;
  padding: var(--space-2);
  width: 260px;
}
.filter-options {
  border: 0;
  display: grid;
  margin: 0;
  padding: 0;
}
</style>
