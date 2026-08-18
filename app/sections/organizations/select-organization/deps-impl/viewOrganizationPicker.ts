import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import { DEFAULT_COLOR } from '~/constants/colors'
import { getOrganizationKey } from '~/utils/organizationKey'

import type { ViewOrganizationPicker } from '../OrganizationPickerPage.deps'

export const createViewOrganizationPicker =
  (client: ApiClient): ViewOrganizationPicker =>
  ({ signal }) =>
    executeQuery({
      map: (organizations) =>
        organizations?.map((organization) => ({
          color: organization.color ?? DEFAULT_COLOR,
          description: organization.isPersonal ? 'Personal organization' : 'Team organization',
          id: String(organization.id),
          initial: organization.name[0] ?? '?',
          isPersonal: organization.isPersonal,
          key: getOrganizationKey(organization),
          name: organization.name,
        })),
      request: () => client.GET('/api/organizations', { signal }),
    })
