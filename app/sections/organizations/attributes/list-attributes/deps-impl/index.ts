import type { ApiClient } from '#infrastructure/api/client'

import type { AttributesPageDeps } from '../AttributesPage.deps'
import { createViewAttributes } from './viewAttributes'

export const createAttributesPageDeps = (client: ApiClient): AttributesPageDeps => ({
  view: createViewAttributes(client),
})
