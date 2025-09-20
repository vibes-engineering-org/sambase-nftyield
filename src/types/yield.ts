export interface YieldPool {
  id: string
  name: string
  description: string
  protocol: string
  chainId: number
  contractAddress: string
  token: string
  apy: number
  tvl: string
  isActive: boolean
  riskLevel: 'Low' | 'Medium' | 'High'
  lockupPeriod?: string
  minimumDeposit?: string
  maximumDeposit?: string
  fees?: YieldPoolFees
  rewards?: string[]
}

export interface YieldPoolFees {
  depositFee: number
  withdrawalFee: number
  performanceFee: number
  managementFee: number
}

export interface UserPosition {
  id: string
  poolId: string
  userAddress: string
  amount: string
  shares: string
  depositedAt: string
  lastClaimAt?: string
  totalRewards: string
  pendingRewards: string
  isLocked: boolean
  unlockAt?: string
}

export interface YieldHistory {
  timestamp: string
  apy: number
  tvl: string
  totalRewards: string
  activeUsers: number
}

export interface RewardClaim {
  userAddress: string
  poolId: string
  amount: string
  token: string
  transactionHash: string
  claimedAt: string
  gasCost?: string
}

export interface PoolMetrics {
  totalDeposits: string
  totalWithdrawals: string
  totalRewardsPaid: string
  averageAPY: number
  peakTVL: string
  activeUsers: number
  totalTransactions: number
}

export interface YieldStrategy {
  id: string
  name: string
  description: string
  protocols: string[]
  allocation: StrategyAllocation[]
  riskScore: number
  expectedAPY: number
  minDeposit: string
  maxCapacity?: string
}

export interface StrategyAllocation {
  protocol: string
  percentage: number
  token: string
  poolAddress: string
}

export interface LiquidityProvider {
  address: string
  totalLiquidity: string
  poolsCount: number
  totalRewards: string
  joinedAt: string
  isActive: boolean
}