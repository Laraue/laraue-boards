import { useLocale } from '#layers/core/app/i18n/useI18n'
import { getFormatters } from '#layers/workspace/app/shared/utils/formatters'

export const useFormatters = () => {
  const locale = useLocale().value
  const formatters = getFormatters(locale)
  return {
    ...formatters,
    formatRecent: (value: Date | string) => formatters.formatRecent(value, new Date()),
  }
}
