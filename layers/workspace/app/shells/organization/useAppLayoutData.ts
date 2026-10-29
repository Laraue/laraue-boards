import { computed } from 'vue'

import { refreshNuxtData, useNuxtData } from '#app'

import type { AppLayoutResult } from './AppLayout.deps'

export const appLayoutDataKey = 'app-layout'

export const refreshAppLayoutData = () => refreshNuxtData(appLayoutDataKey)

/** The layout's data for the pages inside it, read from the layout's own cache. */
export const useAppLayoutData = () => {
  const { data } = useNuxtData<AppLayoutResult>(appLayoutDataKey)
  return computed(() => (data.value?.status === 'success' ? data.value.data : undefined))
}
