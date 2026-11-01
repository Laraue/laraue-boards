import { computed } from 'vue'

import { refreshNuxtData, useNuxtData } from '#app'

import type { AppLayoutResult, ReadOrganizationCatalog } from './AppLayout.deps'

export const appLayoutDataKey = 'app-layout'

export const refreshAppLayoutData = () => refreshNuxtData(appLayoutDataKey)

/** The layout's data for the pages inside it, read from the layout's own cache. */
export const useAppLayoutData = () => {
  const { data } = useNuxtData<AppLayoutResult>(appLayoutDataKey)
  return computed(() => (data.value?.status === 'success' ? data.value.data : undefined))
}

/** The organization's spaces and attributes for a page's deps. A page renders only inside a loaded
 * layout, so they are always there by the time its deps ask. */
export const useOrganizationCatalog = (): ReadOrganizationCatalog => {
  const data = useAppLayoutData()
  return () => {
    if (!data.value) {
      throw new Error('The organization layout is not loaded')
    }
    return data.value
  }
}
