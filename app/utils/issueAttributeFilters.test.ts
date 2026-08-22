import { assert, test } from 'vitest'

import {
  getIssueAttributeFilterInput,
  normalizeIssueAttributeFilters,
  readIssueAttributeQuery,
  readIssueSpaceQuery,
  withIssueAttributeFilters,
} from '~/utils/issueAttributeFilters'

const attributes = [
  { id: '1', type: 'text' as const },
  {
    id: '2',
    options: [{ value: '3' }, { value: '4' }],
    type: 'list' as const,
  },
  { id: '3', type: 'integer' as const },
  { id: '4', type: 'dateTime' as const },
]

test('maps issue filters between URL and action input', () => {
  const raw = readIssueAttributeQuery({
    'attribute.1': ' ABC ',
    'attribute.2': ['3', '4', '99'],
    'attribute.3': ['', '10'],
    'attribute.4': ['2026-08-01T09:00', '2026-08-22T18:00'],
    'attribute.99': 'stale',
    page: '3',
  })
  const values = normalizeIssueAttributeFilters(raw, attributes)

  assert.deepEqual(values, {
    1: 'ABC',
    2: ['3', '4'],
    3: ['', '10'],
    4: ['2026-08-01T09:00', '2026-08-22T18:00'],
  })
  assert.deepEqual(getIssueAttributeFilterInput(values, attributes), [
    { attributeId: '1', searchString: 'ABC', type: 'text' },
    { attributeId: '2', type: 'list', valueIds: ['3', '4'] },
    { attributeId: '3', to: '10', type: 'integer' },
    {
      attributeId: '4',
      from: '2026-08-01T09:00',
      to: '2026-08-22T18:00',
      type: 'dateTime',
    },
  ])
  assert.deepEqual(withIssueAttributeFilters({ page: '3', search: 'x' }, values, attributes), {
    'attribute.1': 'ABC',
    'attribute.2': ['3', '4'],
    'attribute.3': ['', '10'],
    'attribute.4': ['2026-08-01T09:00', '2026-08-22T18:00'],
    search: 'x',
  })
  assert.deepEqual(readIssueSpaceQuery(['10', '20', null, '10']), ['10', '20'])
})
