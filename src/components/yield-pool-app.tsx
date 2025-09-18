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
import { Zap, Settings, Share2, TrendingUp } from "lucide-react";
import "~/styles/neon.css";

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
  const [isPaid, setIsPaid] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreatePool = () => {
    if (!isPaid) {
      toast({
        title: "Payment Required",
        description: "Please complete the $10 USDC registration fee first.",
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
    setIsPaid(false);

    toast({
      title: "Pool Created Successfully",
      description: "Your NFT yield pool is now active and collecting rewards."
    });
  };

  const handlePaymentComplete = () => {
    setIsPaid(true);
    toast({
      title: "Payment Confirmed",
      description: "Registration fee paid. You can now create your yield pool."
    });
  };

  return (
    <div className="min-h-screen bg-black cyber-grid">
      <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl font-bold gradient-text mb-4">NFTYield</h1>
          <div className="neon-text text-lg">
            Turn Your NFTs Into Passive Income
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Register your NFT collection and pair it with Base network tokens for automated staking rewards.
            Earn up to 80% yield per NFT with pools lasting up to 90 days.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-gray-900/80 rounded-lg neon-border">
          <Button
            variant={activeTab === "create" ? "default" : "ghost"}
            onClick={() => setActiveTab("create")}
            className={`flex-1 ${activeTab === "create" ? "neon-button" : "text-gray-300 hover:text-white"}`}
          >
            <Zap className="w-4 h-4 mr-2" />
            Create Pool
          </Button>
          <Button
            variant={activeTab === "manage" ? "default" : "ghost"}
            onClick={() => setActiveTab("manage")}
            className={`flex-1 ${activeTab === "manage" ? "neon-button" : "text-gray-300 hover:text-white"}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Manage ({pools.length})
          </Button>
          <Button
            variant={activeTab === "admin" ? "default" : "ghost"}
            onClick={() => setActiveTab("admin")}
            className={`flex-1 ${activeTab === "admin" ? "neon-button" : "text-gray-300 hover:text-white"}`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
          <Button
            variant={activeTab === "share" ? "default" : "ghost"}
            onClick={() => setActiveTab("share")}
            className={`flex-1 ${activeTab === "share" ? "neon-button" : "text-gray-300 hover:text-white"}`}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {activeTab === "create" && (
          <Card className="neon-card">
            <CardHeader>
              <CardTitle className="text-cyan-400 text-xl">Create New Yield Pool</CardTitle>
              <CardDescription className="text-gray-300">
                Register your NFT collection and configure reward parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Fee */}
              <div className="space-y-3">
                <Label className="text-purple-400 font-medium">Registration Fee</Label>
                <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">$10 USDC Registration Fee</p>
                    <p className="text-sm text-gray-400">
                      One-time fee to register your NFT collection
                    </p>
                  </div>
                  <DaimoPayTransferButton
                    text={isPaid ? "✓ Paid" : "Pay Fee"}
                    toAddress="0x1234567890123456789012345678901234567890"
                    amount="10"
                    onPaymentCompleted={handlePaymentComplete}
                  />
                </div>
              </div>

              {/* NFT Collection */}
              <div className="space-y-2">
                <Label htmlFor="nftCollection" className="text-cyan-400 font-medium">
                  NFT Collection Address *
                </Label>
                <Input
                  id="nftCollection"
                  placeholder="0x..."
                  value={formData.nftCollection}
                  onChange={(e) => handleInputChange("nftCollection", e.target.value)}
                  className="neon-input"
                />
                <p className="text-sm text-gray-400">
                  Base network NFT collection contract address
                </p>
              </div>

              {/* Token Address */}
              <div className="space-y-2">
                <Label htmlFor="tokenAddress" className="text-cyan-400 font-medium">
                  Reward Token Address *
                </Label>
                <Input
                  id="tokenAddress"
                  placeholder="0x..."
                  value={formData.tokenAddress}
                  onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                  className="neon-input"
                />
                <p className="text-sm text-gray-400">
                  Base network token contract address for rewards
                </p>
              </div>

              {/* Contribution Amount */}
              <div className="space-y-2">
                <Label htmlFor="contributionAmount" className="text-cyan-400 font-medium">
                  Token Contribution Amount *
                </Label>
                <Input
                  id="contributionAmount"
                  placeholder="1000"
                  type="number"
                  value={formData.contributionAmount}
                  onChange={(e) => handleInputChange("contributionAmount", e.target.value)}
                  className="neon-input"
                />
                <p className="text-sm text-gray-400">
                  Total amount of tokens to contribute to the reward pool
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <Label className="text-cyan-400 font-medium">
                  Pool Duration: <span className="text-purple-400">{formData.duration} days</span>
                </Label>
                <Slider
                  value={[formData.duration]}
                  onValueChange={(value) => handleInputChange("duration", value[0])}
                  max={90}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-400">
                  Maximum duration: 90 days
                </p>
              </div>

              {/* Reward Percentage */}
              <div className="space-y-3">
                <Label className="text-cyan-400 font-medium">
                  Reward Percentage per NFT: <span className="text-purple-400">{formData.rewardPercentage}%</span>
                </Label>
                <Slider
                  value={[formData.rewardPercentage]}
                  onValueChange={(value) => handleInputChange("rewardPercentage", value[0])}
                  max={80}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-gray-400">
                  Maximum reward: 80% per NFT
                </p>
              </div>

              <Button
                onClick={handleCreatePool}
                className="w-full neon-button text-lg py-6"
                disabled={!isPaid}
              >
                {!isPaid ? "🔒 Complete Payment First" : "⚡ Create Yield Pool"}
              </Button>
          </CardContent>
        </Card>
      )}

        {activeTab === "manage" && (
          <div className="space-y-4">
            {pools.length === 0 ? (
              <Card className="neon-card">
                <CardContent className="py-12 text-center">
                  <div className="space-y-4">
                    <div className="text-6xl">🏗️</div>
                    <h3 className="text-xl font-semibold text-cyan-400">No Yield Pools Yet</h3>
                    <p className="text-gray-400">Create your first pool to start earning passive income</p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="neon-button mt-6"
                    >
                      ⚡ Create Your First Pool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pools.map((pool) => (
                <Card key={pool.id} className="neon-card">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-white text-lg">Pool #{pool.id.slice(-6)}</h3>
                          <p className="text-sm text-gray-400">
                            Created {pool.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pool.status === "active"
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                        }`}>
                          {pool.status === "active" ? "🟢 ACTIVE" : "⏸️ INACTIVE"}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="font-medium text-cyan-400">NFT Collection</p>
                          <p className="text-gray-300 truncate font-mono text-xs">
                            {pool.nftCollection}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-cyan-400">Token Address</p>
                          <p className="text-gray-300 truncate font-mono text-xs">
                            {pool.tokenAddress}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-purple-400">Duration</p>
                          <p className="text-white font-medium">
                            {pool.duration} days
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-purple-400">Reward Rate</p>
                          <p className="text-white font-medium">
                            {pool.rewardPercentage}% per NFT
                          </p>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <p className="font-medium text-pink-400">Token Contribution</p>
                          <p className="text-white font-medium text-lg">
                            {pool.contributionAmount} tokens
                          </p>
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
      </div>
    </div>
  );
}