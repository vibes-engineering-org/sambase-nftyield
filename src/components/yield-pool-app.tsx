"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Textarea } from "~/components/ui/textarea";
import { DaimoPayTransferButton } from "~/components/daimo-pay-transfer-button";
import { useToast } from "~/hooks/use-toast";
import AdminSection from "~/components/admin-section";
import ViralShare from "~/components/viral-share";
import { Zap, Settings, Share2, TrendingUp, Star, Lock, Flame } from "lucide-react";
import "~/styles/neon.css";
import SamishTokenPurchase from "~/components/samish-token-purchase";

interface YieldPool {
  id: string;
  nftCollection: string;
  tokenAddress: string;
  duration: number;
  rewardPercentage: number;
  contributionAmount: string;
  status: "active" | "pending" | "completed";
  createdAt: Date;
}

export default function YieldPoolApp() {
  const [activeTab, setActiveTab] = useState<"create" | "manage" | "admin" | "share">("create");
  const [pools, setPools] = useState<YieldPool[]>([]);
  const [formData, setFormData] = useState({
    nftCollection: "",
    tokenAddress: "",
    duration: 30,
    rewardPercentage: 10,
    contributionAmount: ""
  });
  const [hasTokensLocked, setHasTokensLocked] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreatePool = () => {
    if (!hasTokensLocked) {
      toast({
        title: "Samish Tokens Required",
        description: "Please purchase and lock $10 worth of Samish Creator tokens first.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.nftCollection || !formData.tokenAddress || !formData.contributionAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newPool: YieldPool = {
      id: Date.now().toString(),
      nftCollection: formData.nftCollection,
      tokenAddress: formData.tokenAddress,
      duration: formData.duration,
      rewardPercentage: formData.rewardPercentage,
      contributionAmount: formData.contributionAmount,
      status: "active",
      createdAt: new Date()
    };

    setPools(prev => [...prev, newPool]);
    setFormData({
      nftCollection: "",
      tokenAddress: "",
      duration: 30,
      rewardPercentage: 10,
      contributionAmount: ""
    });
    setHasTokensLocked(false);

    toast({
      title: "Pool Created Successfully",
      description: "Your NFT yield pool is now active and collecting rewards."
    });
  };

  const handleTokenLockComplete = () => {
    setHasTokensLocked(true);
    toast({
      title: "Tokens Locked Successfully",
      description: "$5 burned, $5 refundable. You can now create your yield pool."
    });
  };

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <div className="w-full max-w-md mx-auto p-3 space-y-4">
        <div className="text-center space-y-3 py-4">
          {/* Neon Logo */}
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-lg bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-60"></div>
            <div className="relative bg-black border-2 border-transparent bg-clip-padding rounded-xl p-4">
              <div className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                <h1 className="text-3xl font-black tracking-tight">NFTYield</h1>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-cyan-400 font-medium">Base Network</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-sm px-2">
            Turn NFTs into passive income by holding $10 Samish Creator tokens
          </p>
        </div>

        {/* Tab Navigation - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/80 rounded-lg neon-border">
          <Button
            variant={activeTab === "create" ? "default" : "ghost"}
            onClick={() => setActiveTab("create")}
            className={`${activeTab === "create" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
          >
            <Zap className="w-3 h-3 mr-1" />
            Create
          </Button>
          <Button
            variant={activeTab === "manage" ? "default" : "ghost"}
            onClick={() => setActiveTab("manage")}
            className={`${activeTab === "manage" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Pools ({pools.length})
          </Button>
          <Button
            variant={activeTab === "share" ? "default" : "ghost"}
            onClick={() => setActiveTab("share")}
            className={`${activeTab === "share" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          <Button
            variant={activeTab === "admin" ? "default" : "ghost"}
            onClick={() => setActiveTab("admin")}
            className={`${activeTab === "admin" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
          >
            <Settings className="w-3 h-3 mr-1" />
            Admin
          </Button>
        </div>

        {activeTab === "create" && (
          <Card className="neon-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-400 text-lg">Create Yield Pool</CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                Hold $10 Samish Creator tokens to unlock NFT yield pools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Samish Token Lock */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <Label className="text-purple-400 font-medium">Samish Creator Token Lock</Label>
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">$10 Worth Lock Required</p>
                      <p className="text-xs text-gray-400">
                        $5 burned + $5 returned after pool ends
                      </p>
                    </div>
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-xs text-gray-300 bg-black/40 p-2 rounded">
                    <p>Creator: 0x086bb3d...9781</p>
                    <p>Platform: Zora Network</p>
                  </div>
                  <SamishTokenPurchase
                    onPurchaseComplete={handleTokenLockComplete}
                    isPurchased={hasTokensLocked}
                  />
                </div>
              </div>

              {/* NFT Collection */}
              <div className="space-y-2">
                <Label htmlFor="nftCollection" className="text-cyan-400 font-medium text-sm">
                  NFT Collection Address *
                </Label>
                <Input
                  id="nftCollection"
                  placeholder="0x..."
                  value={formData.nftCollection}
                  onChange={(e) => handleInputChange("nftCollection", e.target.value)}
                  className="neon-input text-sm"
                />
              </div>

              {/* Token Address */}
              <div className="space-y-2">
                <Label htmlFor="tokenAddress" className="text-cyan-400 font-medium text-sm">
                  Reward Token Address *
                </Label>
                <Input
                  id="tokenAddress"
                  placeholder="0x..."
                  value={formData.tokenAddress}
                  onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                  className="neon-input text-sm"
                />
              </div>

              {/* Contribution Amount */}
              <div className="space-y-2">
                <Label htmlFor="contributionAmount" className="text-cyan-400 font-medium text-sm">
                  Token Contribution *
                </Label>
                <Input
                  id="contributionAmount"
                  placeholder="1000"
                  type="number"
                  value={formData.contributionAmount}
                  onChange={(e) => handleInputChange("contributionAmount", e.target.value)}
                  className="neon-input text-sm"
                />
              </div>

              {/* Duration & Reward in Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-cyan-400 font-medium text-sm">
                    Duration: {formData.duration}d
                  </Label>
                  <Slider
                    value={[formData.duration]}
                    onValueChange={(value) => handleInputChange("duration", value[0])}
                    max={90}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyan-400 font-medium text-sm">
                    Reward: {formData.rewardPercentage}%
                  </Label>
                  <Slider
                    value={[formData.rewardPercentage]}
                    onValueChange={(value) => handleInputChange("rewardPercentage", value[0])}
                    max={80}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreatePool}
                className="w-full neon-button text-sm py-4"
                disabled={!hasTokensLocked}
              >
                {!hasTokensLocked ? (
                  <><Lock className="w-4 h-4 mr-2" />Lock Tokens First</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" />Create Yield Pool</>
                )}
              </Button>
          </CardContent>
        </Card>
      )}

        {activeTab === "manage" && (
          <div className="space-y-3">
            {pools.length === 0 ? (
              <Card className="neon-card">
                <CardContent className="py-8 text-center">
                  <div className="space-y-3">
                    <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto" />
                    <h3 className="text-lg font-semibold text-cyan-400">No Pools Yet</h3>
                    <p className="text-gray-400 text-sm">Create your first pool to start earning</p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="neon-button text-sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Create First Pool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pools.map((pool) => (
                <Card key={pool.id} className="neon-card">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white text-sm">Pool #{pool.id.slice(-6)}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pool.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {pool.status === "active" ? "ACTIVE" : "INACTIVE"}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="font-medium text-cyan-400">NFT Collection</p>
                          <p className="text-gray-300 truncate font-mono">
                            {pool.nftCollection.slice(0, 20)}...
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="font-medium text-purple-400">Duration</p>
                            <p className="text-white">{pool.duration}d</p>
                          </div>
                          <div>
                            <p className="font-medium text-purple-400">Reward</p>
                            <p className="text-white">{pool.rewardPercentage}%</p>
                          </div>
                          <div>
                            <p className="font-medium text-pink-400">Tokens</p>
                            <p className="text-white">{pool.contributionAmount}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "admin" && (
          <AdminSection />
        )}

        {activeTab === "share" && (
          <ViralShare
            pools={pools}
            totalEarned="1,250"
            nftCount={42}
          />
        )}

        {/* Footer with Total Burned */}
        <div className="mt-6 pt-4 border-t border-gray-800/50">
          <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold text-orange-400">Total Samish Burned</h3>
            </div>
            <div className="text-2xl font-black text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
              $127.50
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Deflationary tokenomics supporting @samish creator economy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}