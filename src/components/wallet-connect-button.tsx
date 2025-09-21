"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useWalletConnection } from "~/hooks/useWalletConnection";
import { useToast } from "~/hooks/use-toast";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  LogOut,
  Shield
} from "lucide-react";

interface WalletConnectButtonProps {
  onConnectionChange?: (isConnected: boolean, address?: string) => void;
  showDetails?: boolean;
  variant?: "default" | "compact";
}

export default function WalletConnectButton({
  onConnectionChange,
  showDetails = true,
  variant = "default"
}: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const {
    address,
    isConnected,
    isReady,
    balance,
    chainName,
    formattedAddress,
    connectWallet,
    disconnectWallet,
    isPending,
    connectError,
    connectors
  } = useWalletConnection();

  const handleConnect = async () => {
    if (isConnected) {
      handleDisconnect();
      return;
    }

    try {
      setIsConnecting(true);
      await connectWallet();

      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${formattedAddress}`,
      });

      onConnectionChange?.(true, address);
    } catch (error) {
      console.error("Connection failed:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
      onConnectionChange?.(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
    onConnectionChange?.(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  // Compact variant for inline usage
  if (variant === "compact") {
    return (
      <Button
        onClick={handleConnect}
        disabled={isPending || isConnecting}
        className={`${isConnected ? "neon-button-success" : "neon-button"} text-sm`}
        size="sm"
      >
        {isPending || isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            {formattedAddress}
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </Button>
    );
  }

  // Full card variant
  return (
    <Card className="neon-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isConnected ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className={`text-lg ${isConnected ? "text-green-400" : "text-gray-400"}`}>
                {isConnected ? "Wallet Connected" : "Connect Wallet"}
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                {isConnected ? "Ready to interact with contracts" : "Connect to access all features"}
              </CardDescription>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-400" : "bg-red-400"
          }`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Connected to {chainName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Not connected</span>
            </div>
          )}
        </div>

        {/* Wallet Details */}
        {isConnected && showDetails && (
          <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm text-white font-mono">{formattedAddress}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-8 w-8 p-0 hover:bg-gray-700"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-700"
                  asChild
                >
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>

            {balance && (
              <div>
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-sm text-white">
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                {chainName}
              </Badge>
            </div>
          </div>
        )}

        {/* Connection Error */}
        {connectError && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-300">
                Connection failed: {connectError.message}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={isPending || isConnecting}
            className={`flex-1 ${isConnected ? "neon-button-danger" : "neon-button"} text-sm`}
          >
            {isPending || isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : isConnected ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
        </div>

        {/* Available Connectors */}
        {!isConnected && connectors.length > 0 && (
          <div className="text-xs text-gray-400">
            <p className="mb-1">Available wallets:</p>
            <div className="flex flex-wrap gap-1">
              {connectors.map((connector) => (
                <Badge key={connector.id} variant="outline" className="text-xs">
                  {connector.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}