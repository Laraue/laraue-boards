// The account has no name or color of its own - a person is shown per organization.
export type UserAccountView = { kind: 'signed-in' } | { kind: 'signed-out' }
