"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { useToast } from "~/hooks/use-toast";
import { Plus, X, Settings, Zap, Clock, Coins, TrendingUp, Star } from "lucide-react";

interface TokenPair {
  id: string;
  token1Address: string;
  token1Symbol: string;
  token2Address: string;
  token2Symbol: string;
  ratio: number;
}

interface CustomPool {
  id: string;
  name: string;
  description: string;
  duration: number;
  tokenPairs: TokenPair[];
  rewardPercentage: number;
  minContribution: string;
  maxContribution: string;
  isPublic: boolean;
  poolType: "fixed" | "flexible" | "compounding";
  autoReinvest: boolean;
  emergencyWithdraw: boolean;
  createdAt: Date;
  status: "draft" | "active" | "completed";
}

interface CustomYieldPoolsProps {
  onPoolCreate: (pool: CustomPool) => void;
}

const POPULAR_TOKENS = [
  { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", name: "Ethereum" },
  { symbol: "USDC", address: "0xA0b86a33E6432bbaE62E4084e26DC4DF0013e551", name: "USD Coin" },
  { symbol: "USDT", address: "0x94e14Fa6E0B09c2fc2AcF17E9F7c70eFDC5c19aD", name: "Tether" },
  { symbol: "WBTC", address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", name: "Wrapped Bitcoin" },
  { symbol: "DAI", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", name: "DAI Stablecoin" },
  { symbol: "LINK", address: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196", name: "Chainlink" },
];

export default function CustomYieldPools({ onPoolCreate }: CustomYieldPoolsProps) {
  const [customPools, setCustomPools] = useState<CustomPool[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    rewardPercentage: 10,
    minContribution: "100",
    maxContribution: "10000",
    poolType: "fixed" as "fixed" | "flexible" | "compounding",
    isPublic: true,
    autoReinvest: false,
    emergencyWithdraw: true
  });
  const [tokenPairs, setTokenPairs] = useState<TokenPair[]>([]);
  const [newPair, setNewPair] = useState({
    token1Address: "",
    token1Symbol: "",
    token2Address: "",
    token2Symbol: "",
    ratio: 50
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTokenPair = () => {
    if (!newPair.token1Address || !newPair.token2Address) {
      toast({
        title: "Missing Token Addresses",
        description: "Please select both tokens for the pair",
        variant: "destructive"
      });
      return;
    }

    const pair: TokenPair = {
      id: Date.now().toString(),
      token1Address: newPair.token1Address,
      token1Symbol: newPair.token1Symbol || "TOKEN1",
      token2Address: newPair.token2Address,
      token2Symbol: newPair.token2Symbol || "TOKEN2",
      ratio: newPair.ratio
    };

    setTokenPairs(prev => [...prev, pair]);
    setNewPair({
      token1Address: "",
      token1Symbol: "",
      token2Address: "",
      token2Symbol: "",
      ratio: 50
    });

    toast({
      title: "Token Pair Added",
      description: `${pair.token1Symbol}/${pair.token2Symbol} pair added successfully`
    });
  };

  const removeTokenPair = (pairId: string) => {
    setTokenPairs(prev => prev.filter(pair => pair.id !== pairId));
  };

  const selectPopularToken = (tokenNum: 1 | 2, token: typeof POPULAR_TOKENS[0]) => {
    if (tokenNum === 1) {
      setNewPair(prev => ({
        ...prev,
        token1Address: token.address,
        token1Symbol: token.symbol
      }));
    } else {
      setNewPair(prev => ({
        ...prev,
        token2Address: token.address,
        token2Symbol: token.symbol
      }));
    }
  };

  const createCustomPool = () => {
    if (!formData.name || tokenPairs.length === 0) {
      toast({
        title: "Incomplete Pool Configuration",
        description: "Please provide pool name and at least one token pair",
        variant: "destructive"
      });
      return;
    }

    const newPool: CustomPool = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      duration: formData.duration,
      tokenPairs: [...tokenPairs],
      rewardPercentage: formData.rewardPercentage,
      minContribution: formData.minContribution,
      maxContribution: formData.maxContribution,
      isPublic: formData.isPublic,
      poolType: formData.poolType,
      autoReinvest: formData.autoReinvest,
      emergencyWithdraw: formData.emergencyWithdraw,
      createdAt: new Date(),
      status: "active"
    };

    setCustomPools(prev => [...prev, newPool]);
    onPoolCreate(newPool);

    // Reset form
    setFormData({
      name: "",
      description: "",
      duration: 30,
      rewardPercentage: 10,
      minContribution: "100",
      maxContribution: "10000",
      poolType: "fixed",
      isPublic: true,
      autoReinvest: false,
      emergencyWithdraw: true
    });
    setTokenPairs([]);
    setIsCreating(false);

    toast({
      title: "Custom Pool Created",
      description: `${newPool.name} is now active and ready for contributions`
    });
  };

  return (
    <div className="space-y-4">
      {/* Create New Pool Button */}
      {!isCreating && (
        <Card className="neon-card">
          <CardContent className="py-6 text-center">
            <div className="space-y-3">
              <Settings className="w-12 h-12 text-cyan-400 mx-auto" />
              <h3 className="text-lg font-semibold text-cyan-400">Custom Yield Pools</h3>
              <p className="text-gray-400 text-sm px-4">
                Create tailored yield pools with custom token combinations and duration settings
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="neon-button text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Pool
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pool Creation Form */}
      {isCreating && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Design Custom Pool
              </CardTitle>
              <Button
                onClick={() => setIsCreating(false)}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription className="text-gray-300 text-sm">
              Configure your custom yield pool parameters and token combinations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <Label className="text-cyan-400 font-medium text-sm">Pool Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., ETH-USDC Yield Strategy"
                  className="neon-input text-sm"
                />
              </div>
              <div>
                <Label className="text-cyan-400 font-medium text-sm">Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Brief description of your pool strategy"
                  className="neon-input text-sm"
                />
              </div>
            </div>

            {/* Pool Type */}
            <div className="space-y-2">
              <Label className="text-cyan-400 font-medium text-sm">Pool Type</Label>
              <Select
                value={formData.poolType}
                onValueChange={(value) => handleInputChange("poolType", value)}
              >
                <SelectTrigger className="neon-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Duration</SelectItem>
                  <SelectItem value="flexible">Flexible Withdrawal</SelectItem>
                  <SelectItem value="compounding">Auto-Compounding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration and Reward */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-cyan-400 font-medium text-sm">
                  Duration: {formData.duration}d
                </Label>
                <Slider
                  value={[formData.duration]}
                  onValueChange={(value) => handleInputChange("duration", value[0])}
                  max={365}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-cyan-400 font-medium text-sm">
                  Target APY: {formData.rewardPercentage}%
                </Label>
                <Slider
                  value={[formData.rewardPercentage]}
                  onValueChange={(value) => handleInputChange("rewardPercentage", value[0])}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Contribution Limits */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-cyan-400 font-medium text-sm">Min Contribution</Label>
                <Input
                  value={formData.minContribution}
                  onChange={(e) => handleInputChange("minContribution", e.target.value)}
                  placeholder="100"
                  type="number"
                  className="neon-input text-sm"
                />
              </div>
              <div>
                <Label className="text-cyan-400 font-medium text-sm">Max Contribution</Label>
                <Input
                  value={formData.maxContribution}
                  onChange={(e) => handleInputChange("maxContribution", e.target.value)}
                  placeholder="10000"
                  type="number"
                  className="neon-input text-sm"
                />
              </div>
            </div>

            {/* Token Pairs Section */}
            <div className="space-y-3">
              <Label className="text-purple-400 font-medium text-sm flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Token Combinations
              </Label>

              {/* Popular Token Selection */}
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Quick Select Popular Tokens</p>
                <div className="grid grid-cols-3 gap-2">
                  {POPULAR_TOKENS.map((token) => (
                    <div key={token.symbol} className="space-y-1">
                      <Button
                        onClick={() => selectPopularToken(1, token)}
                        className="w-full text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30"
                      >
                        {token.symbol} → Token 1
                      </Button>
                      <Button
                        onClick={() => selectPopularToken(2, token)}
                        className="w-full text-xs bg-green-600/20 hover:bg-green-600/40 border border-green-500/30"
                      >
                        {token.symbol} → Token 2
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Token Input */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-purple-400">Token 1 Address</Label>
                    <Input
                      value={newPair.token1Address}
                      onChange={(e) => setNewPair(prev => ({ ...prev, token1Address: e.target.value }))}
                      placeholder="0x..."
                      className="neon-input text-xs"
                    />
                    <Input
                      value={newPair.token1Symbol}
                      onChange={(e) => setNewPair(prev => ({ ...prev, token1Symbol: e.target.value }))}
                      placeholder="Symbol"
                      className="neon-input text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-purple-400">Token 2 Address</Label>
                    <Input
                      value={newPair.token2Address}
                      onChange={(e) => setNewPair(prev => ({ ...prev, token2Address: e.target.value }))}
                      placeholder="0x..."
                      className="neon-input text-xs"
                    />
                    <Input
                      value={newPair.token2Symbol}
                      onChange={(e) => setNewPair(prev => ({ ...prev, token2Symbol: e.target.value }))}
                      placeholder="Symbol"
                      className="neon-input text-xs mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-purple-400">Allocation Ratio: {newPair.ratio}% / {100 - newPair.ratio}%</Label>
                  <Slider
                    value={[newPair.ratio]}
                    onValueChange={(value) => setNewPair(prev => ({ ...prev, ratio: value[0] }))}
                    max={90}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={addTokenPair}
                  className="w-full text-xs bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Token Pair
                </Button>
              </div>

              {/* Added Token Pairs */}
              {tokenPairs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-400">Added Pairs ({tokenPairs.length})</p>
                  {tokenPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                          {pair.token1Symbol}/{pair.token2Symbol}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {pair.ratio}% / {100 - pair.ratio}%
                        </span>
                      </div>
                      <Button
                        onClick={() => removeTokenPair(pair.id)}
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pool Options */}
            <div className="space-y-3">
              <Label className="text-pink-400 font-medium text-sm">Pool Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                  />
                  <Label htmlFor="isPublic" className="text-sm text-gray-300">
                    Public pool (visible to all users)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoReinvest"
                    checked={formData.autoReinvest}
                    onCheckedChange={(checked) => handleInputChange("autoReinvest", checked)}
                  />
                  <Label htmlFor="autoReinvest" className="text-sm text-gray-300">
                    Auto-reinvest rewards
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergencyWithdraw"
                    checked={formData.emergencyWithdraw}
                    onCheckedChange={(checked) => handleInputChange("emergencyWithdraw", checked)}
                  />
                  <Label htmlFor="emergencyWithdraw" className="text-sm text-gray-300">
                    Allow emergency withdrawals
                  </Label>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={createCustomPool}
              className="w-full neon-button text-sm py-4"
              disabled={!formData.name || tokenPairs.length === 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Custom Pool
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Created Pools */}
      {customPools.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Your Custom Pools ({customPools.length})
          </h3>
          {customPools.map((pool) => (
            <Card key={pool.id} className="neon-card">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{pool.name}</h4>
                      {pool.description && (
                        <p className="text-xs text-gray-400 mt-1">{pool.description}</p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        pool.status === "active"
                          ? "border-green-500/50 text-green-400"
                          : "border-gray-500/50 text-gray-400"
                      }`}
                    >
                      {pool.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-400 font-medium">Duration</span>
                      </div>
                      <p className="text-white font-semibold">{pool.duration}d</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3 text-purple-400" />
                        <span className="text-purple-400 font-medium">APY</span>
                      </div>
                      <p className="text-white font-semibold">{pool.rewardPercentage}%</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Coins className="w-3 h-3 text-pink-400" />
                        <span className="text-pink-400 font-medium">Pairs</span>
                      </div>
                      <p className="text-white font-semibold">{pool.tokenPairs.length}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-purple-400">Token Combinations:</p>
                    <div className="flex flex-wrap gap-1">
                      {pool.tokenPairs.map((pair) => (
                        <Badge
                          key={pair.id}
                          variant="outline"
                          className="text-xs border-purple-500/30 text-purple-300"
                        >
                          {pair.token1Symbol}/{pair.token2Symbol}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-1 text-xs">
                    <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                      {pool.poolType}
                    </Badge>
                    {pool.autoReinvest && (
                      <Badge variant="outline" className="border-green-500/30 text-green-300">
                        Auto-reinvest
                      </Badge>
                    )}
                    {pool.emergencyWithdraw && (
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                        Emergency withdraw
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}