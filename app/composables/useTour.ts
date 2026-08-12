import { driver } from 'driver.js'

export type TourStep = {
  description: string
  placement?: 'bottom' | 'left' | 'right' | 'top'
  target?: string
  title: string
}

export type TourStatus = 'completed' | 'dismissed'

export type TourStateDeps = {
  loadStatus: () => Promise<TourStatus | undefined>
  saveStatus: (status: TourStatus) => Promise<void>
}

const animate = (): boolean => !matchMedia('(prefers-reduced-motion: reduce)').matches

/** Driver renders a bare &times; glyph; the app uses lucide icons everywhere else. */
const renderCloseIcon = (popover: { closeButton: HTMLElement }): void => {
  popover.closeButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2 2 8 8M8 2 2 8"/></svg>'
}

export const useTour = ({
  ready,
  state,
  steps,
}: {
  ready: () => boolean
  state: TourStateDeps
  steps: () => TourStep[]
}): void => {
  let activeTour: ReturnType<typeof driver> | undefined
  let disposed = false
  let started = false
  const mounted = ref(false)

  const startTour = (): Promise<TourStatus | undefined> =>
    new Promise((resolve) => {
      activeTour = driver({
        animate: animate(),
        disableActiveInteraction: true,
        doneBtnText: 'Start working',
        duration: 200,
        nextBtnText: 'Next',
        onDestroyed: () => resolve(disposed ? undefined : 'dismissed'),
        onDoneClick: () => {
          resolve('completed')
          activeTour?.destroy()
        },
        onPopoverRender: renderCloseIcon,
        popoverClass: 'product-tour',
        popoverOffset: 24,
        prevBtnText: 'Back',
        progressText: '{{current}} of {{total}}',
        showProgress: true,
        skipMissingElement: true,
        smoothScroll: true,
        stagePadding: 8,
        stageRadius: 12,
        steps: steps().map(({ description, placement, target, title }) => ({
          element: target,
          popover: { description, side: placement, title },
        })),
      })
      activeTour.drive()
    })

  onMounted(() => (mounted.value = true))

  watch(
    [ready, mounted],
    async ([isReady, isMounted]) => {
      if (!import.meta.client || !isMounted || !isReady || started) {
        return
      }

      started = true
      if ((await state.loadStatus()) || disposed) {
        return
      }

      await nextTick()
      if (disposed) {
        return
      }

      const status = await startTour()
      if (status) {
        await state.saveStatus(status)
      }
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    disposed = true
    activeTour?.destroy()
  })
}
