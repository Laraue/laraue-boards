import type { Locale } from '#layers/core/app/i18n/translator'

type FormatValue = Date | string

const createFormatters = (locale: Locale) => {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })
  const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' })
  const dayMonth = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' })
  const localDate = new Intl.DateTimeFormat(locale)
  const number = new Intl.NumberFormat(locale)

  // Today's time, this year's day, or a full date: as short as is still unambiguous.
  const formatRecent = (value: FormatValue, now: Date) => {
    const moment = new Date(value)
    if (moment.toDateString() === now.toDateString()) {
      return time.format(moment)
    }
    return moment.getFullYear() === now.getFullYear()
      ? dayMonth.format(moment)
      : date.format(moment)
  }

  return {
    formatDate: (value: FormatValue) => date.format(new Date(value)),
    formatDateTime: (value: FormatValue) => dateTime.format(new Date(value)),
    formatLocalDate: (value: FormatValue) => localDate.format(new Date(value)),
    formatNumber: (value: number) => number.format(value),
    formatRecent,
    formatTime: (value: FormatValue) => time.format(new Date(value)),
  }
}

// Formatter instances are immutable and shared; user state is supplied by the caller.
const formatters = { en: createFormatters('en'), ru: createFormatters('ru') }

export const getFormatters = (locale: Locale) => formatters[locale]
