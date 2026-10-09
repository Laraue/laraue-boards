export type Toast = { count: number; id: number; message: string; tone: 'error' | 'success' }

const dismissDelay = 5000
const maxVisible = 3

const timers = new Map<number, ReturnType<typeof setTimeout>>()

let nextId = 0

export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  const dismiss = (id: number): void => {
    clearTimeout(timers.get(id))
    timers.delete(id)
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const keepAlive = (id: number): void => {
    clearTimeout(timers.get(id))
    timers.set(
      id,
      setTimeout(() => dismiss(id), dismissDelay),
    )
  }

  const show = (message: string, tone: Toast['tone'] = 'error'): void => {
    if (!import.meta.client) {
      return
    }

    // A repeat counts up on the card that is already showing instead of stacking a duplicate.
    const shown = toasts.value.find((toast) => toast.message === message)
    if (shown) {
      toasts.value = toasts.value.map((toast) =>
        toast.id === shown.id ? { ...toast, count: toast.count + 1 } : toast,
      )
      keepAlive(shown.id)
      return
    }

    const id = ++nextId
    const next = [...toasts.value, { count: 1, id, message, tone }]
    for (const dropped of next.slice(0, Math.max(0, next.length - maxVisible))) {
      clearTimeout(timers.get(dropped.id))
      timers.delete(dropped.id)
    }
    toasts.value = next.slice(-maxVisible)
    keepAlive(id)
  }

  return { dismiss, show, toasts }
}
