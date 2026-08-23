<template>
  <AppPopover
    v-if="attributes.length || spaces?.length"
    class="issue-filters">
    <template #trigger="{ open, toggle: togglePopover }">
      <button
        :aria-busy="loading"
        :aria-expanded="open"
        aria-haspopup="dialog"
        class="secondary"
        type="button"
        @click="togglePopover">
        <LoaderCircle
          v-if="loading"
          class="issue-filters-loading" />
        <ListFilter v-else />
        Filters
        <span v-if="activeCount">({{ activeCount }})</span>
      </button>
    </template>
    <div class="issue-filters-popover">
      <nav aria-label="Issue filters">
        <button
          v-if="spaces?.length"
          :class="{ active: activeFilterId === SPACE_FILTER }"
          type="button"
          @click="activeFilterId = SPACE_FILTER">
          <span class="filter-label">Space</span>
          <small v-if="selectedSpaces.length">
            {{ selectedSpaces.length }}
          </small>
        </button>
        <button
          v-for="attribute in attributes"
          :key="attribute.id"
          :class="{ active: attribute.id === activeAttribute?.id }"
          type="button"
          @click="activeFilterId = attribute.id">
          <span
            class="filter-dot"
            :style="{ background: attribute.color }" />
          <span class="filter-label">{{ attribute.name }}</span>
          <small v-if="valueCount(attribute.id)">
            {{ valueCount(attribute.id) }}
          </small>
        </button>
        <button
          class="secondary clear-filter"
          :disabled="!activeCount"
          type="button"
          @click="clear()">
          Clear all
        </button>
      </nav>
      <section
        v-if="activeFilterId === SPACE_FILTER"
        class="filter-editor">
        <fieldset>
          <legend>Spaces</legend>
          <label
            v-for="option in spaces"
            :key="option.value">
            <input
              :checked="selectedSpaces.includes(option.value)"
              type="checkbox"
              @change="toggleSpace(option.value)" />
            <span>{{ option.label }}</span>
          </label>
        </fieldset>
        <button
          class="secondary clear-filter"
          :disabled="!selectedSpaces.length"
          type="button"
          @click="setSpaces([])">
          Clear
        </button>
      </section>
      <section
        v-else-if="activeAttribute"
        :key="activeAttribute.id"
        class="filter-editor">
        <IssueTextFilter
          v-if="activeAttribute.type === 'text'"
          :id="`${idPrefix}-${activeAttribute.id}`"
          :model-value="String(modelValue.attributes[activeAttribute.id] ?? '')"
          @update:model-value="updateValue(activeAttribute.id, $event)" />
        <IssueListFilter
          v-else-if="activeAttribute.type === 'list'"
          :model-value="arrayValue(activeAttribute.id)"
          :options="activeAttribute.options"
          @update:model-value="updateValue(activeAttribute.id, $event)" />
        <IssueIntegerFilter
          v-else-if="activeAttribute.type === 'integer'"
          :id="`${idPrefix}-${activeAttribute.id}`"
          :model-value="arrayValue(activeAttribute.id)"
          @update:model-value="updateValue(activeAttribute.id, $event)" />
        <IssueDecimalFilter
          v-else-if="activeAttribute.type === 'decimal'"
          :id="`${idPrefix}-${activeAttribute.id}`"
          :model-value="arrayValue(activeAttribute.id)"
          @update:model-value="updateValue(activeAttribute.id, $event)" />
        <IssueDateFilter
          v-else-if="activeAttribute.type === 'date'"
          :id="`${idPrefix}-${activeAttribute.id}`"
          :model-value="arrayValue(activeAttribute.id)"
          @update:model-value="updateValue(activeAttribute.id, $event)" />
        <IssueDateTimeFilter
          v-else-if="activeAttribute.type === 'dateTime'"
          :id="`${idPrefix}-${activeAttribute.id}`"
          :model-value="arrayValue(activeAttribute.id)"
          @update:model-value="updateValue(activeAttribute.id, $event)" />
        <template v-else>{{ assertNever(activeAttribute) }}</template>
        <button
          class="secondary clear-filter"
          :disabled="!valueCount(activeAttribute.id)"
          type="button"
          @click="clear(activeAttribute.id)">
          Clear
        </button>
      </section>
    </div>
  </AppPopover>
