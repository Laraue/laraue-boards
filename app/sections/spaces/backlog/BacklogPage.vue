<template>
  <QueryState
    :data="data"
    :error-title="t('loadError')"
    :loading-text="t('loading')"
    :message="message"
    :on-retry="refresh"
    :pending="pending">
    <template #default="{ data: page }">
      <section>
        <div class="title-row">
          <div class="page-heading">
            <AppBackLink
              :label="t('backToSpace')"
              :to="organizationRoutes.space(page.spaceKey)" />
            <ListTodo
              class="page-heading-icon"
              :style="{ color: page.color }" />
            <div class="page-heading-text">
              <h1>{{ page.title }}</h1>
            </div>
          </div>
          <div class="title-actions">
            <NuxtLink
              :aria-label="t('addIssue')"
              class="primary"
              :to="organizationRoutes.newBacklogIssue(page.spaceKey)">
              <Plus />
              <span class="btn-label">{{ t('addIssue') }}</span>
            </NuxtLink>
          </div>
        </div>
        <div class="toolbar">
          <input
            :aria-label="t('searchIssues')"
            :placeholder="t('searchIssues')"
            type="search"
            :value="request.search"
            @input="updateSearch(($event.target as HTMLInputElement).value)" />
          <IssueFilters
            :attributes="page.attributes"
            :loading="filtering"
            :model-value="filterValue"
            @update:model-value="updateFilters({ attributes: $event.attributes })" />
        </div>
        <p
          v-if="searchMessage"
          class="form-error">
          {{ searchMessage }}
        </p>
        <IssueList
          :deps="deps.issueList"
          :empty-hint="t('emptyHint')"
          :empty-text="t('emptyTitle')"
          :excluded-move-board-id="page.backlogBoardId"
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
import { ListTodo, Plus } from '@lucide/vue'
import { debounce } from 'es-toolkit'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import type { IssueFiltersValue } from '~/components/issue-filters/IssueFilters.types'
import IssueFilters from '~/components/issue-filters/IssueFilters.vue'
import IssueList from '~/components/issue-list/IssueList.vue'
import type { BacklogPageDeps } from '~/sections/spaces/backlog/BacklogPage.deps'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const props = defineProps<{
  deps: BacklogPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  routeQuery: LocationQuery
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    backlog: 'Backlog',
    backToSpace: 'Back to space',
    emptyHint:
      'The backlog is where work waits. Park ideas and requests here, then move them onto a board when the team is ready to pick them up.',
    emptyTitle: 'The backlog is empty',
    loadError: 'Could not load backlog',
    loading: 'Loading backlog…',
    searchIssues: 'Search issues',
  },
  ru: {
    addIssue: 'Добавить задачу',
    backlog: 'Бэклог',
    backToSpace: 'Назад к разделу',
    emptyHint:
      'Бэклог — место, где ждут работы. Сохраняйте здесь идеи и запросы, а затем переносите их на доску, когда команда будет готова.',
    emptyTitle: 'Бэклог пуст',
    loadError: 'Не удалось загрузить бэклог',
    loading: 'Загрузка бэклога…',
    searchIssues: 'Поиск задач',
  },
})

const organizationRoutes = useOrganizationRoutes()

const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(props.routeQuery),
  page: Math.max(1, Number(props.routeQuery.page) || 1),
  search: typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
}))

const { data, message, pending, refresh } = await useQuery(
  () => `backlog:${props.spaceKey}`,
  (_nuxtApp, { signal }) =>
    props.deps.view({
      ...request.value,
      signal,
      spaceKey: props.spaceKey,
    }),
  { watch: [() => props.spaceKey] },
)
const attributes = computed(() => data.value?.attributes ?? [])

const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(request.value.attributeQuery, attributes.value),
)
const filterValue = computed<IssueFiltersValue>(() => ({
  attributes: attributeFilters.value,
}))

const {
  clear: clearSearch,
  data: searchResult,
  execute: runSearch,
  message: searchMessage,
  pending: searching,
} = await useQuery(
  () => `backlog-search:${props.spaceKey}`,
  () =>
    props.deps.search({
      backlogBoardId: data.value?.backlogBoardId ?? '',
      filters: getIssueAttributeFilterInput(attributeFilters.value, attributes.value),
      page: request.value.page,
      search: request.value.search,
    }),
  { immediate: false },
)

const issues = computed(() => searchResult.value?.issues ?? data.value?.issues ?? [])

const hasNextPage = computed(
  () => searchResult.value?.hasNextPage ?? data.value?.hasNextPage ?? false,
)

const state = reactive({ scheduled: false })

const filtering = computed(() => state.scheduled || searching.value)

const updateFilters = (value: Required<Pick<IssueFiltersValue, 'attributes'>>) => {
  void props.onUpdateQuery(
    withIssueAttributeFilters(props.routeQuery, value.attributes, attributes.value),
  )
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

const searchIssues = async () => {
  scheduleSearch.cancel()
  state.scheduled = false
  if (!data.value) {
    return
  }
  await runSearch()
}

const scheduleSearch = debounce(searchIssues, 300)

watch(
  () => ({
    attributeQuery: request.value.attributeQuery,
    page: request.value.page,
    search: request.value.search,
  }),
  () => {
    state.scheduled = true
    scheduleSearch()
  },
)
watch(
  () => props.spaceKey,
  () => {
    scheduleSearch.cancel()
    state.scheduled = false
    clearSearch()
  },
)
onScopeDispose(() => {
  scheduleSearch.cancel()
})
useHead({
  title: computed(() => data.value?.title ?? t('backlog')),
})
</script>
