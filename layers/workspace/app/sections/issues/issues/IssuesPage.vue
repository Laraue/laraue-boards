<template>
  <AppPage>
    <template #header>
      <PageHeader
        :icon="IconClipboardList"
        :on-refresh="refreshPage"
        :title="t('allIssues')">
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
            :epic-statuses="epicStatusOptions"
            :loading="filtering"
            :model-value="filterValue"
            :spaces="data.spaces"
            @update:model-value="
              updateFilters({
                attributes: $event.attributes,
                epicStatuses: $event.epicStatuses ?? [],
                spaceIds: $event.spaceIds ?? [],
              })
            " />
        </template>
        <template
          v-if="data"
          #actions>
          <BaseButton
            v-if="data.spaces.length"
            :aria-label="t('addIssue')"
            icon-on-mobile
            :to="organizationRoutes.newIssue()"
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
      <template #default>
        <section
          ref="pageElement"
          class="issues-page">
          <p
            v-if="searchMessage"
            class="form-error">
            {{ searchMessage }}
          </p>
          <IssueList
            :deps="deps.issueList"
            :empty-hint="t('emptyHint')"
            :empty-text="t('emptyTitle')"
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
import { IconClipboardList, IconClipboardPlus } from '@tabler/icons-vue'
import { debounce } from 'es-toolkit'
import { computed, onScopeDispose, reactive, useTemplateRef, watch } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import type { IssuesPageDeps } from '#layers/workspace/app/sections/issues/issues/IssuesPage.deps'
import {
  issueBoardStatuses,
  type IssueBoardStatus,
} from '#layers/workspace/app/sections/issues/issues/IssuesPage.deps'
import type { IssueFiltersValue } from '#layers/workspace/app/sections/issues/shared/components/IssueFilters/IssueFilters.types'
import IssueFilters from '#layers/workspace/app/sections/issues/shared/components/IssueFilters/IssueFilters.vue'
import IssueList from '#layers/workspace/app/sections/issues/shared/components/IssueList/IssueList.vue'
import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '#layers/workspace/app/sections/issues/shared/model/issueAttributeFilters'
import AppPage from '#layers/workspace/app/shared/components/AppPage.vue'
import PageHeader from '#layers/workspace/app/shared/components/PageHeader.vue'
import QueryState from '#layers/workspace/app/shared/components/QueryState.vue'
import { useApiQuery } from '#layers/workspace/app/shared/composables/useApiQuery'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

const props = defineProps<{
  deps: IssuesPageDeps
  onUpdateQuery: (query: LocationQueryRaw) => Promise<void> | void
  organizationKey: string
  organizationRoutes: OrganizationRoutes
  routeQuery: LocationQuery
}>()

const { t } = useI18n({
  en: {
    addIssue: 'Add issue',
    allIssues: 'All issues',
    done: 'Done',
    emptyHint:
      'An issue is one piece of work — a task, a bug, an idea. It lives in a space, sits in a board column that shows its status, and can be assigned to someone. Add the first one with Add issue, or forward a message to @msgboard_bot in Telegram.',
    emptyTitle: 'No issues yet',
    inProgress: 'In progress',
    loadError: 'Could not load issues',
    loading: 'Loading issues…',
    new: 'New',
    searchIssues: 'Search issues',
  },
  ru: {
    addIssue: 'Добавить задачу',
    allIssues: 'Все задачи',
    done: 'Готово',
    emptyHint:
      'Задача — это отдельная работа: задача, ошибка или идея. Она находится в пространстве и колонке доски со своим статусом, а также может быть назначена исполнителю. Добавьте первую кнопкой «Добавить задачу» или перешлите сообщение боту @msgboard_bot в Telegram.',
    emptyTitle: 'Задач пока нет',
    inProgress: 'В работе',
    loadError: 'Не удалось загрузить задачи',
    loading: 'Загрузка задач…',
    new: 'Новая',
    searchIssues: 'Поиск задач',
  },
})

const pageElement = useTemplateRef('pageElement')
const epicStatusOptions: Array<{ label: string; value: IssueBoardStatus }> = [
  { label: t('new'), value: 'New' },
  { label: t('inProgress'), value: 'Active' },
  { label: t('done'), value: 'Done' },
]

const request = computed(() => ({
  attributeQuery: readIssueAttributeQuery(props.routeQuery),
  epicStatuses: issueBoardStatuses.filter((status) =>
    [props.routeQuery.epicStatus].flat().includes(status),
  ),
  page: Math.max(1, Number(props.routeQuery.page) || 1),
  search: typeof props.routeQuery.search === 'string' ? props.routeQuery.search : '',
  spaceIds: readIssueSpaceQuery(props.routeQuery.space),
}))

const { data, message, pending, refresh } = await useApiQuery(
  () => `issues:${props.organizationKey}`,
  (signal) => props.deps.view({ ...request.value, signal }),
)

const attributes = computed(() => data.value?.attributes ?? [])
const attributeFilters = computed(() =>
  normalizeIssueAttributeFilters(request.value.attributeQuery, attributes.value),
)
const filterValue = computed<IssueFiltersValue>(() => ({
  attributes: attributeFilters.value,
  epicStatuses: request.value.epicStatuses,
  spaceIds: request.value.spaceIds,
}))

const {
  clear: clearSearch,
  data: searchResult,
  execute: runSearch,
  message: searchMessage,
  pending: searching,
} = await useApiQuery(
  () => `issues-search:${props.organizationKey}`,
  () =>
    props.deps.searchIssues({
      epicStatuses: request.value.epicStatuses,
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

// The search results replace the first load's issues once they exist, so they reload too.

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
  if (value.epicStatuses.length) {
    nextQuery.epicStatus = value.epicStatuses
  } else {
    delete nextQuery.epicStatus
  }
  void props.onUpdateQuery(nextQuery)
}

const updatePage = async (value: number) => {
  const nextQuery: LocationQueryRaw = { ...props.routeQuery }
  if (value > 1) {
    nextQuery.page = String(value)
  } else {
    delete nextQuery.page
  }
  await props.onUpdateQuery(nextQuery)
  pageElement.value?.closest('main')?.scrollTo({ top: 0 })
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

const refreshPage = () => Promise.all([refresh(), searchResult.value ? runSearch() : undefined])
</script>
