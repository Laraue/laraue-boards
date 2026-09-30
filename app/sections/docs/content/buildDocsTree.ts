import type { DocEntry, DocLink, DocNode } from './DocsContent.types'

const byOrderThenTitle = (a: DocNode, b: DocNode): number =>
  a.meta.order - b.meta.order || a.meta.title.localeCompare(b.meta.title)

const isChildOf = (path: string[], parent: string[]): boolean =>
  path.length === parent.length + 1 && parent.every((segment, index) => path[index] === segment)

const buildNode = (entry: DocEntry, entries: DocEntry[]): DocNode => ({
  children: entries
    .filter((candidate) => isChildOf(candidate.path, entry.path))
    .map((child) => buildNode(child, entries))
    .toSorted(byOrderThenTitle),
  meta: entry.meta,
  path: entry.path,
})

// The docs as a tree: the home page at the top, sections below it, pages inside their sections.
export const buildDocsTree = (entries: DocEntry[]): DocNode => {
  const root = entries.find((entry) => entry.path.length === 0)
  if (!root) {
    throw new Error('The docs have no home page (index.md)')
  }

  return buildNode(root, entries)
}

// Every page in reading order: a section's own page comes before the pages inside it.
export const flattenDocsTree = (node: DocNode): DocNode[] => [
  node,
  ...node.children.flatMap((child) => flattenDocsTree(child)),
]

export const toDocLink = (node: DocNode): DocLink => ({ path: node.path, title: node.meta.title })
