// Samish Creator Token utilities and constants

export const SAMISH_CREATOR_CONFIG = {
  creator: '0x086bb3d739460897B24d68E73b5c8b5FF09781',
  platform: 'Zora Network',
  requiredAmount: 10, // $10 worth
  burnPercentage: 50, // 50% burned
  lotteryPercentage: 50, // 50% goes to lottery
  chainId: 7777777, // Zora mainnet
};

export const SAMISH_TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface TokenPurchaseResult {
  success: boolean;
  poolId: string;
  burnAmount: number;
  lotteryAmount: number;
  transactionHash: string;
  timestamp: Date;
}

export interface TokenBurnData {
  totalBurned: number;
  userBurned: number;
  lotteryPool: number;
  lastBurnTimestamp: Date;
}

export function calculateTokenAmounts(usdAmount: number): {
  burnAmount: number;
  lotteryAmount: number;
} {
  const burnAmount = usdAmount * (SAMISH_CREATOR_CONFIG.burnPercentage / 100);
  const lotteryAmount = usdAmount * (SAMISH_CREATOR_CONFIG.lotteryPercentage / 100);

  return { burnAmount, lotteryAmount };
}

export function generatePurchaseId(): string {
  return `samish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validatePurchaseAmount(amount: number): boolean {
  return amount >= SAMISH_CREATOR_CONFIG.requiredAmount;
}

export function formatTokenPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Mock function for token price - in production this would fetch from an API
export function getCurrentTokenPrice(): Promise<number> {
  return Promise.resolve(0.05); // $0.05 per token
}

// Mock function for burn transaction - in production this would interact with the contract
export async function burnTokens(amount: number): Promise<TokenPurchaseResult> {
  const { burnAmount, lotteryAmount } = calculateTokenAmounts(amount);

  return {
    success: true,
    poolId: generatePurchaseId(),
    burnAmount,
    lotteryAmount,
    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: new Date(),
  };
}

// Mock function for checking token balance - in production this would query the contract
export async function getTokenBalance(address: string): Promise<number> {
  // Return a random balance for demo purposes
  return Math.random() * 1000;
}

// Mock function for total burned amount - in production this would query the contract
export async function getTotalBurnedAmount(): Promise<TokenBurnData> {
  return {
    totalBurned: Math.random() * 100000,
    userBurned: Math.random() * 1000,
    lotteryPool: Math.random() * 50000,
    lastBurnTimestamp: new Date(),
  };
}