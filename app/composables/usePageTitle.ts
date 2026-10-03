import type { MaybeRefOrGetter } from 'vue'

type PageTitle = { path: string; title: string }

/** The page's title in the tab and as the last breadcrumb. Tied to the page's path, so a page
 * without a title never shows the previous one. */
export const usePageTitle = (title: MaybeRefOrGetter<string>) => {
  const { path } = useRoute()
  const state = useState<PageTitle | undefined>('page-title')

  useHead({ title })
  watchEffect(() => (state.value = { path, title: toValue(title) }))
}

/** The title the current page gave itself, if any. */
export const useCurrentPageTitle = () => {
  const route = useRoute()
  const state = useState<PageTitle | undefined>('page-title')
  return computed(() => (state.value?.path === route.path ? state.value.title : undefined))
}
