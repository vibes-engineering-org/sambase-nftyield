"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWatchContractEvent } from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
import { useToast } from "~/hooks/use-toast";
import { base } from "wagmi/chains";

// Contract ABI (simplified for demo - include only needed functions)
const TOKEN_BURN_ESCROW_ABI = [
  {
    name: "depositForPool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "totalAmount", type: "uint256" },
      { name: "poolDuration", type: "uint256" },
      { name: "poolId", type: "string" }
    ],
    outputs: []
  },
  {
    name: "burnTokensForPool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "string" }],
    outputs: []
  },
  {
    name: "completePool",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "string" }],
    outputs: []
  },
  {
    name: "refundEscrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "string" }],
    outputs: []
  },
  {
    name: "safetyRefund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "string" }],
    outputs: []
  },
  {
    name: "getPoolEscrow",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "string" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "burnAmount", type: "uint256" },
          { name: "escrowAmount", type: "uint256" },
          { name: "depositTime", type: "uint256" },
          { name: "poolDuration", type: "uint256" },
          { name: "depositor", type: "address" },
          { name: "poolId", type: "string" },
          { name: "burned", type: "bool" },
          { name: "refunded", type: "bool" },
          { name: "poolCompleted", type: "bool" }
        ]
      }
    ]
  },
  {
    name: "canCompletePool",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "string" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "canSafetyRefund",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "poolId", type: "string" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "totalBurned",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "userBurnedTotal",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

const ERC20_ABI = [
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
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

// Contract addresses (replace with actual deployed addresses)
const SAMISH_TOKEN_ADDRESS = "0x086bb3d90d719eb50d569e071b9987080ecb9781" as Address;
const ESCROW_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" as Address; // Replace with actual

interface EscrowDeposit {
  burnAmount: bigint;
  escrowAmount: bigint;
  depositTime: bigint;
  poolDuration: bigint;
  depositor: Address;
  poolId: string;
  burned: boolean;
  refunded: boolean;
  poolCompleted: boolean;
}

export function useTokenBurnEscrow() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { writeContract, isPending: isContractPending } = useWriteContract();

  // Read contract data
  const { data: totalBurned } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: TOKEN_BURN_ESCROW_ABI,
    functionName: "totalBurned",
    chainId: base.id,
  });

  const { data: userBurnedTotal } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: TOKEN_BURN_ESCROW_ABI,
    functionName: "userBurnedTotal",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: tokenBalance } = useReadContract({
    address: SAMISH_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: allowance } = useReadContract({
    address: SAMISH_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, ESCROW_CONTRACT_ADDRESS] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
    },
  });

  // Watch for contract events
  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: TOKEN_BURN_ESCROW_ABI,
    eventName: "TokensBurned",
    chainId: base.id,
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (log.args?.user === address) {
          toast({
            title: "Tokens Burned Successfully",
            description: `Burned ${formatUnits(log.args?.amount || BigInt(0), 18)} SAMISH tokens`,
          });
        }
      });
    },
  });

  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: TOKEN_BURN_ESCROW_ABI,
    eventName: "TokensRefunded",
    chainId: base.id,
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (log.args?.user === address) {
          toast({
            title: "Escrow Refunded",
            description: `Received ${formatUnits(log.args?.amount || BigInt(0), 18)} SAMISH tokens back`,
          });
        }
      });
    },
  });

  // Approve tokens
  const approveTokens = useCallback(async (amount: string) => {
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
        address: SAMISH_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ESCROW_CONTRACT_ADDRESS, amountWei],
        chainId: base.id,
      });

      toast({
        title: "Approval Submitted",
        description: "Token approval transaction submitted",
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

  // Deposit tokens for pool
  const depositForPool = useCallback(async (
    totalAmount: string,
    poolDurationDays: number,
    poolId: string
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
      const amountWei = parseUnits(totalAmount, 18);
      const durationSeconds = BigInt(poolDurationDays * 24 * 60 * 60);

      await writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: TOKEN_BURN_ESCROW_ABI,
        functionName: "depositForPool",
        args: [amountWei, durationSeconds, poolId],
        chainId: base.id,
      });

      toast({
        title: "Deposit Submitted",
        description: "Token deposit transaction submitted",
      });

      return true;
    } catch (error) {
      console.error("Deposit failed:", error);
      toast({
        title: "Deposit Failed",
        description: "Failed to deposit tokens",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Burn tokens for pool
  const burnTokensForPool = useCallback(async (poolId: string) => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: TOKEN_BURN_ESCROW_ABI,
        functionName: "burnTokensForPool",
        args: [poolId],
        chainId: base.id,
      });

      return true;
    } catch (error) {
      console.error("Burn failed:", error);
      toast({
        title: "Burn Failed",
        description: "Failed to burn tokens",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Complete pool
  const completePool = useCallback(async (poolId: string) => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: TOKEN_BURN_ESCROW_ABI,
        functionName: "completePool",
        args: [poolId],
        chainId: base.id,
      });

      toast({
        title: "Pool Completed",
        description: "Pool marked as completed, escrow can now be refunded",
      });

      return true;
    } catch (error) {
      console.error("Complete pool failed:", error);
      toast({
        title: "Complete Failed",
        description: "Failed to complete pool",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Refund escrow
  const refundEscrow = useCallback(async (poolId: string) => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: TOKEN_BURN_ESCROW_ABI,
        functionName: "refundEscrow",
        args: [poolId],
        chainId: base.id,
      });

      return true;
    } catch (error) {
      console.error("Refund failed:", error);
      toast({
        title: "Refund Failed",
        description: "Failed to refund escrow",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Safety refund
  const safetyRefund = useCallback(async (poolId: string) => {
    if (!address) return false;

    try {
      setIsProcessing(true);

      await writeContract({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: TOKEN_BURN_ESCROW_ABI,
        functionName: "safetyRefund",
        args: [poolId],
        chainId: base.id,
      });

      toast({
        title: "Safety Refund Processed",
        description: "Your tokens have been returned due to incomplete pool creation",
      });

      return true;
    } catch (error) {
      console.error("Safety refund failed:", error);
      toast({
        title: "Safety Refund Failed",
        description: "Failed to process safety refund",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [address, writeContract, toast]);

  // Get pool escrow details
  const getPoolEscrow = useCallback((poolId: string) => {
    return useReadContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: TOKEN_BURN_ESCROW_ABI,
      functionName: "getPoolEscrow",
      args: [poolId],
      chainId: base.id,
    });
  }, []);

  // Check if pool can be completed
  const canCompletePool = useCallback((poolId: string) => {
    return useReadContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: TOKEN_BURN_ESCROW_ABI,
      functionName: "canCompletePool",
      args: [poolId],
      chainId: base.id,
    });
  }, []);

  // Check if safety refund is available
  const canSafetyRefund = useCallback((poolId: string) => {
    return useReadContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: TOKEN_BURN_ESCROW_ABI,
      functionName: "canSafetyRefund",
      args: [poolId],
      chainId: base.id,
    });
  }, []);

  return {
    // State
    isProcessing: isProcessing || isContractPending,
    totalBurned: totalBurned ? formatUnits(totalBurned, 18) : "0",
    userBurnedTotal: userBurnedTotal ? formatUnits(userBurnedTotal, 18) : "0",
    tokenBalance: tokenBalance ? formatUnits(tokenBalance, 18) : "0",
    needsApproval: allowance ? allowance < parseUnits("10", 18) : true,

    // Functions
    approveTokens,
    depositForPool,
    burnTokensForPool,
    completePool,
    refundEscrow,
    safetyRefund,
    getPoolEscrow,
    canCompletePool,
    canSafetyRefund,

    // Constants
    SAMISH_TOKEN_ADDRESS,
    ESCROW_CONTRACT_ADDRESS,
  };
}