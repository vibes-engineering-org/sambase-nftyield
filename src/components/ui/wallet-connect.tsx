"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Wallet, LogOut, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useWalletConnection } from "~/hooks/useWalletConnection";

interface WalletConnectProps {
  onConnected?: () => void;
  showHeader?: boolean;
  className?: string;
}

export function WalletConnect({
  onConnected,
  showHeader = true,
  className = ""
}: WalletConnectProps) {
  const {
    address,
    isConnected,
    chainId,
    connectors,
    connectWallet,
    disconnectWallet,
    isPending,
    connectError,
    formattedAddress,
    chainName
  } = useWalletConnection();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true);
      await connectWallet(connector);
      if (onConnected) {
        onConnected();
      }
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (isConnected && address) {
    return (
      <Card className={`bg-gray-900/90 border-gray-700 ${className}`}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Wallet Connected
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                {formattedAddress}
              </p>
              <Badge variant="secondary" className="text-xs">
                {chainName}
              </Badge>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900/90 border-gray-700 ${className}`}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </CardTitle>
          <CardDescription className="text-gray-400">
            Connect your wallet to interact with splits
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {connectors.length === 0 ? (
          <div className="text-center p-4">
            <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-yellow-400 text-sm">No wallet connectors available</p>
          </div>
        ) : (
          connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              disabled={isPending || isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isPending || isConnecting ? "Connecting..." : `Connect ${connector.name}`}
            </Button>
          ))
        )}

        {connectError && (
          <div className="p-3 bg-red-900/20 border border-red-600 rounded-lg">
            <p className="text-red-400 text-xs">
              Connection failed: {connectError.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WalletConnect;