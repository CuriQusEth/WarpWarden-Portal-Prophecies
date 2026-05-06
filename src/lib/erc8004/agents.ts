/**
 * ERC-8004 Trustless Agents
 * Defines standard interfaces for injecting agents (smart contracts or automated signers)
 * as autonomous players or helpers in on-chain systems.
 */

export interface AgentConfig {
  agentAddress: string;
  capabilities: string[];
  permissions: string[]; // e.g. "CAN_DEPLOY_TOWER", "CAN_CAST_WARP"
}

export function initializeTrustlessAgent(config: AgentConfig) {
  console.log(`[ERC-8004] Agent ${config.agentAddress} initialized equipped with:`, config.capabilities);
  // Implementation stub: Register the agent to securely trigger game transactions
  // on behalf of the user, obeying session keys and rate limits.
}
