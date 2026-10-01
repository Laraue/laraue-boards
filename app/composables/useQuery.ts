import type { WatchSource } from 'vue'

import type { QueryResult } from '#infrastructure/api/apiResult'
import { useLocale } from '~/composables/useI18n'
import { getErrorMessage } from '~/utils/getErrorMessage'

export const useQuery = async <Data>(
  key: (() => string) | string,
  query: (nuxtApp: unknown, context: { signal?: AbortSignal }) => Promise<QueryResult<Data>>,
  options?: {
    cached?: boolean
    immediate?: boolean
    lazy?: boolean
    watch?: WatchSource[]
  },
) => {
  const locale = useLocale()
  const { cached, ...asyncDataOptions } = options ?? {}
  const asyncData = await useAsyncData(key, query, {
    ...asyncDataOptions,
    ...(cached
      ? {
          getCachedData: (cacheKey, nuxtApp) => {
            const previous = nuxtApp.payload.data[cacheKey] as QueryResult<Data> | undefined
            return (previous?.status === 'success' ? previous : undefined) as undefined
          },
        }
      : {}),
  })

  const data = computed(() =>
    asyncData.data.value?.status === 'success' ? asyncData.data.value.data : undefined,
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
