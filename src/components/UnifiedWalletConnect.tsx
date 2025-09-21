"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useWallet } from "~/contexts/WalletContext";
import { useToast } from "~/hooks/use-toast";
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  LogOut,
  Shield,
  Coins,
  Flame,
  TrendingUp,
  Lock,
  Unlock
} from "lucide-react";

interface UnifiedWalletConnectProps {
  showDetails?: boolean;
  variant?: "full" | "compact" | "status";
  className?: string;
}

export default function UnifiedWalletConnect({
  showDetails = true,
  variant = "full",
  className = ""
}: UnifiedWalletConnectProps) {
  const {
    address,
    isConnected,
    connectWallet,
    disconnectWallet,
    isPending,
    balance,
    chainName,
    formatAddress,
    // Token verification
    bappBalance,
    hasBappTokens,
    hasUsedNFTYield,
    hasBurnedSamish,
    isTokenVerified,
    minBappAmount
  } = useWallet();

  const { toast } = useToast();

  const handleConnect = async () => {
    if (isConnected) {
      handleDisconnect();
      return;
    }

    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${formatAddress(address)}`,
      });
    } catch (error) {
      console.error("Connection failed:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
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
        disabled={isPending}
        className={`${isConnected ? "neon-button-success" : "neon-button"} text-sm ${className}`}
        size="sm"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            {formatAddress(address)}
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

  // Status variant for showing verification status
  if (variant === "status") {
    return (
      <Card className={`neon-card ${className}`}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isTokenVerified
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : isConnected
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-gray-600 to-gray-700"
              }`}>
                {isTokenVerified ? (
                  <Unlock className="w-4 h-4 text-white" />
                ) : isConnected ? (
                  <Lock className="w-4 h-4 text-white" />
                ) : (
                  <Wallet className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${
                    isTokenVerified ? "text-green-400" : isConnected ? "text-yellow-400" : "text-gray-400"
                  }`}>
                    {isTokenVerified ? "Verified" : isConnected ? "Connected" : "Not Connected"}
                  </span>
                  {isConnected && (
                    <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                      {chainName}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {isTokenVerified
                    ? "Full access granted"
                    : isConnected
                    ? "Token verification required"
                    : "Connect to continue"
                  }
                </p>
              </div>
            </div>
            {!isConnected && (
              <Button
                onClick={handleConnect}
                size="sm"
                className="neon-button text-xs"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Connect"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full card variant
  return (
    <Card className={`neon-card ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isTokenVerified
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : isConnected
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className={`text-lg ${
                isTokenVerified ? "text-green-400" : isConnected ? "text-yellow-400" : "text-gray-400"
              }`}>
                {isTokenVerified ? "Wallet Verified" : isConnected ? "Wallet Connected" : "Connect Wallet"}
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                {isTokenVerified
                  ? "Ready for all features"
                  : isConnected
                  ? "Token verification required"
                  : "Connect to access features"
                }
              </CardDescription>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            isTokenVerified ? "bg-green-400" : isConnected ? "bg-yellow-400" : "bg-red-400"
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
          <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/20 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm text-white font-mono">{formatAddress(address)}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyAddress}
                className="h-8 w-8 p-0 hover:bg-gray-700"
              >
                <Copy className="w-3 h-3" />
              </Button>
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

        {/* Token Verification Status */}
        {isConnected && showDetails && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-cyan-400">Access Requirements</h3>

            <div className="space-y-2">
              {/* $BAPP Token Balance */}
              <div className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg">
                <div className="flex items-center gap-2">
                  {hasBappTokens ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm">Hold ≥ {minBappAmount} $BAPP tokens</span>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  hasBappTokens ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"
                }`}>
                  <Coins className="w-3 h-3 mr-1" />
                  {parseFloat(bappBalance).toFixed(2)} BAPP
                </Badge>
              </div>

              {/* NFT Yield Protocol Usage */}
              <div className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg">
                <div className="flex items-center gap-2">
                  {hasUsedNFTYield ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm">Use NFT Yield Protocol</span>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  hasUsedNFTYield ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"
                }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {hasUsedNFTYield ? "Used" : "Required"}
                </Badge>
              </div>

              {/* Samish Token Burn */}
              <div className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg">
                <div className="flex items-center gap-2">
                  {hasBurnedSamish ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-sm">Burn $samish creator tokens</span>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  hasBurnedSamish ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"
                }`}>
                  <Flame className="w-3 h-3 mr-1" />
                  {hasBurnedSamish ? "Burned" : "Required"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Verification Summary */}
        {isConnected && (
          <div className={`p-3 rounded-lg border ${
            isTokenVerified
              ? "bg-green-500/10 border-green-500/20"
              : "bg-yellow-500/10 border-yellow-500/20"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isTokenVerified ? (
                <Unlock className="w-4 h-4 text-green-400" />
              ) : (
                <Lock className="w-4 h-4 text-yellow-400" />
              )}
              <span className={`font-medium text-sm ${
                isTokenVerified ? "text-green-400" : "text-yellow-400"
              }`}>
                {isTokenVerified ? "Full Access Granted" : "Verification Required"}
              </span>
            </div>
            <p className={`text-xs ${
              isTokenVerified ? "text-green-300" : "text-yellow-300"
            }`}>
              {isTokenVerified
                ? "You can access all features including exclusive community chat."
                : "Complete all requirements above to access premium features."
              }
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={isPending}
            className={`flex-1 ${isConnected ? "neon-button-danger" : "neon-button"} text-sm`}
          >
            {isPending ? (
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
      </CardContent>
    </Card>
  );
}