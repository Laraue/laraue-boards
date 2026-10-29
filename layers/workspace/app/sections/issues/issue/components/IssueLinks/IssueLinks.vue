<!-- The issue's links to other issues, grouped by what they mean from this issue's side, with
     "Add link" (fields that open in place) and a remove button for someone who can edit the issue.
     Links change at once, apart from the issue form's Save. -->
<template>
  <section
    v-if="links.length || canEdit"
    :aria-labelledby="headingId"
    class="issue-links">
    <div class="issue-links-heading">
      <h2 :id="headingId">{{ t('links') }}</h2>
      <DocsHelpLink
        :path="['features', 'issue-links']"
        :topic="t('links')" />
    </div>
    <BaseButton
      v-if="canEdit && !state.adding"
      class="issue-links-add"
      size="small"
      variant="ghost"
      @click="openAdding">
      <IconLink />
      {{ t('addLink') }}
    </BaseButton>
    <!-- Inside the issue's form: Enter adds the link instead of saving the issue, and Escape closes. -->
    <div
      v-if="state.adding"
      class="issue-links-new"
      @keydown.enter="addOnEnter"
      @keydown.esc="closeOnEscape">
      <BaseSelect
        v-model="state.relation"
        :aria-label="t('relation')"
        :options="relationOptions" />
      <BaseCombobox
        ref="issueField"
        v-model="state.otherIssueKey"
        v-model:search="state.search"
        :aria-describedby="state.notFoundKey ? notFoundId : undefined"
        :aria-label="t('issueKey')"
        :loading="state.searching"
        :message="suggestionMessage"
        :options="suggestionOptions"
        :placeholder="t('issueKeyPlaceholder')" />
      <p
        v-if="state.notFoundKey || addMessage"
        :id="notFoundId"
        class="form-error issue-links-new-error"
        role="alert">
        {{ state.notFoundKey ? t('notFound', { key: state.notFoundKey }) : addMessage }}
      </p>
      <div class="issue-links-new-actions">
        <BaseButton
          size="small"
          @click="closeAdding">
          {{ t('cancel') }}
        </BaseButton>
        <BaseButton
          :disabled="!state.search.trim()"
          :loading="adding"
          size="small"
          variant="primary"
          @click="add">
          {{ t('add') }}
        </BaseButton>
      </div>
    </div>

    <div
      v-for="group in groups"
      :key="group.relation"
      class="issue-links-group">
      <h3 class="issue-links-group-label">{{ t(group.relation) }}</h3>
      <ul class="issue-links-list">
        <li
          v-for="link in group.links"
          :key="link.issueKey"
          class="issue-links-row">
          <!-- A native title: the narrow column truncates the title and has no room for the status. -->
          <NuxtLink
            class="issue-links-link"
            :title="`${link.issueKey} ${link.title} · ${link.statusLabel || t('backlog')}`"
            :to="organizationRoutes.issue(link.issueKey)">
            <StatusIndicator
              :category="link.statusCategory"
              :color="link.statusColor" />
            <span class="issue-links-key">{{ link.issueKey }}</span>
            <span class="issue-links-title">{{ link.title }}</span>
          </NuxtLink>
          <BaseIconButton
            v-if="canEdit"
            :disabled="removing"
            :label="t('remove', { key: link.issueKey })"
            :tooltip="t('removeTooltip')"
            variant="danger"
            @click="remove(link.issueKey)">
            <IconX />
          </BaseIconButton>
        </li>
      </ul>
    </div>

    <p
      v-if="removeMessage"
      class="form-error"
      role="alert">
      {{ removeMessage }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { IconLink, IconX } from '@tabler/icons-vue'
import { computed, nextTick, onBeforeUnmount, reactive, useId, useTemplateRef, watch } from 'vue'

import { NuxtLink } from '#components'
import { useI18n } from '#layers/core/app/i18n/useI18n'
import BaseButton from '#layers/core/app/ui/components/BaseButton.vue'
import BaseCombobox from '#layers/core/app/ui/components/BaseCombobox.vue'
import BaseIconButton from '#layers/core/app/ui/components/BaseIconButton.vue'
import BaseSelect from '#layers/core/app/ui/components/BaseSelect.vue'
import StatusIndicator from '#layers/workspace/app/sections/boards/shared/components/StatusSelect/StatusIndicator.vue'
import { ISSUE_LINK_RELATIONS } from '#layers/workspace/app/sections/issues/shared/model/IssueLinks.types'
import type {
  IssueLinkRelation,
  IssueLinkViewModel,
} from '#layers/workspace/app/sections/issues/shared/model/IssueLinks.types'
import DocsHelpLink from '#layers/workspace/app/shared/components/DocsHelpLink/DocsHelpLink.vue'
import { useApiAction } from '#layers/workspace/app/shared/composables/useApiAction'
import type { OrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'

import type { IssueLinkCandidate, IssueLinksDeps } from './IssueLinks.deps'

const props = defineProps<{
  canEdit: boolean
  deps: IssueLinksDeps
  issueKey: string
  links: IssueLinkViewModel[]
  onChanged: () => Promise<void> | void
  organizationRoutes: OrganizationRoutes
}>()

const { t } = useI18n({
  en: {
    add: 'Add',
    addLink: 'Add link',
    backlog: 'Backlog',
    blockedBy: 'Blocked by',
    blocks: 'Blocks',
    cancel: 'Cancel',
    duplicatedBy: 'Duplicated by',
    duplicates: 'Duplicates',
    issueKey: 'Issue',
    issueKeyPlaceholder: 'Key or words from the title',
    links: 'Links',
    noSuggestions: 'No issues found',
    notFound: 'No issue {key} that you can see',
    relatesTo: 'Relates to',
    relation: 'Link type',
    remove: 'Remove the link to {key}',
    removeTooltip: 'Remove link',
    searchError: 'Could not search issues',
    searching: 'Searching…',
  },
  ru: {
    add: 'Добавить',
    addLink: 'Добавить связь',
    backlog: 'Бэклог',
    blockedBy: 'Заблокирована',
    blocks: 'Блокирует',
    cancel: 'Отмена',
    duplicatedBy: 'Дублируется',
    duplicates: 'Дублирует',
    issueKey: 'Задача',
    issueKeyPlaceholder: 'Ключ или слова из заголовка',
    links: 'Связи',
    noSuggestions: 'Задачи не найдены',
    notFound: 'Нет доступной вам задачи {key}',
    relatesTo: 'Связана с',
    relation: 'Тип связи',
    remove: 'Удалить связь с {key}',
    removeTooltip: 'Удалить связь',
    searchError: 'Не удалось найти задачи',
    searching: 'Поиск…',
  },
})

const headingId = useId()
const notFoundId = useId()
const issueField = useTemplateRef('issueField')

const state = reactive({
  // The Add link fields are open.
  adding: false,
  // The key typed last time when no such issue was found, shown under the field.
  notFoundKey: '',
  // The picked suggestion's key; '' while only text is typed.
  otherIssueKey: '',
  relation: 'blockedBy' as IssueLinkRelation,
  search: '',
  searchFailed: false,
  searching: false,
  suggestions: [] as IssueLinkCandidate[],
})

const groups = computed(() =>
  ISSUE_LINK_RELATIONS.flatMap((relation) => {
    const links = props.links.filter((link) => link.relation === relation)
    return links.length ? [{ links, relation }] : []
  }),
)

const relationOptions = computed(() =>
  ISSUE_LINK_RELATIONS.map((relation) => ({ label: t(relation), value: relation })),
)

const suggestionOptions = computed(() =>
  state.suggestions.map((issue) => ({
    description: issue.title,
    label: issue.issueKey,
    value: issue.issueKey,
  })),
)

const suggestionMessage = computed(() => {
  if (state.searching) {
    return t('searching')
  }
  if (state.searchFailed) {
    return t('searchError')
  }
  return state.suggestions.length ? undefined : t('noSuggestions')
})

// Waits for a pause in typing, and drops the answer to a search the user has typed past.
const SEARCH_DELAY_MS = 250
let searchTimer: ReturnType<typeof setTimeout> | undefined
let searchAbort: AbortController | undefined

const searchIssues = async (search: string) => {
  searchAbort?.abort()
  const abort = new AbortController()
  searchAbort = abort
  try {
    const result = await props.deps.searchIssues({ search, signal: abort.signal })
    // The issue itself is no link target.
    state.suggestions =
      result.outcome === 'found'
        ? result.issues.filter((issue) => issue.issueKey !== props.issueKey)
        : []
    state.searchFailed = result.outcome === 'failed'
  } catch (error) {
    // A search the user typed past was aborted on purpose.
    if (!abort.signal.aborted) {
      throw error
    }
  } finally {
    if (searchAbort === abort) {
      state.searching = false
    }
  }
}

watch(
  () => state.search,
  (search) => {
    clearTimeout(searchTimer)
    state.notFoundKey = ''
    // Picking a suggestion puts its key in the field; that needs no new search.
    if (!search.trim() || search === state.otherIssueKey) {
      searchAbort?.abort()
      state.searching = false
      return
    }
    state.searching = true
    searchTimer = setTimeout(() => void searchIssues(search.trim()), SEARCH_DELAY_MS)
  },
)

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  searchAbort?.abort()
})

