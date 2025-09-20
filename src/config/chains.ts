import { base, mainnet, arbitrum, optimism, celo } from 'wagmi/chains'

export const supportedChains = [
  mainnet,
  base,
  arbitrum,
  optimism,
  celo,
] as const

export const defaultChain = base

export const chainConfig = {
  [mainnet.id]: {
    name: 'Ethereum',
    symbol: 'ETH',
    logo: '/chains/ethereum.svg',
    explorer: 'https://etherscan.io',
  },
  [base.id]: {
    name: 'Base',
    symbol: 'ETH',
    logo: '/chains/base.svg',
    explorer: 'https://basescan.org',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    symbol: 'ETH',
    logo: '/chains/arbitrum.svg',
    explorer: 'https://arbiscan.io',
  },
  [optimism.id]: {
    name: 'Optimism',
    symbol: 'ETH',
    logo: '/chains/optimism.svg',
    explorer: 'https://optimistic.etherscan.io',
  },
  [celo.id]: {
    name: 'Celo',
    symbol: 'CELO',
    logo: '/chains/celo.svg',
    explorer: 'https://celoscan.io',
  },
} as const

export type SupportedChainId = typeof supportedChains[number]['id']