export interface User {
  address: string
  fid?: number
  username?: string
  displayName?: string
  avatar?: string
  bio?: string
  followers?: number
  following?: number
  isVerified?: boolean
  joinedAt: string
  lastActiveAt: string
}

export interface UserProfile extends User {
  portfolio: Portfolio
  preferences: UserPreferences
  notifications: NotificationSettings
  referrals: ReferralData
}

export interface Portfolio {
  totalValue: string
  totalYield: string
  positions: UserPortfolioPosition[]
  nfts: NFTHolding[]
  transactions: Transaction[]
}

export interface NFTHolding {
  tokenId: string
  contractAddress: string
  chainId: number
  name: string
  image: string
  floorPrice?: string
  lastPrice?: string
  acquiredAt: string
  yieldGenerated?: string
}

export interface UserPortfolioPosition {
  poolId: string
  poolName: string
  amount: string
  currentValue: string
  yieldEarned: string
  depositedAt: string
  apy: number
  isLocked: boolean
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdraw' | 'claim' | 'mint' | 'transfer'
  amount: string
  token: string
  poolId?: string
  transactionHash: string
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  gasCost?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  currency: string
  language: string
  autoCompound: boolean
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  notifications: boolean
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  types: {
    yieldUpdates: boolean
    poolAlerts: boolean
    rewardClaims: boolean
    priceAlerts: boolean
    security: boolean
  }
}

export interface ReferralData {
  code: string
  totalReferred: number
  totalEarned: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  bonusRate: number
}