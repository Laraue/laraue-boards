import { expect, test } from 'vitest'

import { getFormatters } from './formatters'

test('compact task dates show the day and month today, and add the year for older tasks', () => {
  const { formatCompactDate } = getFormatters('en')
  const today = new Date(2026, 10, 4, 12, 30)

  expect(formatCompactDate(today, today)).toBe('Nov 4')
  expect(formatCompactDate(new Date(2026, 7, 3, 12), today)).toBe('Aug 3')
  expect(formatCompactDate(new Date(2025, 7, 3, 12), today)).toBe('Aug 3, 2025')
})
