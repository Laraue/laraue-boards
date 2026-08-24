<template>
  <QueryState
    :data="data"
    error-title="Could not load organization history"
    loading-text="Loading history…"
    :message="message"
    :on-retry="retry"
    :pending="pending">
    <template #default="{ data: view }">
      <section class="history-page">
        <div class="page-heading">
          <History class="page-heading-icon" />
          <div class="page-heading-text">
            <h1>Organization history</h1>
          </div>
        </div>
        <form
          class="history-filters"
          @change="applyFilters"
          @submit.prevent>
          <label>
            User
            <select v-model="form.ownerId">
              <option value="">All users</option>
              <option
                v-for="user in view.users"
                :key="user.value"
                :value="user.value">
                {{ user.label }}
              </option>
            </select>
          </label>
          <label>
            From
            <input
              v-model="form.dateFrom"
              type="date" />
          </label>
          <label>
            To
            <input
              v-model="form.dateTo"
              :min="form.dateFrom || undefined"
              type="date" />
          </label>
        </form>
        <HistoryTimeline
          v-if="data && (historyState.items.length || !pagePending)"
          :items="historyState.items"
          label="Organization history entries" />
        <p
          v-if="pageMessage"
          class="form-error"
          role="alert">
          {{ pageMessage }}
        </p>
        <div
          v-if="pagePending"
          class="history-loading"
          role="status">
          <LoaderCircle class="spin" />
          <span>Loading history…</span>
        </div>
        <button
          v-else-if="pageMessage || historyState.hasNextPage"
          class="secondary small history-more"
          type="button"
          @click="loadMore">
          {{ pageMessage ? 'Try again' : 'Load more' }}
        </button>
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { History, LoaderCircle } from '@lucide/vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import type { HistoryItemViewModel } from '~/components/history-timeline/HistoryTimeline.types'
import HistoryTimeline from '~/components/history-timeline/HistoryTimeline.vue'

import type { OrganizationHistoryPageDeps } from './OrganizationHistoryPage.deps'

const props = defineProps<{
  deps: OrganizationHistoryPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  routeQuery: LocationQuery
}>()
const organizationRoutes = useOrganizationRoutes()

const queryValue = (value: LocationQuery[string] | undefined) =>
  typeof value === 'string' ? value : ''
const filters = computed(() => ({
  dateFrom: queryValue(props.routeQuery.from),
  dateTo: queryValue(props.routeQuery.to),
  ownerId: queryValue(props.routeQuery.user),
}))
const form = reactive({ ...filters.value })
const requestFilters = () => ({
  dateFrom: filters.value.dateFrom ? `${filters.value.dateFrom}T00:00:00.000Z` : undefined,
  dateTo: filters.value.dateTo ? `${filters.value.dateTo}T23:59:59.999Z` : undefined,
  ownerId: filters.value.ownerId || undefined,
})
const { data, message, pending, refresh } = await useQuery(
  'organization-history',
  (_nuxtApp, { signal }) => props.deps.loadInitial({ ...requestFilters(), signal }),
)

const requestedPage = ref(0)
const {
  data: pageData,
  execute: executePage,
  message: pageMessage,
  pending: pagePending,
} = await useQuery(
  'organization-history-page',
  (_nuxtApp, { signal }) =>
    props.deps.loadPage({ ...requestFilters(), page: requestedPage.value, signal }),
  { immediate: false },
)

const withLink = (item: HistoryItemViewModel): HistoryItemViewModel => ({
  ...item,
  ...(item.issueKey
    ? { link: { label: item.issueKey, to: organizationRoutes.issue(item.issueKey) } }
    : {}),
})

const historyState = reactive({
  hasNextPage: data.value?.history.hasNextPage ?? false,
  items: data.value?.history.items.map(withLink) ?? ([] as HistoryItemViewModel[]),
  page: 1,
})

const loadPage = async (replace = false) => {
  if (pagePending.value) {
    return
  }

  requestedPage.value = replace ? 0 : historyState.page
  await executePage()
  const page = pageData.value

  if (!page) {
    return
  }

  const items = page.items.map(withLink)
  historyState.items = replace ? items : [...historyState.items, ...items]
  historyState.hasNextPage = page.hasNextPage
  historyState.page = requestedPage.value + 1
}

const loadMore = () => loadPage()

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

const retry = () => refresh()

watch(filters, (value) => {
  Object.assign(form, value)
  void loadPage(true)
})
watch(data, (value) => {
  if (!value) {
    return
  }
  historyState.items = value.history.items.map(withLink)
  historyState.hasNextPage = value.history.hasNextPage
  historyState.page = 1
})
useHead({ title: 'Organization history' })
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

@media (max-width: 760px) {
  .history-filters {
    grid-template-columns: 1fr;
  }
}
</style>
