import { ref } from 'vue'

import { isApiError } from '#infrastructure/api/request'
import { useToast } from '#layers/core/app/ui/composables/useToast'
import { useErrorMessage } from '#layers/workspace/app/shared/composables/useErrorMessage'
import { actionFailure } from '#layers/workspace/app/shared/utils/actionFailure'

/** Runs an action that throws an `ApiError` on failure. A failure with the backend's own text
 * (validation, payment required) belongs to the form; anything else is a toast. `execute`
 * resolves `{ value }` on success, even for an action without one, and `undefined` on failure. */
export const useApiAction = <Args extends unknown[], Value>(
  action: (...args: Args) => Promise<Value>,
) => {
  const errorMessage = useErrorMessage()
  const pending = ref(false)
  const message = ref<string | undefined>()
  const toast = useToast()

  const execute = async (...args: Args): Promise<undefined | { value: Value }> => {
    // The previous message stays up until the retry has an answer, so the form does not flicker mid-request.
    pending.value = true
    try {
      const value = await action(...args)
      message.value = undefined
      return { value }
    } catch (error) {
      if (!isApiError(error)) {
        throw error
      }
      const failure = actionFailure(error.status, error.reason, errorMessage)
      if (failure.target === 'form') {
        message.value = failure.message
      } else {
        message.value = undefined
        toast.show(failure.message)
      }
      return undefined
    } finally {
      pending.value = false
    }
  }

  return { execute, message, pending }
}
