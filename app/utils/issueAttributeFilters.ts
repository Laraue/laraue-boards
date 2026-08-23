import type { LocationQuery, LocationQueryRaw } from 'vue-router'

import { assertNever } from '~/utils/assertNever'

const prefix = 'attribute.'

export type AttributeFilterValues = Record<string, string | string[]>
export type AttributeFilterInput =
  | { attributeId: string; from?: string; to?: string; type: 'date' }
  | { attributeId: string; from?: string; to?: string; type: 'dateTime' }
  | { attributeId: string; from?: string; to?: string; type: 'decimal' }
  | { attributeId: string; from?: string; to?: string; type: 'integer' }
  | { attributeId: string; searchString: string; type: 'text' }
  | { attributeId: string; type: 'list'; valueIds: string[] }
type IssueAttribute =
  | { id: string; options: Array<{ value: string }>; type: 'list' }
  | { id: string; type: 'date' }
  | { id: string; type: 'dateTime' }
  | { id: string; type: 'decimal' }
  | { id: string; type: 'integer' }
  | { id: string; type: 'text' }

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
    switch (attribute.type) {
      case 'text': {
        const value = values.at(-1)?.trim()
        if (value) {
          result[attribute.id] = value
        }
        break
      }
      case 'list': {
        const allowed = new Set(attribute.options.map((option) => option.value))
        const selected = [...new Set(values.filter((value) => allowed.has(value)))]
        if (selected.length) {
          result[attribute.id] = selected
        }
        break
      }
      case 'integer': {
        const range = values.slice(-2)
        if (range.some(Boolean)) {
          result[attribute.id] = [range[0] ?? '', range[1] ?? '']
        }
        break
      }
      case 'decimal': {
        const range = values.slice(-2)
        if (range.some(Boolean)) {
          result[attribute.id] = [range[0] ?? '', range[1] ?? '']
        }
        break
      }
      case 'date': {
        const range = values.slice(-2)
        if (range.some(Boolean)) {
          result[attribute.id] = [range[0] ?? '', range[1] ?? '']
        }
        break
      }
      case 'dateTime': {
        const range = values.slice(-2)
        if (range.some(Boolean)) {
          result[attribute.id] = [range[0] ?? '', range[1] ?? '']
        }
        break
      }
      default:
        assertNever(attribute)
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
    switch (attribute.type) {
      case 'text':
        if (typeof value === 'string' && value.trim()) {
          result.push({ attributeId: attribute.id, searchString: value.trim(), type: 'text' })
        }
        break
      case 'list':
        if (Array.isArray(value) && value.length) {
          result.push({ attributeId: attribute.id, type: 'list', valueIds: value })
        }
        break
      case 'integer':
        if (Array.isArray(value)) {
          const [from, to] = value.map((item) => item.trim())
          if (from || to) {
            result.push({
              attributeId: attribute.id,
              ...(from && { from }),
              ...(to && { to }),
              type: 'integer',
            })
          }
        }
        break
      case 'decimal':
        if (Array.isArray(value)) {
          const [from, to] = value.map((item) => item.trim())
          if (from || to) {
            result.push({
              attributeId: attribute.id,
              ...(from && { from }),
              ...(to && { to }),
              type: 'decimal',
            })
          }
        }
        break
      case 'date':
        if (Array.isArray(value)) {
          const [from, to] = value.map((item) => item.trim())
          if (from || to) {
            result.push({
              attributeId: attribute.id,
              ...(from && { from }),
              ...(to && { to }),
              type: 'date',
            })
          }
        }
        break
      case 'dateTime':
        if (Array.isArray(value)) {
          const [from, to] = value.map((item) => item.trim())
          if (from || to) {
            result.push({
              attributeId: attribute.id,
              ...(from && { from }),
              ...(to && { to }),
              type: 'dateTime',
            })
          }
        }
        break
      default:
        assertNever(attribute)
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
    switch (attribute.type) {
      case 'text':
        if (typeof value === 'string' && value.trim()) {
          next[`${prefix}${attribute.id}`] = value.trim()
        }
        break
      case 'list':
        if (Array.isArray(value) && value.length) {
          next[`${prefix}${attribute.id}`] = value
        }
        break
      case 'integer':
        if (Array.isArray(value) && value.some(Boolean)) {
          next[`${prefix}${attribute.id}`] = value
        }
        break
      case 'decimal':
        if (Array.isArray(value) && value.some(Boolean)) {
          next[`${prefix}${attribute.id}`] = value
        }
        break
      case 'date':
        if (Array.isArray(value) && value.some(Boolean)) {
          next[`${prefix}${attribute.id}`] = value
        }
        break
      case 'dateTime':
        if (Array.isArray(value) && value.some(Boolean)) {
          next[`${prefix}${attribute.id}`] = value
        }
        break
      default:
        assertNever(attribute)
    }
  }
  return next
}
