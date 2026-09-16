<template>
  <section
    :aria-label="label ?? t('history')"
    class="issue-history">
    <div
      v-if="groups.length"
      class="history-list">
      <article
        v-for="(item, index) in localizedGroups"
        :key="`${item.createdAt}-${index}`"
        class="history-item">
        <span
          class="avatar"
          :style="{ background: item.owner.color }">
          {{ item.owner.initials }}
        </span>
        <div class="history-content">
          <div class="history-head">
            <strong>{{ item.owner.name }}</strong>
            <NuxtLink
              v-if="item.link"
              :to="item.link.to">
              {{ item.link.label }}
            </NuxtLink>
            <time
              :datetime="item.createdAt"
              :title="formatDate(item.createdAt)">
              {{ formatTime(item.createdAt) }}
            </time>
          </div>
          <div class="history-changes">
            <div
              v-for="(change, changeIndex) in item.changes"
              :key="changeIndex"
              class="history-change"
              :class="{ 'history-change--description': change.kind === 'description' }">
              <HistoryDescriptionChange
                v-if="change.kind === 'description'"
                :change="change" />
              <HistoryEventChange
                v-else-if="change.kind === 'event'"
                :change="change" />
              <HistoryAttachmentChange
                v-else-if="change.kind === 'attachment'"
                :change="change" />
              <HistoryAssigneeChange
                v-else-if="change.kind === 'assignee'"
                :change="change" />
              <HistoryBoardChange
                v-else-if="change.kind === 'board'"
                :change="change" />
              <HistoryPropertyChange
                v-else-if="change.kind === 'property'"
                :change="change" />
              <HistorySpaceChange
                v-else-if="change.kind === 'space'"
                :change="change" />
              <HistoryStatusChange
                v-else-if="change.kind === 'status'"
                :change="change" />
            </div>
          </div>
        </div>
      </article>
    </div>
    <p
      v-else
      class="history-empty">
      {{ t('empty') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import HistoryAssigneeChange from './components/HistoryAssigneeChange.vue'
import HistoryAttachmentChange from './components/HistoryAttachmentChange.vue'
import HistoryBoardChange from './components/HistoryBoardChange.vue'
import HistoryDescriptionChange from './components/HistoryDescriptionChange.vue'
import HistoryEventChange from './components/HistoryEventChange.vue'
import HistoryPropertyChange from './components/HistoryPropertyChange.vue'
import HistorySpaceChange from './components/HistorySpaceChange.vue'
import HistoryStatusChange from './components/HistoryStatusChange.vue'
import type { HistoryItemViewModel } from './HistoryTimeline.types'

const props = defineProps<{
  items: HistoryItemViewModel[]
  label?: string
}>()

const { locale, t } = useI18n({
  en: {
    active: 'Active',
    assignee: 'Assignee',
    attachment: 'Attachment',
    board: 'Board',
    comment: 'Comment',
    created: 'created',
    deleted: 'deleted',
    description: 'Description',
    done: 'Done',
    empty: 'No changes yet.',
    history: 'History',
    inProgress: 'Active',
    issue: 'Issue',
    new: 'New',
    none: 'None',
    open: 'Open',
    organization: 'Organization',
    removedAttachment: 'Removed attachment',
    retro: 'Retro',
    space: 'Space',
    status: 'Status',
    untitledFile: 'Untitled file',
    updated: 'updated',
  },
  ru: {
    active: 'Активна',
    assignee: 'Ответственный',
    attachment: 'Вложение',
    board: 'Доска',
    comment: 'Комментарий',
    created: 'создан',
    deleted: 'удалён',
    description: 'Описание',
    done: 'Выполнена',
    empty: 'Изменений пока нет.',
    history: 'История',
    inProgress: 'В работе',
    issue: 'Задача',
    new: 'Новая',
    none: 'Нет',
    open: 'Открыть',
    organization: 'Организация',
    removedAttachment: 'Вложение удалено',
    retro: 'Ретроспектива',
    space: 'Раздел',
    status: 'Статус',
    untitledFile: 'Файл без названия',
    updated: 'изменён',
  },
})

const dateTimeFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }),
)

const timeFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
      timeStyle: 'short',
      timeZone: 'UTC',
    }),
)

