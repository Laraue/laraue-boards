import { assert, test } from 'vitest'

import { getIssueAttributeValueInput } from '~/utils/issueAttributeValues'

test('maps edited issue attribute values to action input', () => {
  assert.deepEqual(
    getIssueAttributeValueInput(
      {
        1: ' ABC ',
        2: '3',
        3: '42',
        4: '2026-08-22T12:30',
        5: '12.5',
        6: '2026-08-23',
        99: 'stale',
      },
      [
        { id: '1', type: 'text' },
        { id: '2', type: 'list' },
        { id: '3', type: 'integer' },
        { id: '4', type: 'dateTime' },
        { id: '5', type: 'decimal' },
        { id: '6', type: 'date' },
      ],
    ),
    [
      { attributeId: '1', type: 'text', value: 'ABC' },
      { attributeId: '2', type: 'list', valueId: '3' },
      { attributeId: '3', type: 'integer', value: '42' },
      { attributeId: '4', type: 'dateTime', value: '2026-08-22T12:30' },
      { attributeId: '5', type: 'decimal', value: '12.5' },
      { attributeId: '6', type: 'date', value: '2026-08-23' },
    ],
  )
})
