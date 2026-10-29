// How an issue was created. keyName names the API key it was created with (mcp, agent: "{client} ({machine})");
// null for telegram and web, or when the key was deleted.
export type IssueSource = {
  keyName: null | string
  kind: 'agent' | 'mcp' | 'telegram' | 'web'
}
