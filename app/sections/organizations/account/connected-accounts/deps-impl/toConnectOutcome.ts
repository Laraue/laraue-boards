import type { components } from '#infrastructure/api/generated'

import type { ConnectOutcome } from '../ConnectedAccountsPage.types'

const OUTCOMES: Record<components['schemas']['AccountLinkOutcome'], ConnectOutcome> = {
  Linked: 'linked',
  OwnerHasData: 'owner-has-data',
  OwnerUsedByAnotherService: 'owner-used-by-another-service',
  UserHasOtherAccount: 'user-has-other-account',
}

export const toConnectOutcome = (
  response: components['schemas']['ConnectAccountResponse'],
): ConnectOutcome => OUTCOMES[response.outcome]
