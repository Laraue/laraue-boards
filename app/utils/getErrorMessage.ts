import type { Locale } from '~/composables/useI18n'

const ERROR_MESSAGES: Record<Locale, Record<number, string>> = {
  en: {
    401: 'Sign in to continue.',
    403: 'You do not have permission to do this.',
    404: 'Not found.',
    409: 'This conflicts with existing data.',
    429: 'Too many requests. Try again shortly.',
    500: 'Server error. Try again.',
  },
  ru: {
    401: 'Войдите, чтобы продолжить.',
    403: 'У вас нет прав для этого действия.',
    404: 'Ничего не найдено.',
    409: 'Эти данные конфликтуют с уже существующими.',
    429: 'Слишком много запросов. Повторите попытку позже.',
    500: 'Ошибка сервера. Повторите попытку.',
  },
}

export const getErrorMessage = (code: number, locale: Locale): string =>
  ERROR_MESSAGES[locale][code] ??
  (locale === 'ru' ? 'Не удалось выполнить запрос.' : 'Could not complete the request.')
