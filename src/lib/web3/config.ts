import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// Base Mainnet configured for the Denim hard fork (200ms native canonical blocks)
export const baseDenim = {
  ...base,
  name: 'Base Mainnet',
  rpcUrls: {
    ...base.rpcUrls,
    default: {
      http: ['https://mainnet.base.org'],
    },
  },
} as const;

export const config = createConfig({
  chains: [baseDenim],
  connectors: [injected()],
  pollingInterval: 200, // 200ms block polling for Base Denim canonical blocks
  transports: {
    [base.id]: http('https://mainnet.base.org', {
      batch: true,
      retryCount: 3,
    }),
  },
});
