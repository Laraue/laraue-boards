// The languages of the docs. Not the app's `Locale`: the server code that reads the docs cannot
// see the app's composables (and the type-check of the server would follow that import).
export type DocsLocale = 'en' | 'ru'

// `root` is the docs' home page, `section` the index page of a folder, `page` an ordinary page.
export type DocKind = 'page' | 'root' | 'section'

export type DocMeta = {
  createdAt: string
  description: string
  icon?: string
  keywords: string[]
  kind: DocKind
  order: number
  title: string
  updatedAt: string
}

// One markdown file. `path` is the page's place in the docs: [] for the home page and
// ['concepts'] for the index of the concepts section.
export type DocEntry = {
  body: string
  meta: DocMeta
  path: string[]
}

export type DocNode = {
  children: DocNode[]
  meta: DocMeta
  path: string[]
}

export type DocLink = {
  path: string[]
  title: string
}

export type DocHeading = {
  id: string
  level: 2 | 3
  text: string
}

export type DocPage = {
  alternates: DocsLocale[]
  breadcrumbs: DocLink[]
  headings: DocHeading[]
  html: string
  meta: DocMeta
  next?: DocLink
  previous?: DocLink
}
