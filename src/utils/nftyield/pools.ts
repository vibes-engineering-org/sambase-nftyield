/**
 * Yield Pool Management Utilities
 */

export interface YieldPool {
  id: string;
  name: string;
  protocol: string;
  contractAddress: string;
  apy: number;
  tvl: number;
  minimumStake: number;
  maximumStake?: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  supportedCollections: string[];
  lockupPeriod: number; // in days
  rewardToken: string;
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface PoolPosition {
  poolId: string;
  userAddress: string;
  stakedAssets: string[]; // NFT token IDs
  stakedValue: number;
  accruedRewards: number;
  stakingDate: Date;
  lastClaimDate?: Date;
  unlockDate: Date;
}

/**
 * Filter pools by risk level
 */
export function filterPoolsByRisk(
  pools: YieldPool[],
  riskLevels: string[]
): YieldPool[] {
  return pools.filter(pool => riskLevels.includes(pool.riskLevel));
}

/**
 * Sort pools by APY
 */
export function sortPoolsByAPY(
  pools: YieldPool[],
  ascending: boolean = false
): YieldPool[] {
  return [...pools].sort((a, b) => {
    const comparison = b.apy - a.apy;
    return ascending ? -comparison : comparison;
  });
}

/**
 * Find pools that support a specific collection
 */
export function findPoolsForCollection(
  pools: YieldPool[],
  collectionAddress: string
): YieldPool[] {
  return pools.filter(pool =>
    pool.supportedCollections.includes(collectionAddress) ||
    pool.supportedCollections.includes('*') // Wildcard for all collections
  );
}

/**
 * Calculate pool utilization rate
 */
export function calculateUtilizationRate(pool: YieldPool): number {
  if (!pool.maximumStake) return 0;
  return (pool.tvl / pool.maximumStake) * 100;
}

/**
 * Estimate rewards for a position
 */
export function estimateRewards(
  stakedValue: number,
  apy: number,
  stakingDays: number
): number {
  const dailyRate = apy / 365 / 100;
  return stakedValue * dailyRate * stakingDays;
}

/**
 * Check if NFT is eligible for a pool
 */
export function isNFTEligible(
  nftContractAddress: string,
  pool: YieldPool
): boolean {
  return pool.supportedCollections.includes(nftContractAddress) ||
         pool.supportedCollections.includes('*');
}

/**
 * Calculate time until unlock
 */
export function calculateTimeUntilUnlock(unlockDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  isUnlocked: boolean;
} {
  const now = new Date();
  const timeDiff = unlockDate.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isUnlocked: true };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isUnlocked: false };
}