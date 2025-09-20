"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useBaseAppToken } from "~/hooks/useBaseAppToken";
import { useToast } from "~/hooks/use-toast";
import TokenSwapIntegration from "~/components/ui/token-swap-integration";
import TokenManager from "~/components/token-manager";
import { Coins, TrendingUp, Wallet, Zap, ArrowUpDown, DollarSign, Settings } from "lucide-react";

export default function BaseAppTokenSwap() {
  const [activeView, setActiveView] = useState<"buy" | "stats" | "trade" | "manage">("buy");
  const { toast } = useToast();

  const {
    purchaseAmount,
    setPurchaseAmount,
    isLoading,
    isSuccess,
    error,
    isConnected,
    totalSupply,
    totalSold,
    contractBalance,
    tradingEnabled,
    userBalance,
    currentPrice,
    purchaseCost,
    buyTokens,
  } = useBaseAppToken();

  const handlePurchase = async () => {
    if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid token amount to purchase.",
        variant: "destructive"
      });
      return;
    }

    try {
      await buyTokens();
      if (isSuccess) {
        toast({
          title: "Purchase Successful!",
          description: `Successfully purchased ${purchaseAmount} BAPP tokens.`
        });
        setPurchaseAmount("");
      }
    } catch (err) {
      toast({
        title: "Purchase Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Coins className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-blue-400 text-lg">BaseApp Token (BAPP)</CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                1B Total Supply • 10% Marketing Allocation
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant={tradingEnabled ? "default" : "secondary"} className="text-xs">
              {tradingEnabled ? "Trading Enabled" : "Pre-Launch"}
            </Badge>
            <Badge variant="outline" className="text-xs text-green-400 border-green-400">
              Base Network
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-gray-900/80 rounded-lg neon-border">
        <Button
          variant={activeView === "buy" ? "default" : "ghost"}
          onClick={() => setActiveView("buy")}
          className={`${activeView === "buy" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs px-2`}
        >
          <Zap className="w-3 h-3 mr-1" />
          Buy
        </Button>
        <Button
          variant={activeView === "manage" ? "default" : "ghost"}
          onClick={() => setActiveView("manage")}
          className={`${activeView === "manage" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs px-2`}
        >
          <Settings className="w-3 h-3 mr-1" />
          Manage
        </Button>
        <Button
          variant={activeView === "trade" ? "default" : "ghost"}
          onClick={() => setActiveView("trade")}
          className={`${activeView === "trade" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs px-2`}
        >
          <ArrowUpDown className="w-3 h-3 mr-1" />
          Trade
        </Button>
        <Button
          variant={activeView === "stats" ? "default" : "ghost"}
          onClick={() => setActiveView("stats")}
          className={`${activeView === "stats" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs px-2`}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Stats
        </Button>
      </div>

      {activeView === "buy" && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5" />
              Purchase BAPP Tokens
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              Buy tokens directly from the bonding curve
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                <Wallet className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                <p className="text-orange-400 text-sm font-medium">
                  Connect your wallet to purchase tokens
                </p>
              </div>
            )}

            {/* Current Price Display */}
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Current Price</p>
                  <p className="text-lg font-bold text-blue-400">
                    {currentPrice} ETH
                  </p>
                </div>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
            </div>

            {/* User Balance */}
            {isConnected && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Your BAPP Balance</p>
                    <p className="text-lg font-bold text-white">
                      {userBalance}
                    </p>
                  </div>
                  <Wallet className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}

            {/* Purchase Form */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="purchaseAmount" className="text-cyan-400 font-medium text-sm">
                  Amount to Purchase (BAPP)
                </Label>
                <Input
                  id="purchaseAmount"
                  type="number"
                  placeholder="1000"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="neon-input text-sm"
                  disabled={!isConnected || isLoading}
                />
              </div>

              {/* Cost Preview */}
              {purchaseAmount && parseFloat(purchaseAmount) > 0 && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Total Cost</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {purchaseCost} ETH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Tokens</p>
                      <p className="text-lg font-bold text-white">
                        {parseFloat(purchaseAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handlePurchase}
                disabled={!isConnected || !purchaseAmount || parseFloat(purchaseAmount) <= 0 || isLoading}
                className="w-full neon-button text-sm py-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : !isConnected ? (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Buy BAPP Tokens
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  Transaction failed. Please try again.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeView === "manage" && <TokenManager />}

      {activeView === "trade" && (
        <TokenSwapIntegration
          tokenAddress={process.env.NEXT_PUBLIC_BASE_APP_TOKEN_ADDRESS}
          tokenSymbol="BAPP"
        />
      )}

      {activeView === "stats" && (
        <div className="space-y-4">
          <Card className="neon-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Token Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supply Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Total Supply</p>
                    <p className="text-lg font-bold text-blue-400">
                      {totalSupply}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Tokens Sold</p>
                    <p className="text-lg font-bold text-green-400">
                      {totalSold}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract Balance */}
              <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Available for Purchase</p>
                  <p className="text-xl font-bold text-purple-400">
                    {contractBalance} BAPP
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Marketing Allocation Info */}
              <div className="bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-orange-400">Marketing Allocation</p>
                    <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                      10% of Supply
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-white">100,000,000 BAPP</p>
                  <p className="text-xs text-gray-400 font-mono">
                    Allocated to: 0x5d7E...9B2
                  </p>
                </div>
              </div>

              {/* Trading Status */}
              <div className={`border rounded-lg p-3 ${
                tradingEnabled
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-gray-500/10 border-gray-500/20"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Trading Status</p>
                    <p className={`text-xs ${
                      tradingEnabled ? "text-green-400" : "text-gray-400"
                    }`}>
                      {tradingEnabled ? "Active trading enabled" : "Pre-launch phase"}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    tradingEnabled ? "bg-green-400" : "bg-gray-400"
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}