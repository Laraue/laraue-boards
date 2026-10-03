<template>
  <div>
    <PageHeader
      :icon="IconHistory"
      :title="t('history')" />
    <QueryState
      :data="data"
      :error-title="t('loadError')"
      :loading-text="t('loading')"
      :message="message"
      :on-retry="refresh"
      :pending="pending">
      <template #default="{ data: view }">
        <section class="history-page">
          <form
            class="history-filters"
            @change="applyFilters"
            @submit.prevent>
            <label>
              {{ t('user') }}
              <select v-model="form.ownerId">
                <option value="">{{ t('allUsers') }}</option>
                <option
                  v-for="user in view.users"
                  :key="user.value"
                  :value="user.value">
                  {{ user.label }}
                </option>
              </select>
            </label>
            <label>
              {{ t('from') }}
              <input
                v-model="form.dateFrom"
                type="date" />
            </label>
            <label>
              {{ t('to') }}
              <input
                v-model="form.dateTo"
                :min="form.dateFrom || undefined"
                type="date" />
            </label>
          </form>
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
          <button
            v-else-if="historyState.hasNextPage"
            class="secondary small history-more"
            type="button"
            @click="loadPage()">
            {{ t('loadMore') }}
          </button>
        </section>
      </template>
    </QueryState>
  </div>
</template>

<script setup lang="ts">
import { IconHistory, IconLoader2 } from '@tabler/icons-vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import type { HistoryItemViewModel } from '~/components/history-timeline/HistoryTimeline.types'
import HistoryTimeline from '~/components/history-timeline/HistoryTimeline.vue'

import type { OrganizationHistoryPageDeps } from './OrganizationHistoryPage.deps'

const props = defineProps<{
  deps: OrganizationHistoryPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  routeQuery: LocationQuery
}>()

const { t } = useI18n({
  en: {
    allUsers: 'All users',
    entries: 'Organization history entries',
    from: 'From',
    history: 'Organization history',
    loadError: 'Could not load organization history',
    loading: 'Loading history…',
    loadMore: 'Load more',
    to: 'To',
    user: 'User',
  },
  ru: {
    allUsers: 'Все пользователи',
    entries: 'Записи истории организации',
    from: 'От',
    history: 'История организации',
    loadError: 'Не удалось загрузить историю организации',
    loading: 'Загрузка истории…',
    loadMore: 'Загрузить ещё',
    to: 'До',
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
}

.history-filters {
  align-items: end;
  display: grid;
  gap: var(--space-3);
  grid-template-columns: minmax(180px, 1fr) repeat(2, minmax(140px, 0.5fr));
}

.history-filters label {
  display: grid;
  gap: var(--space-1);
  margin: 0;
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

@media (max-width: 767px) {
  .history-filters {
    grid-template-columns: 1fr;
  }
}
</style>
