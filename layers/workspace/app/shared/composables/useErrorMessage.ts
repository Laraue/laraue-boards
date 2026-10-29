import { useI18n } from '#layers/core/app/i18n/useI18n'

/** The text for a failed API request, by its HTTP status. Status 0 means the request never got a
 * usable response; any 5xx (a 502/503/504 during a deploy) is a server error for the user. */
export const useErrorMessage = () => {
  const { t } = useI18n({
    en: {
      conflict: 'This conflicts with existing data.',
      forbidden: 'You do not have permission to do this.',
      invalid: 'The submitted data is invalid.',
      limit: 'Your plan limit or AI credits have run out.',
      notFound: 'Not found.',
      offline: 'Could not reach the server. Check your connection.',
      server: 'Server error. Try again.',
      signIn: 'Sign in to continue.',
      tooLarge: 'The file is too large.',
      tooMany: 'Too many requests. Try again shortly.',
      unknown: 'Could not complete the request.',
    },
    ru: {
      conflict: 'Эти данные конфликтуют с уже существующими.',
      forbidden: 'У вас нет прав для этого действия.',
      invalid: 'Отправленные данные некорректны.',
      limit: 'Лимит тарифа или кредиты ИИ закончились.',
      notFound: 'Ничего не найдено.',
      offline: 'Не удалось связаться с сервером. Проверьте подключение.',
      server: 'Ошибка сервера. Повторите попытку.',
      signIn: 'Войдите, чтобы продолжить.',
      tooLarge: 'Файл слишком большой.',
      tooMany: 'Слишком много запросов. Повторите попытку позже.',
      unknown: 'Не удалось выполнить запрос.',
    },
  })
  type Key = Parameters<typeof t>[0]
  const keys: Partial<Record<number, Key>> = {
    0: 'offline',
    400: 'invalid',
    401: 'signIn',
    402: 'limit',
    403: 'forbidden',
    404: 'notFound',
    409: 'conflict',
    413: 'tooLarge',
    429: 'tooMany',
    500: 'server',
  }

  return (status: number): string => t(keys[status >= 500 ? 500 : status] ?? 'unknown')
}
