"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useReadContract, useWatchContractEvent } from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
import { useToast } from "~/hooks/use-toast";
import { base } from "wagmi/chains";

// NFTYIELD Token ABI
const NFTYIELD_TOKEN_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getUserTier",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "getUserDiscount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "pendingRewards",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "stakingInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "stakedAmount", type: "uint256" },
      { name: "lastUpdateTime", type: "uint256" },
      { name: "rewardDebt", type: "uint256" }
    ]
  },
  {
    name: "calculateVestedAmount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "beneficiary", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "stakeTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: []
  },
  {
    name: "unstakeTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: []
  },
  {
    name: "claimStakingRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "claimVestedTokens",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

// Contract address - UPDATE WITH DEPLOYED ADDRESS
const NFTYIELD_TOKEN_ADDRESS = "0x1111111111111111111111111111111111111111" as Address;

interface StakingInfo {
  stakedAmount: bigint;
  lastUpdateTime: bigint;
  rewardDebt: bigint;
}

export function useNFTYieldToken() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, isPending: isContractPending } = useWriteContract();

  // Read contract data
  const { data: balance } = useReadContract({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: totalSupply } = useReadContract({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    functionName: "totalSupply",
    chainId: base.id,
  });

  const { data: userTier } = useReadContract({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    functionName: "getUserTier",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: userDiscount } = useReadContract({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    functionName: "getUserDiscount",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: pendingRewards } = useReadContract({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: stakingInfo } = useReadContract({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    functionName: "stakingInfo",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  }) as { data: StakingInfo | undefined };

  const { data: vestedAmount } = useReadContract({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    functionName: "calculateVestedAmount",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  // Watch for staking events
  useWatchContractEvent({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    eventName: "TokensStaked",
    chainId: base.id,
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (log.args?.user === address) {
          toast({
            title: "Tokens Staked",
            description: `Successfully staked ${formatUnits(log.args?.amount || BigInt(0), 18)} NFTY`,
          });
        }
      });
    },
  });

  useWatchContractEvent({
    address: NFTYIELD_TOKEN_ADDRESS,
    abi: NFTYIELD_TOKEN_ABI,
    eventName: "RewardsClaimed",
    chainId: base.id,
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (log.args?.user === address) {
          toast({
            title: "Rewards Claimed",
            description: `Claimed ${formatUnits(log.args?.amount || BigInt(0), 18)} NFTY rewards`,
          });
        }
      });
    },
  });

  // Stake tokens
  const stakeTokens = useCallback(async (amount: string) => {
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
      const amountWei = parseUnits(amount, 18);

      await writeContract({
        address: NFTYIELD_TOKEN_ADDRESS,
        abi: NFTYIELD_TOKEN_ABI,
        functionName: "stakeTokens",
        args: [amountWei],
        chainId: base.id,
      });

      toast({
        title: "Staking Transaction Submitted",
        description: "Your tokens are being staked",
      });

      return true;
    } catch (error) {
      console.error("Staking failed:", error);
      toast({
        title: "Staking Failed",
        description: "Failed to stake tokens",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Unstake tokens
  const unstakeTokens = useCallback(async (amount: string) => {
    if (!address) return false;

    try {
      setIsProcessing(true);
      const amountWei = parseUnits(amount, 18);

      await writeContract({
        address: NFTYIELD_TOKEN_ADDRESS,
        abi: NFTYIELD_TOKEN_ABI,
        functionName: "unstakeTokens",
        args: [amountWei],
        chainId: base.id,
      });

      toast({
        title: "Unstaking Transaction Submitted",
        description: "Your tokens are being unstaked",
      });

      return true;
    } catch (error) {
      console.error("Unstaking failed:", error);
      toast({
        title: "Unstaking Failed",
        description: "Failed to unstake tokens",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Claim staking rewards
  const claimStakingRewards = useCallback(async () => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: NFTYIELD_TOKEN_ADDRESS,
        abi: NFTYIELD_TOKEN_ABI,
        functionName: "claimStakingRewards",
        chainId: base.id,
      });

      toast({
        title: "Claiming Rewards",
        description: "Your staking rewards are being claimed",
      });

      return true;
    } catch (error) {
      console.error("Claiming rewards failed:", error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim staking rewards",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Claim vested tokens
  const claimVestedTokens = useCallback(async () => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: NFTYIELD_TOKEN_ADDRESS,
        abi: NFTYIELD_TOKEN_ABI,
        functionName: "claimVestedTokens",
        chainId: base.id,
      });

      toast({
        title: "Claiming Vested Tokens",
        description: "Your vested tokens are being claimed",
      });

      return true;
    } catch (error) {
      console.error("Claiming vested tokens failed:", error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim vested tokens",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Approve tokens for spending
  const approveTokens = useCallback(async (spender: string, amount: string) => {
    if (!address) return false;

    try {
      setIsProcessing(true);
      const amountWei = parseUnits(amount, 18);

      await writeContract({
        address: NFTYIELD_TOKEN_ADDRESS,
        abi: NFTYIELD_TOKEN_ABI,
        functionName: "approve",
        args: [spender as Address, amountWei],
        chainId: base.id,
      });

      toast({
        title: "Approval Transaction Submitted",
        description: "Token approval is being processed",
      });

      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve tokens",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Helper functions
  const getTierName = (tier: number): string => {
    switch (tier) {
      case 0: return "Bronze";
      case 1: return "Silver";
      case 2: return "Gold";
      case 3: return "Platinum";
      case 4: return "Diamond";
      default: return "Unknown";
    }
  };

  const getTierRequirement = (tier: number): string => {
    switch (tier) {
      case 1: return "1,000 NFTY";
      case 2: return "10,000 NFTY";
      case 3: return "50,000 NFTY";
      case 4: return "100,000 NFTY";
      default: return "0 NFTY";
    }
  };

  return {
    // State
    isProcessing: isProcessing || isContractPending,
    balance: balance ? formatUnits(balance, 18) : "0",
    totalSupply: totalSupply ? formatUnits(totalSupply, 18) : "0",
    userTier: Number(userTier || 0),
    userDiscount: Number(userDiscount || 0),
    pendingRewards: pendingRewards ? formatUnits(pendingRewards, 18) : "0",
    stakedAmount: stakingInfo ? formatUnits(stakingInfo.stakedAmount, 18) : "0",
    vestedAmount: vestedAmount ? formatUnits(vestedAmount, 18) : "0",

    // Functions
    stakeTokens,
    unstakeTokens,
    claimStakingRewards,
    claimVestedTokens,
    approveTokens,

    // Helpers
    getTierName,
    getTierRequirement,

    // Constants
    NFTYIELD_TOKEN_ADDRESS,
  };
}