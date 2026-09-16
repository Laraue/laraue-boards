import { type Locale, useLocale } from '~/composables/useI18n'

type FormatValue = Date | string

const createFormatters = (locale: Locale) => {
  const utc = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' })
  const date = utc({ dateStyle: 'medium' })
  const dateTime = utc({ dateStyle: 'medium', timeStyle: 'short' })
  const time = utc({ hour: '2-digit', minute: '2-digit' })
  const localDate = new Intl.DateTimeFormat(locale)
  const number = new Intl.NumberFormat(locale)

  return {
    formatDate: (value: FormatValue) => date.format(new Date(value)),
    formatDateTime: (value: FormatValue) => dateTime.format(new Date(value)),
    // Browser time zone, unlike the other formatters which show UTC.
    formatLocalDate: (value: FormatValue) => localDate.format(new Date(value)),
    formatNumber: (value: number) => number.format(value),
    formatTime: (value: FormatValue) => time.format(new Date(value)),
  }
}

// Changing the locale reloads the page, so formatters are built once per locale and shared by
// every component instance (a board renders hundreds of cards).
const formatters = new Map<Locale, ReturnType<typeof createFormatters>>()

export const useFormatters = () => {
  const locale = useLocale().value
  let result = formatters.get(locale)

  if (!result) {
    result = createFormatters(locale)
    formatters.set(locale, result)
  }

  return result
}
