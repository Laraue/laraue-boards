// Asks the user to confirm an action in a BaseAlertDialog and resolves to their answer:
//   if (await confirm({ danger: true, title: t('deleteConfirm') })) { ... }
// BaseConfirmHost (mounted once by the app) shows the dialog. Without a host, as in a component
// test, it falls back to window.confirm with the same text.

export type ConfirmOptions = {
  // The confirm button's text; defaults to the host's confirm or danger label.
  action?: string
  // A destructive action: a danger confirm button.
  danger?: boolean
  description?: string
  title: string
}

export type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void }

// ponytail: module state, one dialog at a time, client only; a second request answers the
// first with "no". Fine for confirmations, which come from user clicks.
const pending = shallowRef<null | PendingConfirm>(null)
let hosts = 0

export const usePendingConfirm = () => pending

export const registerConfirmHost = (): (() => void) => {
  hosts += 1
  return () => {
    hosts -= 1
  }
}

export const useConfirm =
  () =>
  (options: ConfirmOptions): Promise<boolean> => {
    if (hosts === 0) {
      return Promise.resolve(
        window.confirm([options.title, options.description].filter(Boolean).join(' ')),
      )
    }
    pending.value?.resolve(false)
    return new Promise((resolve) => {
      pending.value = { ...options, resolve }
    })
  }
