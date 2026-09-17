import type { Locale } from '~/composables/useI18n'

const ERROR_MESSAGES: Record<Locale, Record<number, string>> = {
  en: {
    0: 'Could not reach the server. Check your connection.',
    400: 'The submitted data is invalid.',
    401: 'Sign in to continue.',
    403: 'You do not have permission to do this.',
    404: 'Not found.',
    409: 'This conflicts with existing data.',
    413: 'The file is too large.',
    429: 'Too many requests. Try again shortly.',
    500: 'Server error. Try again.',
  },
  ru: {
    0: 'Не удалось связаться с сервером. Проверьте подключение.',
    400: 'Отправленные данные некорректны.',
    401: 'Войдите, чтобы продолжить.',
    403: 'У вас нет прав для этого действия.',
    404: 'Ничего не найдено.',
    409: 'Эти данные конфликтуют с уже существующими.',
    413: 'Файл слишком большой.',
    429: 'Слишком много запросов. Повторите попытку позже.',
    500: 'Ошибка сервера. Повторите попытку.',
  },
}

// Code 0 means the request never got a usable response. Any 5xx (502/503/504 during a deploy)
// is a server error for the user.
export const getErrorMessage = (code: number, locale: Locale): string =>
  ERROR_MESSAGES[locale][code >= 500 ? 500 : code] ??
  (locale === 'ru' ? 'Не удалось выполнить запрос.' : 'Could not complete the request.')
