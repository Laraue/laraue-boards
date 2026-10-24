import type { NuxtApp } from '#app'

type ViewRefresh = () => Promise<unknown> | unknown

// One list per app (and so per server request), of what the views on screen reload.
const registries = new WeakMap<NuxtApp, Set<ViewRefresh>>()

const useRegistry = () => {
  const nuxtApp = useNuxtApp()
  let registry = registries.get(nuxtApp)
  if (!registry) {
    registry = shallowReactive(new Set<ViewRefresh>())
    registries.set(nuxtApp, registry)
  }
  return registry
}

/** Lets the header's refresh button (AppRefreshButton) reload this view's data while it is on
 * screen. A part of a view with its own query (comments, history) registers its own. `refresh`
 * reloads in place: the view stays mounted, so its filters, scroll and open dialogs stay. */
export const useViewRefresh = (refresh: ViewRefresh) => {
  const registry = useRegistry()
  onMounted(() => registry.add(refresh))
  onBeforeUnmount(() => registry.delete(refresh))
}

/** What the refresh button reloads: everything the views on screen registered. */
export const useViewRefreshTargets = () => {
  const registry = useRegistry()
  const available = computed(() => registry.size > 0)
  const refreshAll = async () => {
    await Promise.all([...registry].map((refresh) => refresh()))
  }
  return { available, refreshAll }
}
