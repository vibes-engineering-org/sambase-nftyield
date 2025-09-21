import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';

// Contract configuration
const SPLITS_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Will be updated after deployment
const MARKETING_WALLET = "0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2";
const MARKETING_PERCENTAGE = 10;

const SPLITS_CONTRACT_ABI = [
  {
    inputs: [
      { name: "_recipients", type: "address[]" },
      { name: "_percentages", type: "uint256[]" },
      { name: "_name", type: "string" }
    ],
    name: "createSplit",
    outputs: [{ name: "splitId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_splitId", type: "uint256" }],
    name: "sendToSplit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "_splitId", type: "uint256" },
      { name: "_token", type: "address" },
      { name: "_amount", type: "uint256" }
    ],
    name: "sendTokensToSplit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_splitId", type: "uint256" }],
    name: "getSplit",
    outputs: [
      { name: "recipients", type: "address[]" },
      { name: "percentages", type: "uint256[]" },
      { name: "totalReceived", type: "uint256" },
      { name: "totalDistributed", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "name", type: "string" },
      { name: "createdAt", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserSplits",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export interface SplitData {
  id: number;
  name: string;
  recipients: string[];
  percentages: number[];
  totalReceived: bigint;
  totalDistributed: bigint;
  isActive: boolean;
  createdAt: number;
}

export interface CreateSplitParams {
  recipients: string[];
  percentages: number[];
  name: string;
}

export interface SendFundsParams {
  splitId: number;
  amount: string;
}

export interface SendTokensParams {
  splitId: number;
  tokenAddress: string;
  amount: string;
}

export function useSplitsContract() {
  const { address, isConnected } = useAccount();
  const [userSplits, setUserSplits] = useState<SplitData[]>([]);

  // Check if contract is deployed
  const isContractDeployed = SPLITS_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Read user's splits
  const { data: userSplitIds, isLoading: isLoadingUserSplits, refetch: refetchUserSplits } = useReadContract({
    address: SPLITS_CONTRACT_ADDRESS as `0x${string}`,
    abi: SPLITS_CONTRACT_ABI,
    functionName: "getUserSplits",
    args: address ? [address] : undefined,
    query: { enabled: isContractDeployed && !!address }
  });

  // Write contract hooks
  const {
    writeContract: writeCreateSplit,
    data: createHash,
    isPending: isCreating,
    error: createError
  } = useWriteContract();

  const {
    writeContract: writeSendFunds,
    data: sendHash,
    isPending: isSending,
    error: sendError
  } = useWriteContract();

  const {
    writeContract: writeSendTokens,
    data: sendTokensHash,
    isPending: isSendingTokens,
    error: sendTokensError
  } = useWriteContract();

  // Transaction receipts
  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { isLoading: isSendConfirming, isSuccess: isSendSuccess } = useWaitForTransactionReceipt({
    hash: sendHash,
  });

  const { isLoading: isSendTokensConfirming, isSuccess: isSendTokensSuccess } = useWaitForTransactionReceipt({
    hash: sendTokensHash,
  });

  // Create split function
  const createSplit = async ({ recipients, percentages, name }: CreateSplitParams) => {
    if (!isConnected || !isContractDeployed) {
      throw new Error("Wallet not connected or contract not deployed");
    }

    // Validate inputs
    if (recipients.length === 0) {
      throw new Error("At least one recipient required");
    }

    if (recipients.length !== percentages.length) {
      throw new Error("Recipients and percentages arrays must have same length");
    }

    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0) + MARKETING_PERCENTAGE;
    if (totalPercentage > 100) {
      throw new Error("Total percentage cannot exceed 100%");
    }

    // Convert percentages to basis points (1% = 100 basis points)
    const basisPointPercentages = percentages.map(p => BigInt(Math.floor(p * 100)));

    return writeCreateSplit({
      address: SPLITS_CONTRACT_ADDRESS as `0x${string}`,
      abi: SPLITS_CONTRACT_ABI,
      functionName: "createSplit",
      args: [recipients as `0x${string}`[], basisPointPercentages, name],
    });
  };

  // Send ETH to split
  const sendFunds = async ({ splitId, amount }: SendFundsParams) => {
    if (!isConnected || !isContractDeployed) {
      throw new Error("Wallet not connected or contract not deployed");
    }

    return writeSendFunds({
      address: SPLITS_CONTRACT_ADDRESS as `0x${string}`,
      abi: SPLITS_CONTRACT_ABI,
      functionName: "sendToSplit",
      args: [BigInt(splitId)],
      value: parseEther(amount),
    });
  };

  // Send ERC20 tokens to split
  const sendTokens = async ({ splitId, tokenAddress, amount }: SendTokensParams) => {
    if (!isConnected || !isContractDeployed) {
      throw new Error("Wallet not connected or contract not deployed");
    }

    return writeSendTokens({
      address: SPLITS_CONTRACT_ADDRESS as `0x${string}`,
      abi: SPLITS_CONTRACT_ABI,
      functionName: "sendTokensToSplit",
      args: [BigInt(splitId), tokenAddress as `0x${string}`, parseEther(amount)],
    });
  };

  // Get split data by ID
  const getSplitById = async (splitId: number) => {
    if (!isContractDeployed) return null;

    // This would require a separate useReadContract hook or manual contract call
    // For now, return placeholder
    return null;
  };

  // Refresh user splits after successful transactions
  useEffect(() => {
    if (isCreateSuccess || isSendSuccess || isSendTokensSuccess) {
      refetchUserSplits();
    }
  }, [isCreateSuccess, isSendSuccess, isSendTokensSuccess, refetchUserSplits]);

  return {
    // Contract info
    contractAddress: SPLITS_CONTRACT_ADDRESS,
    isContractDeployed,
    marketingWallet: MARKETING_WALLET,
    marketingPercentage: MARKETING_PERCENTAGE,

    // Data
    userSplitIds,
    userSplits,
    isLoadingUserSplits,

    // Create split
    createSplit,
    isCreating: isCreating || isCreateConfirming,
    isCreateSuccess,
    createError,

    // Send funds (ETH)
    sendFunds,
    isSending: isSending || isSendConfirming,
    isSendSuccess,
    sendError,

    // Send tokens (ERC20)
    sendTokens,
    isSendingTokens: isSendingTokens || isSendTokensConfirming,
    isSendTokensSuccess,
    sendTokensError,

    // Utilities
    getSplitById,
    refetchUserSplits,
  };
}

export default useSplitsContract;