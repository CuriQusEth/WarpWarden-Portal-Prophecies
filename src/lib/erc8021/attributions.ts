import { encodeAbiParameters, parseAbiParameters, Hex } from 'viem';

/**
 * ERC-8021 Transaction Attribution
 * Enables tracing actions back to DApps and Builders (clients/frontends).
 */

export const BUILDER_CODE = 'bc_4u3cx6kl'; // Provided Base Builder Code
export const ATTRIBUTION_CODE = 'warpwarden_v1';

export function getAttributionPayload(): Hex {
  // Simple theoretical encoding of attribution to append to calldata 
  // or emit in events as required by the 8021 specification implementation
  return encodeAbiParameters(
    parseAbiParameters('string builder, string app'),
    [BUILDER_CODE, ATTRIBUTION_CODE]
  );
}
