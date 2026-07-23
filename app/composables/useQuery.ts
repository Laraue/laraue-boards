import type { WatchSource } from 'vue'

import type { QueryResult } from '#infrastructure/api/apiResult'
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
      ? getErrorMessage(asyncData.data.value.code)
      : undefined,
  )

  return { ...asyncData, data, message }
}
