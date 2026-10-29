<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconListDetails"
        :on-refresh="refreshPage"
        :parents="[
          {
            color: data?.spaceColor,
            icon: SpaceIcon,
            label: data?.spaceName ?? spaceKey,
            to: organizationRoutes.space(spaceKey),
          },
        ]"
        :title="data?.title ?? t('backlog')">
        <template
          v-if="data"
          #tools>
          <input
            :aria-label="t('searchIssues')"
            :placeholder="t('searchIssues')"
            type="search"
            :value="request.search"
            @input="updateSearch(($event.target as HTMLInputElement).value)" />
          <IssueFilters
            :attributes="data.attributes"
            :loading="filtering"
            :model-value="filterValue"
            @update:model-value="updateFilters({ attributes: $event.attributes })" />
        </template>
        <template #actions>
          <BaseButton
            :aria-label="t('addIssue')"
            icon-on-mobile
            :to="organizationRoutes.newBacklogIssue(spaceKey)"
            variant="primary">
            <IconClipboardPlus />
            <template #label>{{ t('addIssue') }}</template>
          </BaseButton>
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
      <template #default="{ data: page }">
        <section>
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
            :organization-routes="organizationRoutes"
            :page="request.page" />
        </section>
      </template>
    </QueryState>
  </AppPage>
</template>

<script setup lang="ts">
import { IconClipboardPlus, IconListDetails } from '@tabler/icons-vue'
import { debounce } from 'es-toolkit'
import { computed, onScopeDispose, reactive, watch } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import type { IssueFiltersValue } from '#layers/workspace/app/sections/issues/shared/components/IssueFilters/IssueFilters.types'
import IssueFilters from '#layers/workspace/app/sections/issues/shared/components/IssueFilters/IssueFilters.vue'
import IssueList from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.vue'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  withIssueAttributeFilters,
} from '#layers/workspace/app/sections/issues/shared/model/issueAttributeFilters'
import type { BacklogPageDeps } from '#layers/workspace/app/sections/spaces/backlog/BacklogPage.deps'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import { SpaceIcon } from '#layers/workspace/app/shared/constants/icons'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: BacklogPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  organizationRoutes: OrganizationRoutes
  routeQuery: LocationQuery
  spaceKey: string
}>()

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    backlog: 'Backlog',
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
    emptyHint:
      'Бэклог — место, где ждут работы. Сохраняйте здесь идеи и запросы, а затем переносите их на доску, когда команда будет готова.',
    emptyTitle: 'Бэклог пуст',
    loadError: 'Не удалось загрузить бэклог',
    loading: 'Загрузка бэклога…',
    searchIssues: 'Поиск задач',
  },
})

const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(props.routeQuery),
  page: Math.max(1, Number(props.routeQuery.page) || 1),
  search: typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
}))

const { data, message, pending, refresh } = await useApiQuery(
  () => `backlog:${props.spaceKey}`,
  (signal) => props.deps.view({ ...request.value, signal, spaceKey: props.spaceKey }),
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
} = await useApiQuery(
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

// The search results replace the first load's issues once they exist, so they reload too.

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

const refreshPage = () => Promise.all([refresh(), searchResult.value ? runSearch() : undefined])
</script>
