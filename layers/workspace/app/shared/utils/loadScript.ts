const loading = new Map<string, Promise<void>>()

/** Adds a third-party script once; later calls for the same src share the first load. */
export const loadScript = (src: string): Promise<void> => {
  const existing = loading.get(src)
  if (existing) {
    return existing
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.async = true
    script.src = src
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => {
      loading.delete(src)
      reject(new Error(`${src} failed to load.`))
    })
    document.head.append(script)
  })
  loading.set(src, promise)
  return promise
}
