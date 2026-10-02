import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'
import { assertNever } from '~/utils/assertNever'

import type { CreateAttributeInput, CreateAttributePageDeps } from './CreateAttributePage.deps'

const toRequestData = (data: CreateAttributeInput['data']) => {
  switch (data.type) {
    case 'text':
      return { listValues: null, type: 'Text' as const }
    case 'list':
      return { listValues: data.listValues.map((name) => ({ name })), type: 'List' as const }
    case 'integer':
      return { listValues: null, type: 'Integer' as const }
    case 'decimal':
      return { listValues: null, type: 'Decimal' as const }
    case 'date':
      return { listValues: null, type: 'Date' as const }
    case 'dateTime':
      return { listValues: null, type: 'DateTime' as const }
    default:
      return assertNever(data)
  }
}

export const createCreateAttributePageDeps = (client: ApiClient): CreateAttributePageDeps => ({
  create: async ({ color, data, name }) => {
    await request(
      client.POST('/api/admin/organizations/attributes', {
        body: { color, name, ...toRequestData(data) },
      }),
    )
  },
})
