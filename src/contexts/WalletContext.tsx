"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect, useBalance, useReadContracts } from "wagmi";
import { formatEther, parseEther } from "viem";

interface WalletContextType {
  // Connection status
  address: string | undefined;
  isConnected: boolean;
  isReady: boolean;
  chainId: number | undefined;

  // Balance info
  balance: any;

  // Connection actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isPending: boolean;
  connectError: Error | null;

  // Token verification
  bappBalance: string;
  hasBappTokens: boolean;
  hasUsedNFTYield: boolean;
  hasBurnedSamish: boolean;
  isTokenVerified: boolean;

  // Admin configuration
  minBappAmount: string;
  updateMinBappAmount: (amount: string) => void;

  // Utility functions
  formatAddress: (addr?: string) => string;
  chainName: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// $BAPP token contract address (Base network)
const BAPP_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual address
const SAMISH_TOKEN_ADDRESS = "0x0987654321098765432109876543210987654321"; // Replace with actual address

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const;

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected, chainId, chain } = useAccount();
  const { connectors, connect, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  // Local state for verification and configuration
  const [minBappAmount, setMinBappAmount] = useState("1000"); // Default minimum $BAPP tokens
  const [hasUsedNFTYield, setHasUsedNFTYield] = useState(false);
  const [hasBurnedSamish, setHasBurnedSamish] = useState(false);

  // Read $BAPP token balance
  const { data: contractReads } = useReadContracts({
    contracts: [
      {
        address: BAPP_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
    ],
    query: {
      enabled: !!address && isConnected,
    },
  });

  const bappBalanceRaw = contractReads?.[0]?.result || 0n;
  const bappBalance = formatEther(bappBalanceRaw);
  const hasBappTokens = parseFloat(bappBalance) >= parseFloat(minBappAmount);

  // Check NFTYield protocol usage from localStorage
  useEffect(() => {
    const checkNFTYieldUsage = () => {
      try {
        const savedPools = localStorage.getItem('nftyield_pools');
        if (savedPools) {
          const pools = JSON.parse(savedPools);
          return pools.some((pool: any) => pool.status === "active" || pool.status === "completed");
        }
      } catch (e) {
        console.warn('Failed to parse NFTYield pools:', e);
      }
      return false;
    };

    const checkSamishBurn = () => {
      try {
        const burnData = localStorage.getItem('nftyield_token_lock');
        if (burnData) {
          const data = JSON.parse(burnData);
          return data.hasTokensLocked && data.poolId;
        }
      } catch (e) {
        console.warn('Failed to parse Samish burn data:', e);
      }
      return false;
    };

    setHasUsedNFTYield(checkNFTYieldUsage());
    setHasBurnedSamish(checkSamishBurn());
  }, []);

  // Load admin configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('wallet_admin_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.minBappAmount) {
          setMinBappAmount(config.minBappAmount);
        }
      } catch (e) {
        console.warn('Failed to parse admin config:', e);
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const selectedConnector = connectors[0];
      if (selectedConnector) {
        await connect({ connector: selectedConnector });
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
      throw err;
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const formatAddress = useCallback((addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  const getChainName = useCallback((id?: number) => {
    if (!id) return "Unknown Chain";

    const chains: { [key: number]: string } = {
      1: "Ethereum",
      8453: "Base",
      42161: "Arbitrum",
      10: "Optimism",
      42220: "Celo",
      100: "Gnosis",
    };
    return chains[id] || `Chain ${id}`;
  }, []);

  const updateMinBappAmount = useCallback((amount: string) => {
    setMinBappAmount(amount);

    // Save to localStorage
    const config = { minBappAmount: amount };
    localStorage.setItem('wallet_admin_config', JSON.stringify(config));
  }, []);

  const isReady = Boolean(isConnected && address && !isPending);
  const chainName = getChainName(chainId);

  // Token verification logic
  const isTokenVerified = Boolean(isConnected && hasBappTokens && hasUsedNFTYield && hasBurnedSamish);

  const value: WalletContextType = {
    // Connection status
    address,
    isConnected,
    isReady,
    chainId,

    // Balance info
    balance,

    // Connection actions
    connectWallet,
    disconnectWallet,
    isPending,
    connectError,

    // Token verification
    bappBalance,
    hasBappTokens,
    hasUsedNFTYield,
    hasBurnedSamish,
    isTokenVerified,

    // Admin configuration
    minBappAmount,
    updateMinBappAmount,

    // Utility functions
    formatAddress,
    chainName,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}