const { execute: executeAdd, message: addMessage, pending: adding } = useApiAction(props.deps.add)
const {
  execute: executeRemove,
  message: removeMessage,
  pending: removing,
} = useApiAction(props.deps.remove)

const openAdding = async () => {
  Object.assign(state, {
    adding: true,
    notFoundKey: '',
    otherIssueKey: '',
    search: '',
    suggestions: [],
  })
  await nextTick()
  issueField.value?.focus()
}

const closeAdding = () => {
  state.adding = false
}

// Escape first closes an open suggestion list or select (they handle it); then the fields.
const closeOnEscape = (event: KeyboardEvent) => {
  if (!event.defaultPrevented) {
    closeAdding()
  }
}

// Enter on a highlighted suggestion picks it (the combobox handles that); otherwise it adds the link.
const addOnEnter = (event: KeyboardEvent) => {
  if (event.defaultPrevented) {
    return
  }
  event.preventDefault()
  void add()
}

const add = async () => {
  // A key typed in full works without picking it from the suggestions.
  const otherIssueKey = (state.otherIssueKey || state.search).trim().toUpperCase()
  if (!otherIssueKey || adding.value) {
    return
  }
  const result = await executeAdd({
    issueKey: props.issueKey,
    otherIssueKey,
    relation: state.relation,
  })
  if (!result) {
    return
  }
  if (result.value.outcome === 'notFound') {
    state.notFoundKey = otherIssueKey
    return
  }
  state.adding = false
  await props.onChanged()
}

