import type { MaybeRefOrGetter } from 'vue'

type PageTitle = { id: string; path: string; title: string }

/** The page's title in the tab and as the last breadcrumb. Like `useHead`, the latest owner wins and
 * the previous title comes back once it unmounts (an issue dialog over a board). Tied to the page's
 * path, so a page without a title never shows the previous page's one. */
export const usePageTitle = (title: MaybeRefOrGetter<string>) => {
  const { path } = useRoute()
  const id = useId()
  const titles = useState<PageTitle[]>('page-titles', () => [])

  useHead({ title })
  watch(
    () => toValue(title),
    (value) => {
      const entry = { id, path, title: value }
      const index = titles.value.findIndex((item) => item.id === id)
      titles.value = index === -1 ? [...titles.value, entry] : titles.value.with(index, entry)
    },
    { immediate: true },
  )
  onScopeDispose(() => {
    titles.value = titles.value.filter((item) => item.id !== id)
  })
}

/** The title the current page gave itself, if any. */
export const useCurrentPageTitle = () => {
  const route = useRoute()
  const titles = useState<PageTitle[]>('page-titles', () => [])
  return computed(() => titles.value.findLast((item) => item.path === route.path)?.title)
}