const utc = (date: string) => new Date(date).toISOString()

// Entries written by one save land in the same minute — show them as a single event.
const groups = computed(() =>
  props.items.reduce<HistoryItemViewModel[]>((result, item) => {
    const last = result.at(-1)

    if (
      last &&
      last.owner.name === item.owner.name &&
      last.issueKey === item.issueKey &&
      utc(last.createdAt).slice(0, 16) === utc(item.createdAt).slice(0, 16)
    ) {
      last.changes = [...last.changes, ...item.changes]

      return result
    }

    return [...result, { ...item, changes: [...item.changes] }]
  }, []),
)

const formatDate = (date: string) => dateTimeFormatter.value.format(new Date(date))

const formatTime = (date: string) =>
  utc(date).slice(0, 10) === new Date().toISOString().slice(0, 10)
    ? timeFormatter.value.format(new Date(date))
    : dateTimeFormatter.value.format(new Date(date))

const translateValue = (value: string) =>
  ({
    Active: t('active'),
    Done: t('done'),
    New: t('new'),
    None: t('none'),
    'Untitled file': t('untitledFile'),
  })[value] ?? value

const translateLabel = (label: string) => {
  const direct = {
    Assignee: t('assignee'),
    Attachment: t('attachment'),
    Board: t('board'),
    Description: t('description'),
    'Removed attachment': t('removedAttachment'),
    Space: t('space'),
    Status: t('status'),
  }[label]

  if (direct) {
    return direct
  }

  const action = /^(Comment|Issue|Organization|Retro|Space|Board) (created|deleted|updated)$/.exec(
    label,
  )

  if (!action) {
    return label
  }

  const entity = {
    Board: t('board'),
    Comment: t('comment'),
    Issue: t('issue'),
    Organization: t('organization'),
    Retro: t('retro'),
    Space: t('space'),
  }[action[1] as 'Board' | 'Comment' | 'Issue' | 'Organization' | 'Retro' | 'Space']
  const verb = {
    created: t('created'),
    deleted: t('deleted'),
    updated: t('updated'),
  }[action[2] as 'created' | 'deleted' | 'updated']

  return `${entity} ${verb}`
}

const localizedGroups = computed(() =>
  groups.value.map((item) => ({
    ...item,
    changes: item.changes.map((change) => ({
      ...change,
      label: translateLabel(change.label),
      ...('newValue' in change ? { newValue: translateValue(change.newValue) } : {}),
      ...('oldValue' in change ? { oldValue: translateValue(change.oldValue) } : {}),
    })),
  })),
)
</script>

<style scoped>
.issue-history {
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-1);
}

.history-list {
  display: grid;
}

.history-item {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: auto minmax(0, 1fr);
  padding-bottom: var(--space-5);
  position: relative;
}

.history-item:not(:last-child)::before {
  background: var(--color-border);
  bottom: 4px;
  content: '';
  left: 14px;
  position: absolute;
  top: 32px;
  width: 1px;
}

.history-item > .avatar {
  font-size: var(--font-size-caption);
  height: 28px;
  position: relative;
  width: 28px;
  z-index: 1;
}

.history-content {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
}

.history-changes {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.history-head {
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.history-head time {
  color: var(--color-muted);
  font-size: var(--font-size-small);
}

.history-change {
  align-items: center;
  color: var(--color-muted);
  display: flex;
  gap: var(--space-2);
  min-width: 0;
}

.history-change--description {
  display: block;
}

:deep(.history-value-change) {
  align-items: center;
  display: flex;
  flex: 1;
  gap: var(--space-2);
  min-width: 0;
}

:deep(.history-value-change > span) {
  align-items: center;
  display: flex;
  gap: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.history-value-change svg) {
  flex: 0 0 auto;
  height: 14px;
  width: 14px;
}

:deep(.history-value-change i) {
  border-radius: 50%;
  flex: 0 0 auto;
  height: 8px;
  width: 8px;
}

:deep(.history-value-change .avatar) {
  font-size: 9px;
  height: 20px;
  width: 20px;
}

:deep(.history-new-value) {
  color: var(--color-text);
}

.history-empty {
  color: var(--color-muted);
  margin: var(--space-5) 0;
  text-align: center;
}
</style>
