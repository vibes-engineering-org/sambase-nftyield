/**
 * NFTYield Calculation Utilities
 */

export interface YieldCalculation {
  principal: number;
  apy: number;
  stakingPeriod: number;
  estimatedYield: number;
  totalReturn: number;
}

/**
 * Calculate yield for a given NFT value, APY, and staking period
 */
export function calculateYield(
  nftValue: number,
  apyPercent: number,
  stakingDays: number
): YieldCalculation {
  const apy = apyPercent / 100;
  const dailyRate = apy / 365;
  const estimatedYield = nftValue * dailyRate * stakingDays;
  const totalReturn = nftValue + estimatedYield;

  return {
    principal: nftValue,
    apy: apyPercent,
    stakingPeriod: stakingDays,
    estimatedYield,
    totalReturn
  };
}

/**
 * Calculate compound yield with reinvestment
 */
export function calculateCompoundYield(
  nftValue: number,
  apyPercent: number,
  stakingDays: number,
  compoundFrequency: number = 365 // daily compounding by default
): number {
  const apy = apyPercent / 100;
  const periodsPerYear = compoundFrequency;
  const years = stakingDays / 365;

  const compoundedValue = nftValue * Math.pow(
    (1 + apy / periodsPerYear),
    periodsPerYear * years
  );

  return compoundedValue - nftValue;
}

/**
 * Calculate risk-adjusted returns
 */
export function calculateRiskAdjustedReturn(
  expectedYield: number,
  riskScore: number // 0-100, where 100 is highest risk
): number {
  const riskMultiplier = 1 - (riskScore / 200); // Reduce expected yield by risk factor
  return expectedYield * riskMultiplier;
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency: string = 'ETH'): string {
  return `${value.toFixed(4)} ${currency}`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}