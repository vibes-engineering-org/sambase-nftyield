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
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
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
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">NFT Yield Pool</h1>
        <p className="text-muted-foreground">
          Register your NFT collection and pair it with Base network tokens for staking rewards
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={activeTab === "create" ? "default" : "ghost"}
          onClick={() => setActiveTab("create")}
          className="flex-1"
        >
          Create Pool
        </Button>
        <Button
          variant={activeTab === "manage" ? "default" : "ghost"}
          onClick={() => setActiveTab("manage")}
          className="flex-1"
        >
          Manage Pools ({pools.length})
        </Button>
      </div>

      {activeTab === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Yield Pool</CardTitle>
            <CardDescription>
              Register your NFT collection and configure reward parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Registration Fee */}
            <div className="space-y-3">
              <Label>Registration Fee</Label>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">$10 USDC Registration Fee</p>
                  <p className="text-sm text-muted-foreground">
                    One-time fee to register your NFT collection
                  </p>
                </div>
                <DaimoPayTransferButton
                  text={isPaid ? "Paid" : "Pay Fee"}
                  toAddress="0x1234567890123456789012345678901234567890"
                  amount="10"
                  onPaymentCompleted={handlePaymentComplete}
                />
              </div>
            </div>

            {/* NFT Collection */}
            <div className="space-y-2">
              <Label htmlFor="nftCollection">NFT Collection Address *</Label>
              <Input
                id="nftCollection"
                placeholder="0x..."
                value={formData.nftCollection}
                onChange={(e) => handleInputChange("nftCollection", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Base network NFT collection contract address
              </p>
            </div>

            {/* Token Address */}
            <div className="space-y-2">
              <Label htmlFor="tokenAddress">Reward Token Address *</Label>
              <Input
                id="tokenAddress"
                placeholder="0x..."
                value={formData.tokenAddress}
                onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Base network token contract address for rewards
              </p>
            </div>

            {/* Contribution Amount */}
            <div className="space-y-2">
              <Label htmlFor="contributionAmount">Token Contribution Amount *</Label>
              <Input
                id="contributionAmount"
                placeholder="1000"
                type="number"
                value={formData.contributionAmount}
                onChange={(e) => handleInputChange("contributionAmount", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Total amount of tokens to contribute to the reward pool
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <Label>Pool Duration: {formData.duration} days</Label>
              <Slider
                value={[formData.duration]}
                onValueChange={(value) => handleInputChange("duration", value[0])}
                max={90}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Maximum duration: 90 days
              </p>
            </div>

            {/* Reward Percentage */}
            <div className="space-y-3">
              <Label>Reward Percentage per NFT: {formData.rewardPercentage}%</Label>
              <Slider
                value={[formData.rewardPercentage]}
                onValueChange={(value) => handleInputChange("rewardPercentage", value[0])}
                max={80}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Maximum reward: 80% per NFT
              </p>
            </div>

            <Button
              onClick={handleCreatePool}
              className="w-full"
              disabled={!isPaid}
            >
              Create Yield Pool
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "manage" && (
        <div className="space-y-4">
          {pools.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No yield pools created yet.</p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("create")}
                  className="mt-4"
                >
                  Create Your First Pool
                </Button>
              </CardContent>
            </Card>
          ) : (
            pools.map((pool) => (
              <Card key={pool.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Pool #{pool.id.slice(-6)}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {pool.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        pool.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {pool.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">NFT Collection</p>
                        <p className="text-muted-foreground truncate">
                          {pool.nftCollection}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Token Address</p>
                        <p className="text-muted-foreground truncate">
                          {pool.tokenAddress}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">
                          {pool.duration} days
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Reward Rate</p>
                        <p className="text-muted-foreground">
                          {pool.rewardPercentage}% per NFT
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-medium">Contribution</p>
                        <p className="text-muted-foreground">
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
    </div>
  );
}