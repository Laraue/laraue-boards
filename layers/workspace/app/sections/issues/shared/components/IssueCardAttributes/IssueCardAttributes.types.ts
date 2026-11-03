// An attribute value shown on an issue card (BRD-179): only those the issue's board shows on cards, in
// the organization's order.
export type IssueCardAttribute = {
  color: string
  // How to read the value: dates and date-times come in ISO 8601 and are shown in the user's locale.
  kind: 'date' | 'dateTime' | 'text'
  name: string
  value: string
}
