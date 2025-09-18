export interface NFTYieldToken {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  maxSupply: string;
  mintPrice: string;
  stakingRewardRate: number;
  burnRate: number;
}

export interface TokenBalance {
  address: string;
  balance: string;
  staked: string;
  rewards: string;
  totalEarned: string;
}

export interface TokenTransaction {
  id: string;
  type: "mint" | "burn" | "stake" | "unstake" | "reward" | "transfer";
  amount: string;
  timestamp: Date;
  from?: string;
  to?: string;
  txHash?: string;
}

export interface StakingPool {
  id: string;
  name: string;
  tokenAddress: string;
  stakingReward: number;
  lockPeriod: number;
  totalStaked: string;
  userStaked: string;
  rewardsAccrued: string;
  isActive: boolean;
}

export interface TokenMetrics {
  totalSupply: string;
  circulatingSupply: string;
  totalBurned: string;
  totalStaked: string;
  holders: number;
  marketCap: string;
  price: string;
}

export interface InvestmentTier {
  name: string;
  minAmount: string;
  benefits: string[];
  multiplier: number;
  lockPeriod: number;
}