<template>
  <QueryState
    :data="data"
    error-title="Could not load issues"
    loading-text="Loading issues…"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: view }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <ClipboardList class="page-heading-icon" />
            <div class="page-heading-text">
              <h1>All issues</h1>
            </div>
          </div>
          <NuxtLink
            v-if="view.spaces.length"
            aria-label="Add issue"
            class="primary"
            data-tour="create-issue"
            :to="organizationRoutes.newIssue()">
            <Plus />
            <span class="btn-label">Add issue</span>
          </NuxtLink>
        </div>
        <div class="toolbar">
          <input
            aria-label="Search issues"
            data-tour="issues-search"
            placeholder="Search issues"
            type="search"
            :value="request.search"
            @input="updateSearch(($event.target as HTMLInputElement).value)" />
          <IssueFilters
            :attributes="view.attributes"
            data-tour="issues-filters"
            :loading="filtering"
            :model-value="filterValue"
            :spaces="view.spaces"
            @update:model-value="
              updateFilters({
                attributes: $event.attributes,
                spaceIds: $event.spaceIds ?? [],
              })
            " />
        </div>
        <p
          v-if="searchMessage"
          class="form-error">
          {{ searchMessage }}
        </p>
        <IssueList
          :deps="deps.issueList"
          empty-hint="An issue is one piece of work — a task, a bug, an idea. It lives in a space, sits in a board column that shows its status, and can be assigned to someone."
          empty-text="No issues yet"
          :filtering="filtering"
          :has-next-page="hasNextPage"
          :issues="issues"
          :on-moved="searchIssues"
          :on-update-page="updatePage"
          :page="request.page" />
      </section>
    </template>
  </QueryState>
</template>

<script setup lang="ts">
import { ClipboardList, Plus } from '@lucide/vue'
import { debounce } from 'es-toolkit'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import type { IssueFiltersValue } from '~/components/issue-filters/IssueFilters.types'
import IssueFilters from '~/components/issue-filters/IssueFilters.vue'
import IssueList from '~/components/issue-list/IssueList.vue'
import type { IssuesPageDeps } from '~/sections/issues/issues/IssuesPage.deps'
import { useIssuesTour } from '~/sections/issues/issues/useIssuesTour'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{
  deps: IssuesPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  organizationKey: string
  routeQuery: LocationQuery
}>()

const organizationRoutes = useOrganizationRoutes()

const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(props.routeQuery),
  page: Math.max(1, Number(props.routeQuery.page) || 1),
  search: typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
  spaceIds: readIssueSpaceQuery(props.routeQuery.space),
}))

const { data, message, pending, refresh } = await useQuery(
  () => `issues:${props.organizationKey}`,
  (_nuxtApp, { signal }) => props.deps.view({ ...request.value, signal }),
  { watch: [() => props.organizationKey] },
)

useIssuesTour(data, props.deps.tour)

useHead({ title: 'All issues' })

const attributes = computed(() => data.value?.attributes ?? [])
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(request.value.attributeQuery, attributes.value),
)
const filterValue = computed<IssueFiltersValue>(() => ({
  attributes: attributeFilters.value,
  spaceIds: request.value.spaceIds,
}))

const {
  clear: clearSearch,
  data: searchResult,
  execute: runSearch,
  message: searchMessage,
  pending: searching,
} = await useQuery(
  () => `issues-search:${props.organizationKey}`,
  () =>
    props.deps.searchIssues({
      filters: getIssueAttributeFilterInput(attributeFilters.value, attributes.value),
      page: request.value.page,
      search: request.value.search,
      spaceIds: request.value.spaceIds,
    }),
  { immediate: false },
)

const issues = computed(() => searchResult.value?.issues ?? data.value?.issues ?? [])
const hasNextPage = computed(
  () => searchResult.value?.hasNextPage ?? data.value?.hasNextPage ?? false,
)

const state = reactive({ scheduled: false })

const filtering = computed(() => state.scheduled || searching.value)

const searchIssues = async () => {
  scheduleSearch.cancel()
  state.scheduled = false
  if (data.value === undefined) {
    return
  }
  await runSearch()
}

const scheduleSearch = debounce(searchIssues, 300)

const updateFilters = (value: Required<IssueFiltersValue>) => {
  const nextQuery = withIssueAttributeFilters(props.routeQuery, value.attributes, attributes.value)
  if (value.spaceIds.length) {
    nextQuery.space = value.spaceIds
  } else {
    delete nextQuery.space
  }
  void props.onUpdateQuery(nextQuery)
}

const updatePage = (value: number) => {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  if (value > 1) {
    nextQuery.page = String(value)
  } else {
    delete nextQuery.page
  }
  void props.onUpdateQuery(nextQuery)
}

const updateSearch = (value: string) => {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  delete nextQuery.page
  if (value) {
    nextQuery.search = value
  } else {
    delete nextQuery.search
  }
  void props.onUpdateQuery(nextQuery)
}

watch(request, () => {
  state.scheduled = true
  scheduleSearch()
})

watch(
  () => props.organizationKey,
  () => {
    scheduleSearch.cancel()
    state.scheduled = false
    clearSearch()
  },
)

onScopeDispose(() => {
  scheduleSearch.cancel()
})
</script>
