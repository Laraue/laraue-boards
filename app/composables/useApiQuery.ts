import { isApiError } from '#infrastructure/api/request'
import { useLocale } from '~/composables/useI18n'
import { getErrorMessage } from '~/utils/getErrorMessage'

type Loaded<Value> = { code: number; status: 'error' } | { status: 'success'; value: Value }

/** Loads data from a dep that throws an `ApiError` on failure. The failure is kept as a plain
 * object, since an error instance does not survive the SSR payload. */
export const useApiQuery = async <Value>(
  key: (() => string) | string,
  query: (signal: AbortSignal | undefined) => Promise<Value>,
  options?: { immediate?: boolean; lazy?: boolean },
) => {
  const locale = useLocale()
  const asyncData = await useAsyncData(
    key,
    async (_nuxtApp, { signal }): Promise<Loaded<Value>> => {
      try {
        return { status: 'success', value: await query(signal) }
      } catch (error) {
        if (!isApiError(error)) {
          throw error
        }
        return { code: error.status, status: 'error' }
      }
    },
    options,
  )

  const data = computed(() =>
    asyncData.data.value?.status === 'success' ? asyncData.data.value.value : undefined,
  )
  const message = computed(() =>
    asyncData.data.value?.status === 'error'
      ? getErrorMessage(asyncData.data.value.code, locale.value)
      : undefined,
  )

  // The HTTP status of a failed query (0 when it never got a response), for callers that react to
  // a particular one - e.g. sending a signed-out visitor to the login page on 401.
  const code = computed(() =>
    asyncData.data.value?.status === 'error' ? asyncData.data.value.code : undefined,
  )

  return { ...asyncData, code, data, message }
}
