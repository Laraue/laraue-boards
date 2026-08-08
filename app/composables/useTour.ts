import { driver } from 'driver.js'

import { mascotSvg } from '~/constants/mascot'

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

const OPT_IN_KEY = 'onboarding:opt-in:v1'

const queue: QueuedTour[] = []
let queueRunning = false
let queueTimer: ReturnType<typeof setTimeout> | undefined

const animate = (): boolean => !matchMedia('(prefers-reduced-motion: reduce)').matches

/** Driver renders a bare &times; glyph; the app uses lucide icons everywhere else. */
const renderCloseIcon = (popover: { closeButton: HTMLElement }): void => {
  popover.closeButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2 2 8 8M8 2 2 8"/></svg>'
}

/** Set by whichever tour reaches the queue first, so the question can greet by name. */
let greeting: string | undefined

const askOptIn = (): Promise<boolean> =>
  new Promise((resolve) => {
    let accepted = false
    const question = driver({
      allowClose: false,
      animate: animate(),
      duration: 200,
      onDestroyed: () => resolve(accepted),
      onNextClick: () => {
        accepted = true
        question.destroy()
      },
      onPopoverRender: renderCloseIcon,
      onPrevClick: () => question.destroy(),
      popoverClass: 'product-tour product-tour-welcome',
      steps: [
        {
          popover: {
            description: `<span class="tour-intro">${mascotSvg}<span>I am Boardy. Give me a minute and I will show you how organizations, spaces, and issues fit together — or skip it and explore on your own.</span></span>`,
            // Driver disables the previous button on the first step; here it is the decline action.
            disableButtons: [],
            nextBtnText: 'Show me around',
            prevBtnText: 'No thanks',
            showButtons: ['previous', 'next'],
            title: greeting ? `Ready for a quick tour, ${greeting}?` : 'Ready for a quick tour?',
          },
        },
      ],
    })
    question.drive()
  })

/** Asks once, then remembers the answer forever: a decline disables every tour. */
const optedIn = async (): Promise<boolean> => {
  const stored = localStorage.getItem(OPT_IN_KEY)
  if (stored) {
    return stored === 'accepted'
  }

  const accepted = await askOptIn()
  localStorage.setItem(OPT_IN_KEY, accepted ? 'accepted' : 'declined')
  return accepted
}

const runQueue = async (): Promise<void> => {
  queueTimer = undefined
  if (queueRunning) {
    return
  }

  queueRunning = true
  if (!(await optedIn())) {
    queue.length = 0
    queueRunning = false
    return
  }

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
  finish,
  greetingName,
  priority = 0,
  ready,
  state,
  steps,
}: {
  /** Replaces the final button: a concrete next action beats "Start working". */
  finish?: () => undefined | { run: () => void; text: string }
  greetingName?: () => string | undefined
  priority?: number
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
      const done = finish?.()
      activeTour = driver({
        animate: animate(),
        disableActiveInteraction: true,
        doneBtnText: done?.text ?? 'Start working',
        duration: 200,
        nextBtnText: 'Next',
        onDestroyed: () => resolve(disposed ? undefined : 'dismissed'),
        onDoneClick: () => {
          resolve('completed')
          activeTour?.destroy()
          done?.run()
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

      greeting ??= greetingName?.()
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

/** Clears every onboarding decision, so the question and all tours run again. */
export const restartTours = (): void => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('onboarding:'))
    .forEach((key) => localStorage.removeItem(key))
  location.reload()
}
