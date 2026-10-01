import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect, it } from 'vitest'

import HistoryTimeline from './HistoryTimeline.vue'

it('keeps different issues in separate history entries', async () => {
  const wrapper = await mountSuspended(HistoryTimeline, {
    props: {
      items: ['BRD-17', 'BRD-1'].map((issueKey) => ({
        changes: [
          {
            kind: 'status' as const,
            newColor: null,
            newValue: 'New',
            oldColor: null,
            oldValue: 'Done',
          },
        ],
        createdAt: '2026-08-04T10:56:20Z',
        issueKey,
        link: { label: issueKey, to: `/issues/${issueKey}` },
        owner: { color: '#4774d4', initials: 'WI', name: 'win7user10' },
      })),
    },
  })

  expect(wrapper.findAll('.history-item')).toHaveLength(2)
})

const statusChange = {
  kind: 'status' as const,
  label: 'Status',
  newColor: null,
  newValue: 'Done',
  oldColor: null,
  oldValue: 'New',
}

it('shows the API key a change was made with', async () => {
  const wrapper = await mountSuspended(HistoryTimeline, {
    props: {
      items: [
        {
          changes: [statusChange],
          createdAt: '2026-08-04T10:56:20Z',
          owner: { apiKeyName: 'Claude', color: '#4774d4', initials: 'WI', name: 'win7user10' },
        },
      ],
    },
  })

  expect(wrapper.find('.history-avatar').attributes('title')).toBe('win7user10 via API key Claude')
  expect(wrapper.find('.history-avatar-key').exists()).toBe(true)
})

it('keeps changes made in the app and through an API key in separate entries', async () => {
  const wrapper = await mountSuspended(HistoryTimeline, {
    props: {
      items: [
        {
          changes: [statusChange],
          createdAt: '2026-08-04T10:56:20Z',
          owner: { color: '#4774d4', initials: 'WI', name: 'win7user10' },
        },
        {
          changes: [statusChange],
          createdAt: '2026-08-04T10:56:40Z',
          owner: { apiKeyName: 'Claude', color: '#4774d4', initials: 'WI', name: 'win7user10' },
        },
      ],
    },
  })

  expect(wrapper.findAll('.history-item')).toHaveLength(2)
})

it('groups entries by the day they were made on', async () => {
  const wrapper = await mountSuspended(HistoryTimeline, {
    props: {
      items: [
        {
          changes: [statusChange],
          createdAt: '2026-08-06T10:30:00Z',
          owner: { color: '#4774d4', initials: 'AL', name: 'Ada Lovelace' },
        },
        {
          changes: [statusChange],
          createdAt: '2026-08-06T10:20:00Z',
          owner: { color: '#d65f63', initials: 'GH', name: 'Grace Hopper' },
        },
        {
          changes: [statusChange],
          createdAt: '2026-08-04T10:20:00Z',
          owner: { color: '#4774d4', initials: 'AL', name: 'Ada Lovelace' },
        },
      ],
    },
  })

  const days = wrapper.findAll('.history-day')
  expect(days).toHaveLength(2)
  expect(days[0]!.findAll('.history-item')).toHaveLength(2)
  expect(days[1]!.findAll('.history-item')).toHaveLength(1)
  expect(wrapper.findAll('.history-day-label')).toHaveLength(2)
})

it('labels the last two days as today and yesterday', async () => {
  const now = new Date()
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12)
  const wrapper = await mountSuspended(HistoryTimeline, {
    props: {
      items: [now, yesterday].map((date) => ({
        changes: [statusChange],
        createdAt: date.toISOString(),
        owner: { color: '#4774d4', initials: 'AL', name: 'Ada Lovelace' },
      })),
    },
  })

  expect(wrapper.findAll('.history-day-label').map((label) => label.text())).toEqual([
    'Today',
    'Yesterday',
  ])
})

it('marks a deleted issue with an icon and a struck-through title and keeps the issue deleted line', async () => {
  const wrapper = await mountSuspended(HistoryTimeline, {
    props: {
      items: [
        {
          changes: [
            { action: 'Delete' as const, entityType: 'Issue' as const, kind: 'event' as const },
            { action: 'Create' as const, entityType: 'Comment' as const, kind: 'event' as const },
          ],
          createdAt: '2026-08-04T10:56:20Z',
          issueKey: 'BRD-205',
          issueTitle: 'Show issue text first row in History',
          link: { label: 'BRD-205', to: '/issues/BRD-205' },
          owner: { color: '#4774d4', initials: 'AL', name: 'Ada Lovelace' },
        },
      ],
    },
  })

  expect(wrapper.find('.history-head--deleted').exists()).toBe(true)
  expect(wrapper.find('.history-deleted-icon').attributes('aria-label')).toBe('Issue deleted')
  expect(wrapper.find('.history-changes').text()).toContain('Issue deleted')
  expect(wrapper.find('.history-changes').text()).toContain('Comment added')
})
