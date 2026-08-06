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

type QueuedTour = {
  cancelled: () => boolean
  priority: number
  run: () => Promise<void>
}

const queue: QueuedTour[] = []
let queueRunning = false
let queueTimer: ReturnType<typeof setTimeout> | undefined

const runQueue = async (): Promise<void> => {
  queueTimer = undefined
  if (queueRunning) {
    return
  }

  queueRunning = true
  while (queue.length) {
    queue.sort((left, right) => left.priority - right.priority)
    const next = queue.shift()
    if (next && !next.cancelled()) {
      await next.run()
    }
  }
  queueRunning = false
}

const enqueueTour = (tour: QueuedTour): void => {
  queue.push(tour)
  queueTimer ??= setTimeout(() => void runQueue())
}

export const useTour = ({
  priority = 0,
  ready,
  state,
  steps,
}: {
  priority?: number
  ready: () => boolean
  state: TourStateDeps
  steps: TourStep[]
}): void => {
  let activeTour: ReturnType<typeof driver> | undefined
  let disposed = false
  let started = false
  const mounted = ref(false)

  const startTour = (): Promise<TourStatus | undefined> =>
    new Promise((resolve) => {
      activeTour = driver({
        animate: !matchMedia('(prefers-reduced-motion: reduce)').matches,
        disableActiveInteraction: true,
        doneBtnText: 'Start working',
        duration: 200,
        nextBtnText: 'Next',
        onDestroyed: () => resolve(disposed ? undefined : 'dismissed'),
        onDoneClick: () => {
          resolve('completed')
          activeTour?.destroy()
        },
        popoverClass: 'product-tour',
        prevBtnText: 'Back',
        progressText: '{{current}} of {{total}}',
        showProgress: true,
        skipMissingElement: true,
        smoothScroll: true,
        stagePadding: 8,
        stageRadius: 12,
        steps: steps.map(({ description, placement, target, title }) => ({
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

      enqueueTour({
        cancelled: () => disposed,
        priority,
        run: async () => {
          await nextTick()
          if (disposed) {
            return
          }

          const status = await startTour()
          if (status) {
            await state.saveStatus(status)
          }
        },
      })
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    disposed = true
    activeTour?.destroy()
  })
}
