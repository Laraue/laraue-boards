export type ConnectedAccounts = {
  google: boolean
  telegram: boolean
}

export type ConnectOutcome =
  | 'linked'
  | 'owner-has-data'
  | 'owner-used-by-another-service'
  | 'user-has-other-account'
