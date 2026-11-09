import { expect, test } from 'vitest'

import { getFormatters } from './formatters'

test('compact task dates show the day and month today, and add the year for older tasks', () => {
  const { formatCompactDate } = getFormatters('en')
  const today = new Date(2026, 10, 4, 12, 30)

  expect(formatCompactDate(today, today)).toBe('Nov 4')
  expect(formatCompactDate(new Date(2026, 7, 3, 12), today)).toBe('Aug 3')
  expect(formatCompactDate(new Date(2025, 7, 3, 12), today)).toBe('Aug 3, 2025')
})

test('storage sizes use the binary units the plans are counted in', () => {
  const { formatStorageSize } = getFormatters('en')

  expect(formatStorageSize(100 * 1024 * 1024)).toBe('100 MB')
  expect(formatStorageSize(11 * 1024 ** 3)).toBe('11 GB')
  expect(formatStorageSize(1536 * 1024)).toBe('1.5 MB')
  expect(formatStorageSize(512 * 1024)).toBe('512 kB')
  expect(getFormatters('ru').formatStorageSize(1536 * 1024)).toBe('1,5 МБ')
})
