type GoogleCredentialResponse = { credential: string }

type GoogleAccountsId = {
  initialize: (config: {
    callback: (response: GoogleCredentialResponse) => void
    client_id: string
  }) => void
  renderButton: (container: HTMLElement, options: Record<string, number | string>) => void
}

type GoogleWindow = typeof globalThis & {
  google?: { accounts?: { id?: GoogleAccountsId } }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

const loadGoogleIdentityServices = (): Promise<GoogleAccountsId> => {
  const loaded = (globalThis as GoogleWindow).google?.accounts?.id
  if (loaded) {
    return Promise.resolve(loaded)
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = SCRIPT_SRC
    script.addEventListener('load', () => {
      const id = (globalThis as GoogleWindow).google?.accounts?.id
      if (id) {
        resolve(id)
      } else {
        reject(new Error('Google Identity Services did not initialize.'))
      }
    })
    script.addEventListener('error', () =>
      reject(new Error('Google Identity Services failed to load.')),
    )
    document.head.appendChild(script)
  })
}

export const mountGoogleSignInButton = async ({
  clientId,
  container,
  onCredential,
}: {
  clientId: string
  container: HTMLElement
  onCredential: (idToken: string) => void
}): Promise<void> => {
  const id = await loadGoogleIdentityServices()

  id.initialize({
    callback: (response) => onCredential(response.credential),
    client_id: clientId,
  })
  id.renderButton(container, {
    shape: 'rectangular',
    size: 'large',
    text: 'continue_with',
    theme: 'outline',
    type: 'standard',
  })
}
