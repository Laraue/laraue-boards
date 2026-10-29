import { shallowRef } from 'vue'

export type ConfirmOptions = {
  // The confirm button's text; defaults to the host's confirm or danger label.
  action?: string
  // A destructive action: a danger confirm button.
  danger?: boolean
  description?: string
  title: string
}

export type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void }

export const createConfirmation = () => {
  const pending = shallowRef<null | PendingConfirm>(null)
  const answer = (confirmed: boolean): void => {
    const request = pending.value
    pending.value = null
    request?.resolve(confirmed)
  }
  const ask = (options: ConfirmOptions): Promise<boolean> => {
    answer(false)
    return new Promise((resolve) => {
      pending.value = { ...options, resolve }
    })
  }
  return { answer, ask, pending }
}