</template>

<script setup lang="ts">
import { ListFilter, LoaderCircle } from '@lucide/vue'

import type { IssueAttributeField } from '~/components/issue-attribute-fields/IssueAttributeFields.types'
import { assertNever } from '~/utils/assertNever'

import IssueDateFilter from './components/IssueDateFilter.vue'
import IssueDateTimeFilter from './components/IssueDateTimeFilter.vue'
import IssueDecimalFilter from './components/IssueDecimalFilter.vue'
import IssueIntegerFilter from './components/IssueIntegerFilter.vue'
import IssueListFilter from './components/IssueListFilter.vue'
import IssueTextFilter from './components/IssueTextFilter.vue'
import type { IssueFiltersValue } from './IssueFilters.types'

const props = withDefaults(
  defineProps<{
    attributes: IssueAttributeField[]
    loading: boolean
    modelValue: IssueFiltersValue
    spaces?: Array<{ label: string; value: string }>
  }>(),
  { spaces: () => [] },
)

const emit = defineEmits<{
  'update:modelValue': [value: IssueFiltersValue]
}>()

const idPrefix = useId()
const SPACE_FILTER = '__space__'
const activeFilterId = ref(props.spaces.length ? SPACE_FILTER : (props.attributes[0]?.id ?? ''))
const activeAttribute = computed(() =>
  props.attributes.find((attribute) => attribute.id === activeFilterId.value),
)
const selectedSpaces = computed(() => props.modelValue.spaceIds ?? [])
const activeCount = computed(
  () => Object.keys(props.modelValue.attributes).length + selectedSpaces.value.length,
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

const clear = (id?: string) => {
  if (!id) {
    emit('update:modelValue', { attributes: {}, spaceIds: [] })
    return
  }
  updateValue(id, '')
}

const setSpaces = (spaceIds: string[]) => {
  emit('update:modelValue', {
    attributes: props.modelValue.attributes,
    spaceIds,
  })
}

const toggleSpace = (spaceId: string) => {
  setSpaces(
    selectedSpaces.value.includes(spaceId)
      ? selectedSpaces.value.filter((id) => id !== spaceId)
      : [...selectedSpaces.value, spaceId],
  )
}
</script>

<style scoped>
.issue-filters {
  --app-popover-width: min(480px, calc(100vw - var(--space-8)));
}

.issue-filters-loading {
  animation: var(--animation-spin);
}

.issue-filters-popover {
  display: grid;
  grid-template-columns: 190px minmax(260px, 1fr);
  max-height: 420px;
  min-height: 280px;
  overflow: hidden;
}

.issue-filters-popover nav {
  border-right: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
  max-height: 420px;
  overflow-y: auto;
  padding: var(--space-2);
}

.issue-filters-popover nav button:not(.clear-filter) {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--radius-control);
  color: var(--color-text);
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
  padding: 0 var(--space-3);
  text-align: left;
  width: 100%;
}

.issue-filters-popover nav button:not(.clear-filter):hover {
  background: var(--color-hover);
}

.issue-filters-popover nav button:not(.clear-filter).active {
  background: var(--color-accent-soft);
  color: var(--color-text);
  font-weight: var(--font-weight-semibold);
}

.issue-filters-popover .filter-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.issue-filters-popover nav small {
  align-items: center;
  margin-left: auto;
}

.issue-filters-popover .clear-filter {
  margin-top: auto;
}

.filter-dot {
  border-radius: var(--radius-pill);
  flex: none;
  height: 8px;
  width: 8px;
}

.filter-editor {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  padding: var(--space-2);
}

.filter-editor fieldset {
  border: 0;
  display: grid;
  gap: var(--space-2);
  margin: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 0 var(--space-1) var(--space-4);
}

.filter-editor legend {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-3);
}

.filter-editor fieldset label {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: var(--space-2);
  margin: 0;
}

@media (max-width: 600px) {
  .issue-filters-popover {
    grid-template-columns: minmax(120px, 40%) minmax(0, 1fr);
  }
}
</style>
