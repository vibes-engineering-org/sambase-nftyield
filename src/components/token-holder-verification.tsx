"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useNFTYieldToken } from "~/hooks/useNFTYieldToken";
import { useAccount } from "wagmi";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Coins,
  TrendingUp,
  Lock,
  Unlock,
  Crown,
  Star,
  Loader2
} from "lucide-react";

interface TokenHolderVerificationProps {
  minimumTokens?: string;
  minimumStaked?: string;
  onVerificationChange?: (isVerified: boolean, details: VerificationDetails) => void;
  showDetails?: boolean;
}

interface VerificationDetails {
  isTokenHolder: boolean;
  hasStakedTokens: boolean;
  hasActivePool: boolean;
  balance: string;
  stakedAmount: string;
  userTier: number;
  tierName: string;
}

export default function TokenHolderVerification({
  minimumTokens = "1000",
  minimumStaked = "500",
  onVerificationChange,
  showDetails = true
}: TokenHolderVerificationProps) {
  const { isConnected } = useAccount();
  const [verificationStatus, setVerificationStatus] = useState<VerificationDetails>({
    isTokenHolder: false,
    hasStakedTokens: false,
    hasActivePool: false,
    balance: "0",
    stakedAmount: "0",
    userTier: 0,
    tierName: "Bronze"
  });

  const {
    balance,
    stakedAmount,
    userTier,
    getTierName,
    isProcessing
  } = useNFTYieldToken();

  // Check local storage for active pools
  const checkActivePool = () => {
    try {
      const savedPools = localStorage.getItem('nftyield_pools');
      if (savedPools) {
        const pools = JSON.parse(savedPools);
        return pools.some((pool: any) => pool.status === "active");
      }
    } catch (e) {
      console.warn('Failed to parse saved pools:', e);
    }
    return false;
  };

  // Update verification status
  useEffect(() => {
    const isTokenHolder = parseFloat(balance) >= parseFloat(minimumTokens);
    const hasStakedTokens = parseFloat(stakedAmount) >= parseFloat(minimumStaked);
    const hasActivePool = checkActivePool();
    const tierName = getTierName(userTier);

    const newStatus: VerificationDetails = {
      isTokenHolder,
      hasStakedTokens,
      hasActivePool,
      balance,
      stakedAmount,
      userTier,
      tierName
    };

    setVerificationStatus(newStatus);

    // Notify parent component
    const isVerified = isConnected && isTokenHolder && (hasStakedTokens || hasActivePool);
    onVerificationChange?.(isVerified, newStatus);
  }, [balance, stakedAmount, userTier, isConnected, minimumTokens, minimumStaked, getTierName, onVerificationChange]);

  const getVerificationIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-400" />
    );
  };

  const getTierIcon = (tier: number) => {
    if (tier >= 4) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (tier >= 2) return <Star className="w-4 h-4 text-purple-400" />;
    return <Shield className="w-4 h-4 text-gray-400" />;
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 4: return "border-yellow-500/50 text-yellow-400 bg-yellow-500/10";
      case 3: return "border-purple-500/50 text-purple-400 bg-purple-500/10";
      case 2: return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case 1: return "border-green-500/50 text-green-400 bg-green-500/10";
      default: return "border-gray-500/50 text-gray-400 bg-gray-500/10";
    }
  };

  const isFullyVerified = isConnected &&
    verificationStatus.isTokenHolder &&
    (verificationStatus.hasStakedTokens || verificationStatus.hasActivePool);

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        isFullyVerified
          ? "bg-green-500/10 border-green-500/20"
          : "bg-red-500/10 border-red-500/20"
      }`}>
        {getVerificationIcon(isFullyVerified)}
        <span className={`text-sm font-medium ${
          isFullyVerified ? "text-green-400" : "text-red-400"
        }`}>
          {isFullyVerified ? "Verified Token Holder" : "Token Verification Required"}
        </span>
      </div>
    );
  }

  return (
    <Card className="neon-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isFullyVerified
                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}>
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : isFullyVerified ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <CardTitle className={`text-lg ${
                isFullyVerified ? "text-green-400" : "text-gray-400"
              }`}>
                Token Holder Verification
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                {isFullyVerified
                  ? "You have access to exclusive features"
                  : "Hold NFTY tokens to unlock premium features"
                }
              </CardDescription>
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            isFullyVerified ? "bg-green-400" : "bg-red-400"
          }`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Verification Requirements */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-cyan-400">Requirements Check</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg">
              <div className="flex items-center gap-2">
                {getVerificationIcon(isConnected)}
                <span className="text-sm">Wallet Connected</span>
              </div>
              <Badge variant="outline" className={`text-xs ${
                isConnected ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"
              }`}>
                {isConnected ? "Connected" : "Required"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg">
              <div className="flex items-center gap-2">
                {getVerificationIcon(verificationStatus.isTokenHolder)}
                <span className="text-sm">Token Balance ≥ {minimumTokens} NFTY</span>
              </div>
              <Badge variant="outline" className={`text-xs ${
                verificationStatus.isTokenHolder ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"
              }`}>
                {verificationStatus.balance} NFTY
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 bg-gray-800/40 rounded-lg">
              <div className="flex items-center gap-2">
                {getVerificationIcon(verificationStatus.hasStakedTokens || verificationStatus.hasActivePool)}
                <span className="text-sm">Staked Tokens OR Active Pool</span>
              </div>
              <div className="flex gap-1">
                {verificationStatus.hasStakedTokens && (
                  <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                    {verificationStatus.stakedAmount} Staked
                  </Badge>
                )}
                {verificationStatus.hasActivePool && (
                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                    Pool Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Token Holdings Summary */}
        {isConnected && (
          <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/20 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-medium text-cyan-400 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Token Holdings
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-sm font-medium text-white">
                  {parseFloat(verificationStatus.balance).toLocaleString()} NFTY
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Staked</p>
                <p className="text-sm font-medium text-white">
                  {parseFloat(verificationStatus.stakedAmount).toLocaleString()} NFTY
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTierIcon(verificationStatus.userTier)}
                <span className="text-sm font-medium text-white">
                  {verificationStatus.tierName} Tier
                </span>
              </div>
              <Badge className={`text-xs ${getTierColor(verificationStatus.userTier)}`}>
                Tier {verificationStatus.userTier}
              </Badge>
            </div>
          </div>
        )}

        {/* Access Status */}
        <div className={`p-3 rounded-lg border ${
          isFullyVerified
            ? "bg-green-500/10 border-green-500/20"
            : "bg-red-500/10 border-red-500/20"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isFullyVerified ? (
              <Unlock className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-red-400" />
            )}
            <span className={`font-medium text-sm ${
              isFullyVerified ? "text-green-400" : "text-red-400"
            }`}>
              {isFullyVerified ? "Full Access Granted" : "Access Restricted"}
            </span>
          </div>
          <p className={`text-xs ${
            isFullyVerified ? "text-green-300" : "text-red-300"
          }`}>
            {isFullyVerified
              ? "You can access the exclusive community chat and all premium features."
              : "Hold the required NFTY tokens and stake them or create an active pool to unlock access."
            }
          </p>
        </div>

        {/* Call to Action */}
        {!isFullyVerified && isConnected && (
          <div className="space-y-2">
            <Button className="w-full neon-button text-sm" asChild>
              <a href="#" onClick={() => {
                // Navigate to token purchase/staking section
                const tokenTab = document.querySelector('[data-tab="token"]') as HTMLElement;
                tokenTab?.click();
              }}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Get NFTY Tokens
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}