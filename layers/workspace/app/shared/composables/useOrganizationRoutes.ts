import { useRoute } from '#app'
import { createOrganizationRoutes } from '#layers/workspace/app/shared/utils/organizationRoutes'
import type { OrganizationRouteName } from '#layers/workspace/app/shared/utils/organizationRoutes'

export type { OrganizationRouteName } from '#layers/workspace/app/shared/utils/organizationRoutes'

export const useOrganizationRoutes = () => {
  const route = useRoute<OrganizationRouteName>()
  return createOrganizationRoutes(() => {
    const value = route.params.organizationKey
    if (typeof value !== 'string') {
      throw new Error('organizationKey is missing or invalid')
    }
    return value
  })
}
