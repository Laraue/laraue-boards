// Where an issue's latest agent run is: handed off (ready), claimed by a runner (working), or over.
export type AgentRunState = 'cancelled' | 'done' | 'failed' | 'ready' | 'working'
