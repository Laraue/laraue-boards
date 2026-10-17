<!-- The issue's links to other issues, grouped by what they mean from this issue's side, with
     "Add link" and a remove button for someone who can edit the issue. Links change at once, apart
     from the issue form's Save. -->
<template>
  <section
    v-if="links.length || canEdit"
    :aria-labelledby="headingId"
    class="issue-links">
    <h2 :id="headingId">{{ t('links') }}</h2>
    <BaseButton
      v-if="canEdit"
      class="issue-links-add"
      size="small"
      variant="ghost"
      @click="openDialog">
      <IconLink />
      {{ t('addLink') }}
    </BaseButton>

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

    <BaseDialog
      ref="dialog"
      :close-label="t('close')"
      :title="t('addLink')"
      @submit="add">
      <BaseFieldGroup>
        <BaseField
          v-slot="{ id }"
          :label="t('relation')">
          <BaseSelect
            :id="id"
            v-model="state.relation"
            :options="relationOptions" />
        </BaseField>
        <BaseField
          v-slot="{ id, describedby }"
          :error="state.notFoundKey ? t('notFound', { key: state.notFoundKey }) : undefined"
          :label="t('issueKey')">
          <BaseInput
            :id="id"
            v-model="state.otherIssueKey"
            :aria-describedby="describedby"
            autocomplete="off"
            :placeholder="t('issueKeyPlaceholder')"
            required />
        </BaseField>
      </BaseFieldGroup>
      <p
        v-if="addMessage"
        class="form-error">
        {{ addMessage }}
      </p>
      <template #actions>
        <BaseButton @click="dialog?.close()">{{ t('cancel') }}</BaseButton>
        <BaseButton
          :loading="adding"
          type="submit"
          variant="primary">
          {{ t('add') }}
        </BaseButton>
      </template>
    </BaseDialog>
  </section>
</template>

<script setup lang="ts">
import { IconLink, IconX } from '@tabler/icons-vue'

import StatusIndicator from '~/components/status-select/StatusIndicator.vue'

import type { IssueLinksDeps } from './IssueLinks.deps'
import { ISSUE_LINK_RELATIONS } from './IssueLinks.types'
import type { IssueLinkRelation, IssueLinkViewModel } from './IssueLinks.types'

const props = defineProps<{
  canEdit: boolean
  deps: IssueLinksDeps
  issueKey: string
  links: IssueLinkViewModel[]
  onChanged: () => Promise<void> | void
}>()

const { t } = useI18n({
  en: {
    add: 'Add',
    addLink: 'Add link',
    backlog: 'Backlog',
    blockedBy: 'Blocked by',
    blocks: 'Blocks',
    cancel: 'Cancel',
    close: 'Close',
    duplicatedBy: 'Duplicated by',
    duplicates: 'Duplicates',
    issueKey: 'Issue',
    issueKeyPlaceholder: 'For example, BRD-12',
    links: 'Links',
    notFound: 'No issue {key} that you can see',
    relatesTo: 'Relates to',
    relation: 'This issue',
    remove: 'Remove the link to {key}',
    removeTooltip: 'Remove link',
  },
  ru: {
    add: 'Добавить',
    addLink: 'Добавить связь',
    backlog: 'Бэклог',
    blockedBy: 'Заблокирована',
    blocks: 'Блокирует',
    cancel: 'Отмена',
    close: 'Закрыть',
    duplicatedBy: 'Дублируется',
    duplicates: 'Дублирует',
    issueKey: 'Задача',
    issueKeyPlaceholder: 'Например, BRD-12',
    links: 'Связи',
    notFound: 'Нет доступной вам задачи {key}',
    relatesTo: 'Связана с',
    relation: 'Эта задача',
    remove: 'Удалить связь с {key}',
    removeTooltip: 'Удалить связь',
  },
})

const organizationRoutes = useOrganizationRoutes()
const headingId = useId()
const dialog = useTemplateRef('dialog')

const state = reactive({
  // The key typed last time when no such issue was found, shown under the field.
  notFoundKey: '',
  otherIssueKey: '',
  relation: 'blockedBy' as IssueLinkRelation,
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

const { execute: executeAdd, message: addMessage, pending: adding } = useApiAction(props.deps.add)
const {
  execute: executeRemove,
  message: removeMessage,
  pending: removing,
} = useApiAction(props.deps.remove)

const openDialog = () => {
  state.notFoundKey = ''
  state.otherIssueKey = ''
  dialog.value?.open()
}

const add = async () => {
  const otherIssueKey = state.otherIssueKey.trim().toUpperCase()
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
  dialog.value?.close()
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

/* The same heading as Properties above it. */
.issue-links h2 {
  font-size: inherit;
  margin: 0;
}

/* A row under the heading, as the first property is under Properties. */
.issue-links-add {
  justify-self: start;
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
