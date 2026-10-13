<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconHistory"
        :title="t('history')">
        <template
          v-if="data"
          #tools>
          <FilterMenu
            :active-count="activeCount"
            :items="filterItems"
            :label="t('historyFilters')"
            :on-clear="clear">
            <template #panel="{ id, item }">
              <fieldset
                v-if="item.id === 'user'"
                :aria-label="t('user')"
                class="filter-options">
                <BaseCheckbox
                  v-for="user in data.users"
                  :key="user.value"
                  :model-value="form.ownerId === user.value"
                  @update:model-value="setOwner(user.value, $event)">
                  {{ user.label }}
                </BaseCheckbox>
              </fieldset>
              <IssueDateFilter
                v-else
                :id="id"
                :model-value="[form.dateFrom, form.dateTo]"
                @update:model-value="setDates" />
            </template>
          </FilterMenu>
        </template>
      </PageHeader>
    </template>
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default>
        <section class="history-page">
          <HistoryTimeline
            v-if="historyState.items.length || !pagePending"
            :items="historyState.items"
            :label="t('entries')" />
          <div
            v-if="pagePending"
            class="history-loading"
            role="status">
            <IconLoader2 class="spin" />
            <span>{{ t('loading') }}</span>
          </div>
          <BaseButton
            v-else-if="historyState.hasNextPage"
            class="history-more"
            size="small"
            @click="loadPage()">
            {{ t('loadMore') }}
          </BaseButton>
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconCalendar, IconHistory, IconLoader2, IconUser } from '@tabler/icons-vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import FilterMenu from '~/components/filter-menu/FilterMenu.vue'
import type { FilterMenuItem } from '~/components/filter-menu/FilterMenu.types'
import type { HistoryItemViewModel } from '~/components/history-timeline/HistoryTimeline.types'
import HistoryTimeline from '~/components/history-timeline/HistoryTimeline.vue'
import IssueDateFilter from '~/components/issue-filters/components/IssueDateFilter.vue'

import type { OrganizationHistoryPageDeps } from './OrganizationHistoryPage.deps'

const props = defineProps<{
  deps: OrganizationHistoryPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  routeQuery: LocationQuery
}>()

const { t } = useI18n({
  en: {
    date: 'Date',
    entries: 'Organization history entries',
    history: 'Organization history',
    historyFilters: 'History filters',
    loadError: 'Could not load organization history',
    loading: 'Loading history…',
    loadMore: 'Load more',
    user: 'User',
  },
  ru: {
    date: 'Дата',
    entries: 'Записи истории организации',
    history: 'История организации',
    historyFilters: 'Фильтры истории',
    loadError: 'Не удалось загрузить историю организации',
    loading: 'Загрузка истории…',
    loadMore: 'Загрузить ещё',
    user: 'Пользователь',
  },
})

const organizationRoutes = useOrganizationRoutes()

const queryValue = (value: LocationQuery[string] | undefined) =>
  typeof value === 'string' ? value : ''
const filters = computed(() => ({
  dateFrom: queryValue(props.routeQuery.from),
  dateTo: queryValue(props.routeQuery.to),
  ownerId: queryValue(props.routeQuery.user),
}))
const form = reactive({ ...filters.value })
const activeCount = computed(() => Object.values(filters.value).filter(Boolean).length)
const requestFilters = computed(() => ({
  dateFrom: filters.value.dateFrom ? `${filters.value.dateFrom}T00:00:00.000Z` : undefined,
  dateTo: filters.value.dateTo ? `${filters.value.dateTo}T23:59:59.999Z` : undefined,
  ownerId: filters.value.ownerId || undefined,
}))
const { data, message, pending, refresh } = await useApiQuery('organization-history', (signal) =>
  props.deps.loadInitial({ ...requestFilters.value, signal }),
)

const { execute: executePage, pending: pagePending } = useApiAction(props.deps.loadPage)

const withLink = (item: HistoryItemViewModel): HistoryItemViewModel => ({
  ...item,
  ...(item.issueKey
    ? { link: { label: item.issueKey, to: organizationRoutes.issue(item.issueKey) } }
    : {}),
})

const historyState = reactive({
  hasNextPage: false,
  items: [] as HistoryItemViewModel[],
  page: 1,
})

const loadPage = async (replace = false) => {
  const filtersOnRequest = requestFilters.value
  const requestedPage = replace ? 0 : historyState.page
  const page = await executePage({ ...filtersOnRequest, page: requestedPage })

  // A page that answers after the filters changed belongs to a list no longer shown.
  if (!page || requestFilters.value !== filtersOnRequest) {
    return
  }

  const items = page.value.items.map(withLink)
  historyState.items = replace ? items : [...historyState.items, ...items]
  historyState.hasNextPage = page.value.hasNextPage
  historyState.page = requestedPage + 1
}

const applyFilters = () => {
  const query: LocationQueryRaw = {}
  if (form.ownerId) {
    query.user = form.ownerId
  }
  if (form.dateFrom) {
    query.from = form.dateFrom
  }
  if (form.dateTo) {
    query.to = form.dateTo
  }
  void props.onUpdateQuery(query)
}

const filterItems = computed<FilterMenuItem[]>(() => [
  { count: Number(Boolean(filters.value.ownerId)), icon: IconUser, id: 'user', label: t('user') },
  {
    count: Number(Boolean(filters.value.dateFrom)) + Number(Boolean(filters.value.dateTo)),
    icon: IconCalendar,
    id: 'date',
    label: t('date'),
  },
])

// One author at a time: picking another replaces the first.
const setOwner = (ownerId: string, checked: boolean) => {
  form.ownerId = checked ? ownerId : ''
  applyFilters()
}

const setDates = ([dateFrom = '', dateTo = '']: string[]) => {
  Object.assign(form, { dateFrom, dateTo })
  applyFilters()
}

const clear = () => {
  Object.assign(form, { dateFrom: '', dateTo: '', ownerId: '' })
  applyFilters()
}

watch(filters, (value) => {
  Object.assign(form, value)
  void loadPage(true)
})
watch(
  data,
  (value) => {
    if (!value) {
      return
    }
    historyState.items = value.history.items.map(withLink)
    historyState.hasNextPage = value.history.hasNextPage
    historyState.page = 1
  },
  { immediate: true },
)
</script>

<style scoped>
.history-page {
  align-content: start;
  display: grid;
  gap: var(--space-5);
  margin-inline: auto;
  max-width: 768px;
  width: 100%;
}

.filter-options {
  border: 0;
  display: grid;
  margin: 0;
  min-width: 0;
  padding: 0;
}

.history-loading {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  font-size: var(--font-size-small);
  gap: var(--space-2);
  justify-self: start;
}

.history-loading svg {
  animation: var(--animation-spin);
  height: 14px;
  width: 14px;
}

.history-more {
  justify-self: start;
}
</style>
