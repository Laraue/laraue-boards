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
            label: 'Status',
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
