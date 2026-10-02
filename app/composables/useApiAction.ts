import { isApiError } from '#infrastructure/api/request'
import { useLocale } from '~/composables/useI18n'
import { getErrorMessage } from '~/utils/getErrorMessage'

/** Runs an action that throws an `ApiError` on failure. A failure with the backend's own text
 * (validation, payment required) belongs to the form; anything else is a toast. `execute`
 * resolves whether the action succeeded. */
export const useApiAction = <Args extends unknown[]>(
  action: (...args: Args) => Promise<unknown>,
) => {
  const locale = useLocale()
  const pending = ref(false)
  const message = ref<string | undefined>()
  const toast = useToast()

  const execute = async (...args: Args): Promise<boolean> => {
    // The previous message stays up until the retry has an answer, so the form does not flicker mid-request.
    pending.value = true
    try {
      await action(...args)
      message.value = undefined
      return true
    } catch (error) {
      if (!isApiError(error)) {
        throw error
      }
      if (error.reason || error.status === 400) {
        message.value = error.reason || getErrorMessage(400, locale.value)
      } else {
        message.value = undefined
        toast.show(getErrorMessage(error.status, locale.value))
      }
      return false
    } finally {
      pending.value = false
    }
  }

  return { execute, message, pending }
}
