import type { ApiClient } from '#infrastructure/api/client'

import type { AttributePageDeps } from '../AttributePage.deps'
import { createDeleteAttribute } from './deleteAttribute'
import { createUpdateAttribute } from './updateAttribute'
import { createViewAttribute } from './viewAttribute'

export const createAttributePageDeps = (client: ApiClient): AttributePageDeps => ({
  delete: createDeleteAttribute(client),
  update: createUpdateAttribute(client),
  view: createViewAttribute(client),
})
