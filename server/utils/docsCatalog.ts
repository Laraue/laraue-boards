import { createDocsCatalog, type DocsCatalog } from '../../app/sections/docs/content/docsCatalog'

let catalog: Promise<DocsCatalog> | undefined

// The docs (`content/docs`, bundled with the server as `docs` assets) are read once and kept.
export const useDocsCatalog = (): Promise<DocsCatalog> => {
  catalog ??= (async () => {
    const storage = useStorage('assets:docs')
    const files: Record<string, string> = {}
    for (const key of await storage.getKeys()) {
      const raw = await storage.getItemRaw(key)
      // Storage keys look like `en:concepts:issues.md`.
      files[key.replaceAll(':', '/')] =
        raw instanceof Uint8Array ? new TextDecoder().decode(raw) : String(raw)
    }

    return createDocsCatalog(files)
  })()

  return catalog
}
