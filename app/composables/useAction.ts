import type { ActionResult } from '#infrastructure/api/apiResult'
import { getErrorMessage } from '~/utils/getErrorMessage'

export const useAction = <Args extends unknown[], Data>(
  action: (...args: Args) => Promise<ActionResult<Data>>,
  options: { onSuccess?: (data: Data) => Promise<void> | void } = {},
) => {
  const pending = ref(false)
  const message = ref<string | undefined>()

  const execute = async (...args: Args): Promise<Data | undefined> => {
    pending.value = true
    message.value = undefined

    try {
      const result = await action(...args)

      if (result.status === 'success') {
        await options.onSuccess?.(result.data)
        return result.data
      }
      message.value =
        result.status === 'validation-error' ? result.message : getErrorMessage(result.code)
      return undefined
    } finally {
      pending.value = false
    }
  }

  return { execute, message, pending }
}
