export interface YieldPool {
  id: string;
  nftCollection: string;
  tokenAddress: string;
  duration: number;
  rewardPercentage: number;
  contributionAmount: string;
  status: "active" | "pending" | "completed";
  createdAt: Date;
  estimatedYield?: number;
  dailyYield?: number;
  apy?: number;
}

export interface CustomPool {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  duration: number;
  rewardType: string;
  status: "active" | "pending" | "completed";
  createdAt: Date;
}

export interface LotteryEntry {
  id: string;
  poolId: string;
  amount: number;
  timestamp: Date;
  isWinner?: boolean;
}

export interface ReferralBonus {
  id: string;
  referrerAddress: string;
  refereeAddress: string;
  bonusAmount: number;
  timestamp: Date;
}

export interface NFTRewardsData {
  collection: string;
  token: string;
  totalRewards: number;
  dailyRate: number;
  participants: number;
  averageYield: number;
  floorPrice: number;
  volume24h: number;
  lastUpdated: string;
  historicalData: Array<{
    date: string;
    yield: number;
    volume: number;
  }>;
}

export interface PoolStatus {
  id: string;
  status: string;
  currentYield: number;
  totalContributions: number;
  participantCount: number;
  daysRemaining: number;
  lastUpdated: string;
}

// Utility functions
export function calculateYield(
  contributionAmount: number,
  rewardPercentage: number,
  duration: number
): { estimatedYield: number; dailyYield: number; apy: number } {
  const estimatedYield = contributionAmount * (rewardPercentage / 100);
  const dailyYield = estimatedYield / duration;
  const apy = (rewardPercentage / (duration / 365)) * 100;

  return { estimatedYield, dailyYield, apy };
}

export function formatTokenAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(2);
}

export function formatDuration(days: number): string {
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function generatePoolId(): string {
  return `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateLotteryChance(burnAmount: number, totalBurned: number): number {
  if (totalBurned === 0) return 0;
  return (burnAmount / totalBurned) * 100;
}

export function getPoolProgress(pool: YieldPool): number {
  const now = new Date();
  const start = new Date(pool.createdAt);
  const durationMs = pool.duration * 24 * 60 * 60 * 1000;
  const elapsed = now.getTime() - start.getTime();

  return Math.min(Math.max(elapsed / durationMs, 0), 1);
}

export function getTimeRemaining(pool: YieldPool): string {
  const now = new Date();
  const start = new Date(pool.createdAt);
  const durationMs = pool.duration * 24 * 60 * 60 * 1000;
  const end = new Date(start.getTime() + durationMs);
  const remaining = end.getTime() - now.getTime();

  if (remaining <= 0) return 'Completed';

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}