"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, Address } from "viem";
import { base } from "wagmi/chains";

const BASE_APP_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "getCurrentPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenAmount", "type": "uint256"}],
    "name": "calculateCost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenAmount", "type": "uint256"}],
    "name": "buyTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractInfo",
    "outputs": [
      {"internalType": "uint256", "name": "_totalSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "_totalSold", "type": "uint256"},
      {"internalType": "uint256", "name": "_currentPrice", "type": "uint256"},
      {"internalType": "uint256", "name": "_contractBalance", "type": "uint256"},
      {"internalType": "bool", "name": "_tradingEnabled", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tradingEnabled",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract address from environment variables
const BASE_APP_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_BASE_APP_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;

export function useBaseAppToken() {
  const { address, isConnected } = useAccount();
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract data
  const { data: contractInfo } = useReadContract({
    address: BASE_APP_TOKEN_ADDRESS,
    abi: BASE_APP_TOKEN_ABI,
    functionName: "getContractInfo",
    chainId: base.id,
  });

  const { data: userBalance } = useReadContract({
    address: BASE_APP_TOKEN_ADDRESS,
    abi: BASE_APP_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
  });

  const { data: currentPrice } = useReadContract({
    address: BASE_APP_TOKEN_ADDRESS,
    abi: BASE_APP_TOKEN_ABI,
    functionName: "getCurrentPrice",
    chainId: base.id,
  });

  const { data: purchaseCost } = useReadContract({
    address: BASE_APP_TOKEN_ADDRESS,
    abi: BASE_APP_TOKEN_ABI,
    functionName: "calculateCost",
    args: purchaseAmount ? [parseEther(purchaseAmount)] : undefined,
    chainId: base.id,
    query: {
      enabled: !!purchaseAmount && !isNaN(parseFloat(purchaseAmount)),
    },
  });

  const buyTokens = async () => {
    if (!purchaseAmount || !purchaseCost || !isConnected) return;

    try {
      setIsLoading(true);
      await writeContract({
        address: BASE_APP_TOKEN_ADDRESS,
        abi: BASE_APP_TOKEN_ABI,
        functionName: "buyTokens",
        args: [parseEther(purchaseAmount)],
        value: purchaseCost,
        chainId: base.id,
      });
    } catch (err) {
      console.error("Purchase failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTokenAmount = (amount: bigint | undefined) => {
    if (!amount) return "0";
    return parseFloat(formatEther(amount)).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  const formatPrice = (price: bigint | undefined) => {
    if (!price) return "0";
    return formatEther(price);
  };

  return {
    // State
    purchaseAmount,
    setPurchaseAmount,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    isConnected,

    // Contract data
    totalSupply: contractInfo ? formatTokenAmount(contractInfo[0]) : "0",
    totalSold: contractInfo ? formatTokenAmount(contractInfo[1]) : "0",
    contractBalance: contractInfo ? formatTokenAmount(contractInfo[3]) : "0",
    tradingEnabled: contractInfo ? contractInfo[4] : false,
    userBalance: formatTokenAmount(userBalance),
    currentPrice: formatPrice(currentPrice),
    purchaseCost: purchaseCost ? formatEther(purchaseCost) : "0",

    // Functions
    buyTokens,
    formatTokenAmount,
    formatPrice,
  };
}