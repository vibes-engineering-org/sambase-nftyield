"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits, formatUnits, Address, parseEther } from "viem";
import { useToast } from "~/hooks/use-toast";
import { base } from "wagmi/chains";

// NFT Yield Pool ABI
const NFT_YIELD_POOL_ABI = [
  {
    name: "createPool",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "nftCollection", type: "address" },
      { name: "rewardToken", type: "address" },
      { name: "totalRewardAmount", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "minimumNFTBalance", type: "uint256" },
      { name: "maxParticipants", type: "uint256" },
      { name: "poolType", type: "uint8" }
    ],
    outputs: []
  },
  {
    name: "joinPool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: []
  },
  {
    name: "claimRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: []
  },
  {
    name: "completePool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: []
  },
  {
    name: "addToWhitelist",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "users", type: "address[]" }
    ],
    outputs: []
  },
  {
    name: "calculatePendingRewards",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "user", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getPoolDetails",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "poolId", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "nftCollection", type: "address" },
          { name: "rewardToken", type: "address" },
          { name: "totalRewardAmount", type: "uint256" },
          { name: "rewardPerNFT", type: "uint256" },
          { name: "duration", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "endTime", type: "uint256" },
          { name: "participantCount", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "isCompleted", type: "bool" },
          { name: "minimumNFTBalance", type: "uint256" },
          { name: "maxParticipants", type: "uint256" },
          { name: "poolType", type: "uint8" }
        ]
      },
      { name: "participants", type: "address[]" },
      { name: "totalNFTsInPool", type: "uint256" }
    ]
  },
  {
    name: "getUserActivePools",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }]
  },
  {
    name: "getCurrentPoolId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "pools",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "poolId", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "nftCollection", type: "address" },
      { name: "rewardToken", type: "address" },
      { name: "totalRewardAmount", type: "uint256" },
      { name: "rewardPerNFT", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "participantCount", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "isCompleted", type: "bool" },
      { name: "minimumNFTBalance", type: "uint256" },
      { name: "maxParticipants", type: "uint256" },
      { name: "poolType", type: "uint8" }
    ]
  },
  {
    name: "poolParticipants",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" }
    ],
    outputs: [
      { name: "user", type: "address" },
      { name: "nftBalance", type: "uint256" },
      { name: "rewardsClaimed", type: "uint256" },
      { name: "joinTime", type: "uint256" },
      { name: "isActive", type: "bool" }
    ]
  }
] as const;

// Pool types
export enum PoolType {
  PUBLIC = 0,
  WHITELIST = 1,
  PREMIUM = 2
}

interface YieldPool {
  poolId: number;
  creator: string;
  nftCollection: string;
  rewardToken: string;
  totalRewardAmount: bigint;
  rewardPerNFT: bigint;
  duration: number;
  startTime: number;
  endTime: number;
  participantCount: number;
  isActive: boolean;
  isCompleted: boolean;
  minimumNFTBalance: number;
  maxParticipants: number;
  poolType: PoolType;
}

interface Participant {
  user: string;
  nftBalance: number;
  rewardsClaimed: bigint;
  joinTime: number;
  isActive: boolean;
}

// Contract address - UPDATE WITH DEPLOYED ADDRESS
const NFT_YIELD_POOL_ADDRESS = "0x2222222222222222222222222222222222222222" as Address;