const remove = async (otherIssueKey: string) => {
  if (await executeRemove({ issueKey: props.issueKey, otherIssueKey })) {
    await props.onChanged()
  }
}
</script>

<style scoped>
.issue-links {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

/* The same heading as Properties above it, with the help link beside it. */
.issue-links-heading {
  align-items: center;
  display: flex;
  gap: var(--space-1);
}

.issue-links h2 {
  font-size: inherit;
  margin: 0;
}

/* A row under the heading, as the first property is under Properties. */
.issue-links-add {
  justify-self: start;
}

.issue-links-new {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.issue-links-new-error {
  margin: 0;
}

.issue-links-new-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.issue-links-group {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.issue-links-group-label {
  color: var(--color-muted);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.issue-links-list {
  display: grid;
  list-style: none;
  margin: 0;
  padding: 0;
}

.issue-links-row {
  align-items: center;
  display: flex;
  gap: var(--space-2);
  min-height: var(--control-height);
  min-width: 0;
}

.issue-links-link {
  align-items: center;
  border-radius: var(--radius-control);
  color: inherit;
  display: flex;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
  padding: var(--space-1) var(--space-2);
  text-decoration: none;
}

.issue-links-link:focus-visible {
  box-shadow: var(--shadow-focus);
  outline: none;
}

.issue-links-key {
  color: var(--color-muted);
  flex: none;
}

.issue-links-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (hover: hover) and (pointer: fine) {
  .issue-links-link:hover {
    background: var(--color-row-hover);
  }
}
</style>
