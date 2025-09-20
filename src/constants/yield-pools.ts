export interface YieldPool {
  id: string
  name: string
  description: string
  apy: number
  tvl: string
  token: string
  protocol: string
  chainId: number
  contractAddress: string
  isActive: boolean
  riskLevel: 'Low' | 'Medium' | 'High'
  lockupPeriod?: string
  minimumDeposit?: string
}

export const YIELD_POOLS: YieldPool[] = [
  {
    id: 'base-usdc-pool',
    name: 'USDC Yield Pool',
    description: 'Stable yield pool for USDC on Base network',
    apy: 8.5,
    tvl: '2,500,000',
    token: 'USDC',
    protocol: 'Compound',
    chainId: 8453,
    contractAddress: '0x1234567890123456789012345678901234567890',
    isActive: true,
    riskLevel: 'Low',
    minimumDeposit: '100',
  },
  {
    id: 'eth-staking-pool',
    name: 'ETH Liquid Staking',
    description: 'Ethereum liquid staking with instant liquidity',
    apy: 4.2,
    tvl: '10,000,000',
    token: 'ETH',
    protocol: 'Lido',
    chainId: 1,
    contractAddress: '0xabcdef1234567890123456789012345678901234',
    isActive: true,
    riskLevel: 'Low',
    lockupPeriod: 'None',
  },
  {
    id: 'defi-yield-pool',
    name: 'DeFi Yield Aggregator',
    description: 'Multi-protocol yield farming strategy',
    apy: 12.8,
    tvl: '750,000',
    token: 'ETH',
    protocol: 'Yearn',
    chainId: 1,
    contractAddress: '0xfedcba0987654321098765432109876543210987',
    isActive: true,
    riskLevel: 'Medium',
    minimumDeposit: '0.1',
  },
]

export const getPoolsByChain = (chainId: number) => {
  return YIELD_POOLS.filter(pool => pool.chainId === chainId)
}

export const getActivePool = () => {
  return YIELD_POOLS.filter(pool => pool.isActive)
}

export const getPoolById = (id: string) => {
  return YIELD_POOLS.find(pool => pool.id === id)
}