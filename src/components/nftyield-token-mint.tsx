"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Coins, TrendingUp, Lock, Zap, Star, Award, Shield } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { DaimoPayTransferButton } from "~/components/daimo-pay-transfer-button";
import type { InvestmentTier, TokenMetrics } from "~/types/token";

const NFTYIELD_TOKEN_CONFIG = {
  symbol: "NFTY",
  name: "NFTYield Token",
  decimals: 18,
  totalSupply: "100000000", // 100M total
  maxSupply: "100000000",
  mintPrice: "0.01", // $0.01 per token
  stakingRewardRate: 12, // 12% APY
  burnRate: 5 // 5% of each transaction
};

const INVESTMENT_TIERS: InvestmentTier[] = [
  {
    name: "Starter",
    minAmount: "10",
    benefits: ["Basic staking rewards", "Community access", "Weekly reports"],
    multiplier: 1.0,
    lockPeriod: 30
  },
  {
    name: "Believer",
    minAmount: "100",
    benefits: ["Enhanced staking rewards", "Priority pool access", "Monthly airdrops"],
    multiplier: 1.5,
    lockPeriod: 60
  },
  {
    name: "Whale",
    minAmount: "1000",
    benefits: ["Premium rewards", "Governance voting", "Exclusive features"],
    multiplier: 2.5,
    lockPeriod: 90
  },
  {
    name: "Diamond",
    minAmount: "10000",
    benefits: ["Maximum rewards", "DAO membership", "Revenue sharing"],
    multiplier: 4.0,
    lockPeriod: 180
  }
];

interface NFTYieldTokenMintProps {
  onMintComplete?: (amount: string, tier: string) => void;
}

export default function NFTYieldTokenMint({ onMintComplete }: NFTYieldTokenMintProps) {
  const [mintAmount, setMintAmount] = useState("100");
  const [selectedTier, setSelectedTier] = useState<InvestmentTier>(INVESTMENT_TIERS[0]);
  const [totalValue, setTotalValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics>({
    totalSupply: NFTYIELD_TOKEN_CONFIG.totalSupply,
    circulatingSupply: "5000000", // 5M circulating
    totalBurned: "500000", // 500K burned
    totalStaked: "2000000", // 2M staked
    holders: 1247,
    marketCap: "50000", // $50K
    price: NFTYIELD_TOKEN_CONFIG.mintPrice
  });

  const { toast } = useToast();

  useEffect(() => {
    const amount = parseFloat(mintAmount) || 0;
    const price = parseFloat(NFTYIELD_TOKEN_CONFIG.mintPrice);
    setTotalValue(amount * price);

    // Update selected tier based on amount
    const tier = INVESTMENT_TIERS
      .reverse()
      .find(t => amount >= parseFloat(t.minAmount)) || INVESTMENT_TIERS[0];
    setSelectedTier(tier);
  }, [mintAmount]);

  const handleMint = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid token amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local storage
      const userTokens = JSON.parse(localStorage.getItem('nftyield_user_tokens') || '[]');
      userTokens.push({
        id: Date.now().toString(),
        amount: mintAmount,
        tier: selectedTier.name,
        value: totalValue,
        timestamp: new Date(),
        lockEndDate: new Date(Date.now() + selectedTier.lockPeriod * 24 * 60 * 60 * 1000)
      });
      localStorage.setItem('nftyield_user_tokens', JSON.stringify(userTokens));

      // Update metrics
      const newCirculating = (parseFloat(tokenMetrics.circulatingSupply) + parseFloat(mintAmount)).toString();
      setTokenMetrics(prev => ({
        ...prev,
        circulatingSupply: newCirculating,
        holders: prev.holders + 1
      }));

      toast({
        title: "Tokens Minted Successfully!",
        description: `${mintAmount} NFTY tokens minted at ${selectedTier.name} tier`,
      });

      onMintComplete?.(mintAmount, selectedTier.name);
      setMintAmount("100");

    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const supplyProgress = (parseFloat(tokenMetrics.circulatingSupply) / parseFloat(tokenMetrics.totalSupply)) * 100;

  return (
    <div className="space-y-6">
      {/* Token Metrics Header */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-cyan-400">NFTY Token Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Price</p>
              <p className="text-white font-bold">${tokenMetrics.price}</p>
            </div>
            <div>
              <p className="text-gray-400">Market Cap</p>
              <p className="text-white font-bold">${tokenMetrics.marketCap}</p>
            </div>
            <div>
              <p className="text-gray-400">Holders</p>
              <p className="text-white font-bold">{tokenMetrics.holders.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">Total Burned</p>
              <p className="text-orange-400 font-bold">{parseFloat(tokenMetrics.totalBurned).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Circulating Supply</span>
              <span className="text-white">{parseFloat(tokenMetrics.circulatingSupply).toLocaleString()} / {parseFloat(tokenMetrics.totalSupply).toLocaleString()}</span>
            </div>
            <Progress value={supplyProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mint" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/80 neon-border">
          <TabsTrigger value="mint" className="data-[state=active]:neon-button">
            <Coins className="w-4 h-4 mr-2" />
            Mint Tokens
          </TabsTrigger>
          <TabsTrigger value="tiers" className="data-[state=active]:neon-button">
            <Award className="w-4 h-4 mr-2" />
            Investment Tiers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="space-y-4">
          <Card className="neon-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400">Mint NFTY Tokens</CardTitle>
              <CardDescription className="text-gray-300">
                Invest in the NFTYield ecosystem and earn passive rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label className="text-cyan-400 font-medium">Token Amount</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="neon-input"
                />
                <p className="text-xs text-gray-400">
                  Total Cost: ${totalValue.toFixed(4)} USD
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {["10", "100", "1000", "10000"].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setMintAmount(amount)}
                    className="text-xs border-gray-600 hover:border-cyan-400 hover:text-cyan-400"
                  >
                    {amount}
                  </Button>
                ))}
              </div>

              {/* Selected Tier Display */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-white">{selectedTier.name} Tier</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300">
                      {selectedTier.multiplier}x Rewards
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    {selectedTier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-purple-500/20 text-xs">
                    <span className="text-gray-400">Lock Period: </span>
                    <span className="text-white font-medium">{selectedTier.lockPeriod} days</span>
                  </div>
                </CardContent>
              </Card>

              {/* Mint Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleMint}
                  disabled={isProcessing || !mintAmount}
                  className="w-full neon-button"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Mint {mintAmount} NFTY for ${totalValue.toFixed(4)}
                    </>
                  )}
                </Button>

                <DaimoPayTransferButton
                  text={`Pay $${totalValue.toFixed(4)} for ${mintAmount} NFTY`}
                  amount={totalValue.toString()}
                  toAddress="0x1234567890123456789012345678901234567890"
                  onPaymentCompleted={() => handleMint()}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          {INVESTMENT_TIERS.map((tier, index) => (
            <Card key={tier.name} className="neon-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-white text-lg">{tier.name}</CardTitle>
                  </div>
                  <Badge className={`${index === 0 ? "bg-gray-500/20 text-gray-300" :
                    index === 1 ? "bg-blue-500/20 text-blue-300" :
                    index === 2 ? "bg-purple-500/20 text-purple-300" :
                    "bg-yellow-500/20 text-yellow-300"}`}>
                    {tier.multiplier}x Multiplier
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  Minimum: {tier.minAmount} NFTY • Lock: {tier.lockPeriod} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tier.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}