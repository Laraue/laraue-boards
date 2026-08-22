import type { LocationQuery, LocationQueryRaw } from 'vue-router'

const prefix = 'attribute.'

export type AttributeFilterValues = Record<string, string | string[]>
export type AttributeFilterInput =
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
  | {
      attributeId: string
      from?: string
      to?: string
      type: 'date' | 'dateTime' | 'decimal' | 'integer'
    }
type IssueAttribute =
  | { id: string; type: 'date' | 'dateTime' | 'decimal' | 'integer' | 'text' }
  | { id: string; options: Array<{ value: string }>; type: 'list' }

export function readIssueAttributeQuery(query: LocationQuery) {
  return Object.fromEntries(
    Object.entries(query).flatMap(([key, value]) => {
      if (!key.startsWith(prefix)) {
        return []
      }
      const values = (Array.isArray(value) ? value : [value]).filter(
        (item): item is string => typeof item === 'string',
      )
      return values.some(Boolean) ? [[key.slice(prefix.length), values]] : []
    }),
  )
}

export function readIssueSpaceQuery(value: LocationQuery['space'] | undefined) {
  return [
    ...new Set(
      (Array.isArray(value) ? value : [value]).filter(
        (item): item is string => typeof item === 'string' && item.length > 0,
      ),
    ),
  ]
}

export function normalizeIssueAttributeFilters(
  raw: Record<string, string[]>,
  attributes: IssueAttribute[],
): AttributeFilterValues {
  const result: AttributeFilterValues = {}
  for (const attribute of attributes) {
    const values = raw[attribute.id] ?? []
    if (attribute.type === 'text') {
      const value = values.at(-1)?.trim()
      if (value) {
        result[attribute.id] = value
      }
      continue
    }
    if (attribute.type === 'list') {
      const allowed = new Set(attribute.options.map((option) => option.value))
      const selected = [...new Set(values.filter((value) => allowed.has(value)))]
      if (selected.length) {
        result[attribute.id] = selected
      }
      continue
    }
    const range = values.slice(-2)
    if (range.some(Boolean)) {
      result[attribute.id] = [range[0] ?? '', range[1] ?? '']
    }
  }
  return result
}

export function getIssueAttributeFilterInput(
  values: AttributeFilterValues,
  attributes: IssueAttribute[],
): AttributeFilterInput[] {
  const result: AttributeFilterInput[] = []
  for (const attribute of attributes) {
    const value = values[attribute.id]
    if (attribute.type === 'text' && typeof value === 'string' && value.trim()) {
      result.push({
        attributeId: attribute.id,
        searchString: value.trim(),
        type: 'text',
      })
    }
    if (attribute.type === 'list' && Array.isArray(value) && value.length) {
      result.push({ attributeId: attribute.id, type: 'list', valueIds: value })
    }
    if (attribute.type !== 'list' && attribute.type !== 'text' && Array.isArray(value)) {
      const [from, to] = value.map((item) => item.trim())
      if (from || to) {
        result.push({
          attributeId: attribute.id,
          ...(from && { from }),
          ...(to && { to }),
          type: attribute.type,
        })
      }
    }
  }
  return result
}

export function withIssueAttributeFilters(
  query: LocationQuery,
  values: AttributeFilterValues,
  attributes: IssueAttribute[],
): LocationQueryRaw {
  const next = Object.fromEntries(Object.entries(query).filter(([key]) => !key.startsWith(prefix)))
  delete next.page
  delete next.filters
  for (const attribute of attributes) {
    const value = values[attribute.id]
    if (attribute.type === 'text' && typeof value === 'string' && value.trim()) {
      next[`${prefix}${attribute.id}`] = value.trim()
    } else if (attribute.type === 'list' && Array.isArray(value) && value.length) {
      next[`${prefix}${attribute.id}`] = value
    } else if (
      attribute.type !== 'list' &&
      attribute.type !== 'text' &&
      Array.isArray(value) &&
      value.some(Boolean)
    ) {
      next[`${prefix}${attribute.id}`] = value
    }
  }
  return next
}
