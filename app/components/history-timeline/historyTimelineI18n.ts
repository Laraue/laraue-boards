import type { HistoryChangeViewModel } from './HistoryTimeline.types'

export const historyMessages = {
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
    issue: 'Issue',
    new: 'New',
    none: 'None',
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
    issue: 'Задача',
    new: 'Новая',
    none: 'Нет',
    organization: 'Организация',
    removedAttachment: 'Вложение удалено',
    retro: 'Ретроспектива',
    space: 'Раздел',
    status: 'Статус',
    untitledFile: 'Файл без названия',
    updated: 'изменён',
  },
} as const

type HistoryMessageKey = keyof typeof historyMessages.en
type TranslateHistory = (key: HistoryMessageKey) => string

const HISTORY_TEXT_KEYS: Record<string, HistoryMessageKey> = {
  Active: 'active',
  Assignee: 'assignee',
  Attachment: 'attachment',
  Board: 'board',
  Comment: 'comment',
  Description: 'description',
  Done: 'done',
  Issue: 'issue',
  New: 'new',
  None: 'none',
  Organization: 'organization',
  'Removed attachment': 'removedAttachment',
  Retro: 'retro',
  Space: 'space',
  Status: 'status',
  'Untitled file': 'untitledFile',
}

const HISTORY_ACTIONS: Record<string, HistoryMessageKey> = {
  created: 'created',
  deleted: 'deleted',
  updated: 'updated',
}

export const translateHistoryText = (value: string, t: TranslateHistory): string => {
  const key = HISTORY_TEXT_KEYS[value]

  if (key) {
    return t(key)
  }

  const [entity, action, extra] = value.split(' ')

  if (extra) {
    return value
  }

  const entityKey = entity ? HISTORY_TEXT_KEYS[entity] : undefined
  const actionKey = action ? HISTORY_ACTIONS[action] : undefined

  return entityKey && actionKey ? `${t(entityKey)} ${t(actionKey)}` : value
}

export const translateHistoryChange = (
  change: HistoryChangeViewModel,
  t: TranslateHistory,
): HistoryChangeViewModel => {
  const label = translateHistoryText(change.label, t)

  if (change.kind === 'assignee') {
    return { ...change, label }
  }

  if ('oldValue' in change) {
    return {
      ...change,
      label,
      newValue: translateHistoryText(change.newValue, t),
      oldValue: translateHistoryText(change.oldValue, t),
    }
  }

  if ('newValue' in change) {
    return { ...change, label, newValue: translateHistoryText(change.newValue, t) }
  }

  return { ...change, label }
}
