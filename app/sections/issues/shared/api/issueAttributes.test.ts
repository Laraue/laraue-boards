import { assert, test } from 'vitest'

import { COLORS } from '~/constants/colors'
import {
  type IssueAttributeDto,
  mapIssueAttributes,
  mapIssueAttributeValues,
  mapIssueFilters,
  mapRawIssueFilters,
} from '~/sections/issues/shared/api/issueAttributes'

import { toLocalIssueDateTime, toUtcIssueDateTime } from './issueDateTime'

const attributeDtos: IssueAttributeDto[] = [
  { color: COLORS.gray, id: 1, listValues: [], name: 'Reference', type: 'Text' },
  {
    color: COLORS.amber,
    id: 2,
    listValues: [
      { id: 3, name: 'High' },
      { id: 4, name: 'Low' },
    ],
    name: 'Priority',
    type: 'List',
  },
  { color: COLORS.blue, id: 5, listValues: [], name: 'Estimate', type: 'Integer' },
  { color: COLORS.green, id: 6, listValues: [], name: 'Cost', type: 'Decimal' },
  { color: COLORS.red, id: 7, listValues: [], name: 'Due', type: 'Date' },
  { color: COLORS.purple, id: 8, listValues: [], name: 'Starts', type: 'DateTime' },
]

test('maps issue attributes, filters, and values to API models', () => {
  const utcDateTime = new Date('2026-08-22T12:30').toISOString()

  assert.deepEqual(mapIssueAttributes(attributeDtos), [
    { color: COLORS.gray, id: '1', name: 'Reference', type: 'text' },
    {
      color: COLORS.amber,
      id: '2',
      name: 'Priority',
      options: [
        { label: 'High', value: '3' },
        { label: 'Low', value: '4' },
      ],
      type: 'list',
    },
    { color: COLORS.blue, id: '5', name: 'Estimate', type: 'integer' },
    { color: COLORS.green, id: '6', name: 'Cost', type: 'decimal' },
    { color: COLORS.red, id: '7', name: 'Due', type: 'date' },
    { color: COLORS.purple, id: '8', name: 'Starts', type: 'dateTime' },
  ])
  assert.deepEqual(
    mapIssueFilters([
      { attributeId: '1', searchString: 'ABC', type: 'text' },
      { attributeId: '2', type: 'list', valueIds: ['3', '4'] },
      { attributeId: '5', from: '1', to: '10', type: 'integer' },
      { attributeId: '6', from: '1.5', to: '9.5', type: 'decimal' },
      { attributeId: '7', from: '2026-08-01', to: '2026-08-31', type: 'date' },
      { attributeId: '8', from: '2026-08-22T12:30', type: 'dateTime' },
    ]),
    {
      1: { $type: 'string', searchString: 'ABC' },
      2: { $type: 'enum', ids: ['3', '4'] },
      5: { $type: 'integer', max: '10', min: '1' },
      6: { $type: 'decimal', max: '9.5', min: '1.5' },
      7: { $type: 'date', from: '2026-08-01', to: '2026-08-31' },
      8: { $type: 'datetime', from: utcDateTime, to: undefined },
    },
  )
  assert.deepEqual(mapRawIssueFilters({ 1: ['ABC'], 2: ['3', '4', '99'] }, attributeDtos).filters, {
    1: { $type: 'string', searchString: 'ABC' },
    2: { $type: 'enum', ids: ['3', '4'] },
  })
  assert.deepEqual(
    mapIssueAttributeValues([
      { attributeId: '1', type: 'text', value: 'ABC' },
      { attributeId: '2', type: 'list', valueId: '3' },
      { attributeId: '6', type: 'decimal', value: '12.5' },
      { attributeId: '5', type: 'integer', value: '42' },
      { attributeId: '7', type: 'date', value: '2026-08-23' },
      { attributeId: '8', type: 'dateTime', value: '2026-08-22T12:30' },
    ]),
    [
      { $type: 'string', attributeId: '1', value: 'ABC' },
      { $type: 'enum', attributeId: '2', valueId: '3' },
      { $type: 'decimal', attributeId: '6', value: '12.5' },
      { $type: 'integer', attributeId: '5', value: '42' },
      { $type: 'date', attributeId: '7', value: '2026-08-23' },
      { $type: 'datetime', attributeId: '8', value: utcDateTime },
    ],
  )
})

test('converts issue date-times between client time and UTC', () => {
  const utc = '2026-01-22T12:30:00.000Z'
  const local = toLocalIssueDateTime(utc)

  assert.match(local, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  assert.equal(toUtcIssueDateTime(`${local}:42`), utc)
})
