"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { ExternalLink, DollarSign, Flame, ArrowLeft, Check } from "lucide-react";

interface SamishTokenPurchaseProps {
  onPurchaseComplete: () => void;
  isPurchased: boolean;
}

export default function SamishTokenPurchase({ onPurchaseComplete, isPurchased }: SamishTokenPurchaseProps) {
  const [step, setStep] = useState<"info" | "purchase" | "confirm">("info");
  const [usdcAmount, setUsdcAmount] = useState("10");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsProcessing(true);
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Purchase Successful",
      description: "$10 USDC converted to Samish Creator tokens",
    });

    setStep("confirm");
    onPurchaseComplete();
    setIsProcessing(false);
  };

  if (isPurchased) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-green-400">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Tokens Locked Successfully</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          $5 burned • $5 refundable after pool ends
        </p>
      </div>
    );
  }

  if (step === "info") {
    return (
      <div className="space-y-3">
        <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">Deflationary Token Mechanics</span>
          </div>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Purchase $10 worth of Samish Creator tokens</li>
            <li>• $5 worth will be burned (deflationary)</li>
            <li>• $5 worth returned when pool ends</li>
            <li>• Supports creator economy on Zora</li>
          </ul>
        </div>

        <Button
          onClick={() => setStep("purchase")}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Purchase Samish Tokens
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
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
            <h3 className="text-sm font-medium text-white">Buy Samish Creator Token</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-900/50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Creator</span>
                <span className="text-white">@samish</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Platform</span>
                <span className="text-white">Zora Network</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Token Address</span>
                <span className="text-white font-mono">0x086bb3d...9781</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usdc" className="text-sm text-purple-400">
                USDC Amount
              </Label>
              <Input
                id="usdc"
                type="number"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                className="bg-black/50 border-purple-500/30 text-white text-sm"
              />
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Token Economics</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Purchase:</span>
                  <span className="text-white">${usdcAmount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Burned (Deflationary):</span>
                  <span className="text-orange-400">$5.00 USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Refundable:</span>
                  <span className="text-green-400">$5.00 USDC</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              disabled={isProcessing || Number(usdcAmount) < 10}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm"
            >
              {isProcessing ? "Processing..." : `Buy $${usdcAmount} Samish Tokens`}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("https://zora.co/@samish", "_blank")}
              className="w-full text-xs text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View on Zora
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}