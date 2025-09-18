"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { DaimoPayTransferButton } from "~/components/daimo-pay-transfer-button";
import { ExternalLink, DollarSign, Flame, ArrowLeft, Check, Coins, Zap, Lock, Repeat } from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import { base } from "wagmi/chains";

interface SamishTokenPurchaseProps {
  onPurchaseComplete: () => void;
  isPurchased: boolean;
}

const SAMISH_TOKEN_ADDRESS = "0x086bb3d90d719eb50d569e071b9987080ecb9781" as const;
const RECEIVER_ADDRESS = "0x1234567890123456789012345678901234567890" as const; // Replace with actual receiver

// Mock token price - in real implementation, fetch from DEX
const SAMISH_TOKEN_PRICE_USD = 0.05; // $0.05 per token
const TARGET_USD_VALUE = 10; // $10 worth
const TOKENS_TO_PURCHASE = TARGET_USD_VALUE / SAMISH_TOKEN_PRICE_USD; // 200 tokens

export default function SamishTokenPurchase({ onPurchaseComplete, isPurchased }: SamishTokenPurchaseProps) {
  const [step, setStep] = useState<"info" | "purchase" | "confirm">("info");
  const [purchaseAmount] = useState("10"); // Fixed $10 purchase
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompletedPurchase, setHasCompletedPurchase] = useState(false);
  const { toast } = useToast();

  const handlePaymentStarted = () => {
    setIsProcessing(true);
    toast({
      title: "Payment Started",
      description: "Processing your token purchase...",
    });
  };

  const handlePaymentCompleted = () => {
    setIsProcessing(false);
    setHasCompletedPurchase(true);

    toast({
      title: "Purchase Successful!",
      description: `Purchased ${TOKENS_TO_PURCHASE} Samish Creator tokens`,
    });

    // Simulate burning and locking mechanism
    setTimeout(() => {
      toast({
        title: "Tokens Locked & Burned",
        description: "$5 burned, $5 locked for refund after pool ends",
        variant: "default"
      });
      setStep("confirm");
      onPurchaseComplete();
    }, 2000);
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