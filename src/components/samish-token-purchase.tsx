"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { useTokenBurnEscrow } from "~/hooks/useTokenBurnEscrow";
import { DaimoPayTransferButton } from "~/components/daimo-pay-transfer-button";
import { ExternalLink, DollarSign, Flame, ArrowLeft, Check, Coins, Zap, Lock, Repeat, AlertTriangle } from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import { base } from "wagmi/chains";

interface SamishTokenPurchaseProps {
  onPurchaseComplete: (poolId: string) => void;
  isPurchased: boolean;
  poolId?: string;
  poolDuration?: number;
}

const SAMISH_TOKEN_ADDRESS = "0x086bb3d90d719eb50d569e071b9987080ecb9781" as const;
const RECEIVER_ADDRESS = "0x1234567890123456789012345678901234567890" as const; // Replace with actual receiver

// Mock token price - in real implementation, fetch from DEX
const SAMISH_TOKEN_PRICE_USD = 0.05; // $0.05 per token
const TARGET_USD_VALUE = 10; // $10 worth
const TOKENS_TO_PURCHASE = TARGET_USD_VALUE / SAMISH_TOKEN_PRICE_USD; // 200 tokens

export default function SamishTokenPurchase({
  onPurchaseComplete,
  isPurchased,
  poolId,
  poolDuration = 30
}: SamishTokenPurchaseProps) {
  const [step, setStep] = useState<"info" | "approve" | "purchase" | "burn" | "confirm">("info");
  const [purchaseAmount] = useState("10"); // Fixed $10 purchase
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompletedPurchase, setHasCompletedPurchase] = useState(false);
  const [currentPoolId, setCurrentPoolId] = useState(poolId || `pool_${Date.now()}`);
  const { toast } = useToast();

  const {
    isProcessing: isContractProcessing,
    needsApproval,
    tokenBalance,
    totalBurned,
    approveTokens,
    depositForPool,
    burnTokensForPool,
    safetyRefund,
    canSafetyRefund,
  } = useTokenBurnEscrow();

  const handlePaymentStarted = () => {
    setIsProcessing(true);
    toast({
      title: "Payment Started",
      description: "Processing your token purchase...",
    });
  };

  const handlePaymentCompleted = async () => {
    setIsProcessing(false);
    setHasCompletedPurchase(true);

    toast({
      title: "Payment Successful!",
      description: "Now depositing tokens to escrow contract...",
    });

    // Check if tokens need approval first
    if (needsApproval) {
      setStep("approve");
    } else {
      await handleTokenDeposit();
    }
  };

  const handleTokenDeposit = async () => {
    const success = await depositForPool("200", poolDuration, currentPoolId); // 200 tokens worth $10

    if (success) {
      toast({
        title: "Tokens Deposited",
        description: "Tokens deposited to escrow, now burning deflationary portion...",
      });
      setStep("burn");

      // Automatically burn tokens after deposit
      setTimeout(() => handleTokenBurn(), 2000);
    }
  };

  const handleTokenBurn = async () => {
    const success = await burnTokensForPool(currentPoolId);

    if (success) {
      toast({
        title: "Tokens Burned & Escrowed",
        description: "$5 burned for deflation, $5 locked for refund after pool ends",
        variant: "default"
      });
      setStep("confirm");
      onPurchaseComplete(currentPoolId);
    }
  };

  const handleApproval = async () => {
    const success = await approveTokens("200"); // Approve 200 tokens
    if (success) {
      await handleTokenDeposit();
    }
  };

  const handleSafetyRefund = async () => {
    const success = await safetyRefund(currentPoolId);
    if (success) {
      setStep("info");
      setHasCompletedPurchase(false);
    }
  };

  if (isPurchased) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Tokens Locked Successfully</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Tokens Purchased:</span>
            <span className="text-white">{TOKENS_TO_PURCHASE} SAMISH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-400">Burned (Deflationary):</span>
            <span className="text-orange-400">$5.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-400">Locked (Refundable):</span>
            <span className="text-green-400">$5.00</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === "info") {
    return (
      <div className="space-y-3">
        <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">Deflationary Token Mechanics</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-900/50 p-2 rounded">
              <div className="text-gray-400">Token Price</div>
              <div className="text-white font-medium">${SAMISH_TOKEN_PRICE_USD}</div>
            </div>
            <div className="bg-gray-900/50 p-2 rounded">
              <div className="text-gray-400">Tokens to Buy</div>
              <div className="text-white font-medium">{TOKENS_TO_PURCHASE}</div>
            </div>
          </div>

          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Purchase $10 worth of Samish Creator tokens</li>
            <li>• $5 worth will be burned (deflationary)</li>
            <li>• $5 worth locked and returned when pool ends</li>
            <li>• Pay with any supported coin via flexible swapping</li>
            <li>• Supports creator economy on Base network</li>
          </ul>
        </div>

        <Button
          onClick={() => setStep("purchase")}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm"
        >
          <Coins className="w-4 h-4 mr-2" />
          Buy with Flexible Payment
        </Button>
      </div>
    );
  }

  if (step === "approve" && needsApproval) {
    return (
      <Card className="border-yellow-500/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-medium text-white">Token Approval Required</h3>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
            <p className="text-xs text-gray-300 mb-3">
              Before depositing tokens to the escrow contract, you need to approve the contract to spend your SAMISH tokens.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Your Balance:</span>
                <span className="text-white">{parseFloat(tokenBalance).toFixed(2)} SAMISH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Required:</span>
                <span className="text-white">200 SAMISH</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleApproval}
            disabled={isContractProcessing}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {isContractProcessing ? (
              <>Processing...</>
            ) : (
              <><Check className="w-4 h-4 mr-2" />Approve Tokens</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "burn") {
    return (
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-orange-400">
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="text-sm font-bold">Burning Deflationary Tokens...</span>
        </div>

        <div className="text-xs text-gray-300">
          <p>• Depositing 200 SAMISH tokens to escrow contract</p>
          <p>• Burning 100 tokens ($5) for deflationary tokenomics</p>
          <p>• Locking 100 tokens ($5) for refund after pool completion</p>
        </div>

        <div className="bg-black/40 p-2 rounded text-xs text-gray-300">
          <Lock className="w-3 h-3 inline mr-1" />
          Processing onchain transactions...
        </div>
      </div>
    );
  }

  if (step === "purchase") {
    return (
      <Card className="border-purple-500/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("info")}
              disabled={isProcessing}
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
            <h3 className="text-sm font-medium text-white">Buy Samish Creator Tokens</h3>
          </div>

          <div className="space-y-3">
            {/* Token Info Card */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Token Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Creator:</span>
                  <span className="text-white ml-1">@samish</span>
                </div>
                <div>
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white ml-1">Base</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-white ml-1 font-mono">{SAMISH_TOKEN_ADDRESS.slice(0, 10)}...{SAMISH_TOKEN_ADDRESS.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="bg-black/40 border border-cyan-500/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Purchase Summary</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">Purchase Amount:</span>
                  <span className="text-white">${purchaseAmount} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tokens to Receive:</span>
                  <span className="text-white">{TOKENS_TO_PURCHASE} SAMISH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Token Price:</span>
                  <span className="text-white">${SAMISH_TOKEN_PRICE_USD}/token</span>
                </div>
              </div>
            </div>

            {/* Tokenomics Breakdown */}
            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Tokenomics Breakdown</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">Burned (Deflationary):</span>
                  <span className="text-orange-400">$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Locked (Refundable):</span>
                  <span className="text-green-400">$5.00</span>
                </div>
              </div>
            </div>

            {/* Flexible Payment with Daimo Pay */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-blue-400" />
                <Label className="text-sm text-blue-400 font-medium">
                  Pay with Any Supported Coin
                </Label>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded text-xs text-gray-300">
                Automatically converts your payment to purchase Samish tokens
              </div>

              <DaimoPayTransferButton
                text={isProcessing ? "Processing Purchase..." : `Buy ${TOKENS_TO_PURCHASE} SAMISH ($${purchaseAmount})`}
                toAddress={RECEIVER_ADDRESS}
                amount={purchaseAmount}
                toChainId={base.id}
                onPaymentStarted={handlePaymentStarted}
                onPaymentCompleted={handlePaymentCompleted}
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://basescan.org/address/${SAMISH_TOKEN_ADDRESS}`, "_blank")}
              className="w-full text-xs text-gray-400 hover:text-white"
              disabled={isProcessing}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Token Contract
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "confirm" && hasCompletedPurchase) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-green-400">
          <Check className="w-5 h-5" />
          <span className="text-sm font-bold">Purchase Complete!</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Tokens Acquired:</span>
            <span className="text-white font-medium">{TOKENS_TO_PURCHASE} SAMISH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-400">Burned (Deflationary):</span>
            <span className="text-orange-400 font-medium">$5.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-400">Locked (Refundable):</span>
            <span className="text-green-400 font-medium">$5.00</span>
          </div>
        </div>

        <div className="bg-black/40 p-2 rounded text-xs text-gray-300">
          <Lock className="w-3 h-3 inline mr-1" />
          Tokens are now locked and partially burned. You can create your yield pool!
        </div>
      </div>
    );
  }

  return null;
}