export function useNFTYieldPool() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, isPending: isContractPending } = useWriteContract();

  // Read current pool ID
  const { data: currentPoolId } = useReadContract({
    address: NFT_YIELD_POOL_ADDRESS,
    abi: NFT_YIELD_POOL_ABI,
    functionName: "getCurrentPoolId",
    chainId: base.id,
  });

  // Get user's active pools
  const { data: userActivePools } = useReadContract({
    address: NFT_YIELD_POOL_ADDRESS,
    abi: NFT_YIELD_POOL_ABI,
    functionName: "getUserActivePools",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  // Create a new yield pool
  const createPool = useCallback(async (
    nftCollection: string,
    rewardToken: string,
    totalRewardAmount: string,
    duration: number, // in seconds
    minimumNFTBalance: number,
    maxParticipants: number,
    poolType: PoolType,
    creationFee: string // in ETH
  ) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsProcessing(true);
      const rewardAmountWei = parseUnits(totalRewardAmount, 18);
      const creationFeeWei = parseEther(creationFee);

      await writeContract({
        address: NFT_YIELD_POOL_ADDRESS,
        abi: NFT_YIELD_POOL_ABI,
        functionName: "createPool",
        args: [
          nftCollection as Address,
          rewardToken as Address,
          rewardAmountWei,
          BigInt(duration),
          BigInt(minimumNFTBalance),
          BigInt(maxParticipants),
          poolType
        ],
        value: creationFeeWei,
        chainId: base.id,
      });

      toast({
        title: "Pool Creation Submitted",
        description: "Your yield pool is being created",
      });

      return true;
    } catch (error) {
      console.error("Pool creation failed:", error);
      toast({
        title: "Pool Creation Failed",
        description: "Failed to create yield pool",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Join an existing pool
  const joinPool = useCallback(async (poolId: number) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsProcessing(true);

      await writeContract({
        address: NFT_YIELD_POOL_ADDRESS,
        abi: NFT_YIELD_POOL_ABI,
        functionName: "joinPool",
        args: [BigInt(poolId)],
        chainId: base.id,
      });

      toast({
        title: "Joining Pool",
        description: `Joining pool #${poolId}`,
      });

      return true;
    } catch (error) {
      console.error("Joining pool failed:", error);
      toast({
        title: "Join Pool Failed",
        description: "Failed to join the pool",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Claim rewards from a pool
  const claimRewards = useCallback(async (poolId: number) => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: NFT_YIELD_POOL_ADDRESS,
        abi: NFT_YIELD_POOL_ABI,
        functionName: "claimRewards",
        args: [BigInt(poolId)],
        chainId: base.id,
      });

      toast({
        title: "Claiming Rewards",
        description: `Claiming rewards from pool #${poolId}`,
      });

      return true;
    } catch (error) {
      console.error("Claiming rewards failed:", error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Complete a pool
  const completePool = useCallback(async (poolId: number) => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: NFT_YIELD_POOL_ADDRESS,
        abi: NFT_YIELD_POOL_ABI,
        functionName: "completePool",
        args: [BigInt(poolId)],
        chainId: base.id,
      });

      toast({
        title: "Completing Pool",
        description: `Pool #${poolId} is being completed`,
      });

      return true;
    } catch (error) {
      console.error("Completing pool failed:", error);
      toast({
        title: "Complete Pool Failed",
        description: "Failed to complete pool",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Add users to whitelist
  const addToWhitelist = useCallback(async (poolId: number, users: string[]) => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: NFT_YIELD_POOL_ADDRESS,
        abi: NFT_YIELD_POOL_ABI,
        functionName: "addToWhitelist",
        args: [BigInt(poolId), users as Address[]],
        chainId: base.id,
      });

      toast({
        title: "Updating Whitelist",
        description: `Adding ${users.length} users to pool whitelist`,
      });

      return true;
    } catch (error) {
      console.error("Whitelist update failed:", error);
      toast({
        title: "Whitelist Update Failed",
        description: "Failed to update whitelist",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Get pool details
  const getPoolDetails = useCallback((poolId: number) => {
    return useReadContract({
      address: NFT_YIELD_POOL_ADDRESS,
      abi: NFT_YIELD_POOL_ABI,
      functionName: "getPoolDetails",
      args: [BigInt(poolId)],
      chainId: base.id,
    });
  }, []);

  // Calculate pending rewards
  const calculatePendingRewards = useCallback((poolId: number, user?: string) => {
    return useReadContract({
      address: NFT_YIELD_POOL_ADDRESS,
      abi: NFT_YIELD_POOL_ABI,
      functionName: "calculatePendingRewards",
      args: [BigInt(poolId), (user || address) as Address],
      chainId: base.id,
      query: {
        enabled: !!(user || address),
      },
    });
  }, [address]);

  // Get participant info
  const getParticipantInfo = useCallback((poolId: number, user?: string) => {
    return useReadContract({
      address: NFT_YIELD_POOL_ADDRESS,
      abi: NFT_YIELD_POOL_ABI,
      functionName: "poolParticipants",
      args: [BigInt(poolId), (user || address) as Address],
      chainId: base.id,
      query: {
        enabled: !!(user || address),
      },
    });
  }, [address]);

  // Helper functions
  const getPoolTypeName = (poolType: PoolType): string => {
    switch (poolType) {
      case PoolType.PUBLIC:
        return "Public";
      case PoolType.WHITELIST:
        return "Whitelist Only";
      case PoolType.PREMIUM:
        return "Premium (NFTY Holders)";
      default:
        return "Unknown";
    }
  };

  const formatPoolDuration = (duration: number): string => {
    const days = Math.floor(duration / (24 * 60 * 60));
    const hours = Math.floor((duration % (24 * 60 * 60)) / (60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  const calculatePoolProgress = (startTime: number, endTime: number): number => {
    const now = Math.floor(Date.now() / 1000);
    const totalDuration = endTime - startTime;
    const elapsed = now - startTime;

    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  return {
    // State
    isProcessing: isProcessing || isContractPending,
    currentPoolId: currentPoolId ? Number(currentPoolId) : 0,
    userActivePools: userActivePools as number[] | undefined,

    // Functions
    createPool,
    joinPool,
    claimRewards,
    completePool,
    addToWhitelist,
    getPoolDetails,
    calculatePendingRewards,
    getParticipantInfo,

    // Helpers
    getPoolTypeName,
    formatPoolDuration,
    calculatePoolProgress,

    // Constants
    NFT_YIELD_POOL_ADDRESS,
    PoolType,
  };
}