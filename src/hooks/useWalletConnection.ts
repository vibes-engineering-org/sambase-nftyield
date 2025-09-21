import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { useCallback } from "react";

export function useWalletConnection() {
  const { address, isConnected, chainId, chain } = useAccount();
  const { connectors, connect, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address: address,
  });

  const connectWallet = useCallback(async (connector?: any) => {
    try {
      const selectedConnector = connector || connectors[0];
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

  const isReady = isConnected && address && !isPending;

  return {
    // Connection status
    address,
    isConnected,
    isReady,
    chainId,
    chain,

    // Balance info
    balance,
    isLoadingBalance,

    // Connection actions
    connectWallet,
    disconnectWallet,
    isPending,
    connectError,

    // Available connectors
    connectors,

    // Utility functions
    formatAddress,
    getChainName,

    // Formatted values
    formattedAddress: formatAddress(address),
    chainName: getChainName(chainId),
  };
}

export default useWalletConnection;