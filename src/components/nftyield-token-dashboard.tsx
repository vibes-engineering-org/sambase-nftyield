"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import {
  Wallet,
  TrendingUp,
  Coins,
  Lock,
  Flame,
  Award,
  Calendar,
  BarChart3,
  DollarSign,
  Users
} from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import type { TokenBalance, TokenTransaction, StakingPool } from "~/types/token";

interface UserToken {
  id: string;
  amount: string;
  tier: string;
  value: number;
  timestamp: Date;
  lockEndDate: Date;
}

interface TokenDashboardProps {
  onStake?: (poolId: string, amount: string) => void;
  onUnstake?: (poolId: string) => void;
}

export default function NFTYieldTokenDashboard({ onStake, onUnstake }: TokenDashboardProps) {
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance>({
    address: "0x1234...5678",
    balance: "0",
    staked: "0",
    rewards: "0",
    totalEarned: "0"
  });
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([
    {
      id: "pool_1",
      name: "NFTY Core Pool",
      tokenAddress: "0x...",
      stakingReward: 12,
      lockPeriod: 30,
      totalStaked: "2000000",
      userStaked: "0",
      rewardsAccrued: "0",
      isActive: true
    },
    {
      id: "pool_2",
      name: "High Yield Pool",
      tokenAddress: "0x...",
      stakingReward: 25,
      lockPeriod: 90,
      totalStaked: "500000",
      userStaked: "0",
      rewardsAccrued: "0",
      isActive: true
    }
  ]);

  const { toast } = useToast();

  useEffect(() => {
    // Load user tokens from localStorage
    const savedTokens = localStorage.getItem('nftyield_user_tokens');
    if (savedTokens) {
      try {
        const parsed = JSON.parse(savedTokens).map((token: any) => ({
          ...token,
          timestamp: new Date(token.timestamp),
          lockEndDate: new Date(token.lockEndDate)
        }));
        setUserTokens(parsed);

        // Calculate total balance
        const totalBalance = parsed.reduce((sum: number, token: UserToken) =>
          sum + parseFloat(token.amount), 0);
        setTokenBalance(prev => ({
          ...prev,
          balance: totalBalance.toString()
        }));

        // Generate mock transactions
        const mockTransactions: TokenTransaction[] = parsed.map((token: UserToken) => ({
          id: token.id,
          type: "mint" as const,
          amount: token.amount,
          timestamp: token.timestamp
        }));
        setTransactions(mockTransactions);

      } catch (e) {
        console.warn('Failed to parse saved tokens:', e);
      }
    }
  }, []);

  const handleStake = (poolId: string, amount: string) => {
    const pool = stakingPools.find(p => p.id === poolId);
    if (!pool) return;

    if (parseFloat(amount) > parseFloat(tokenBalance.balance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough tokens to stake",
        variant: "destructive"
      });
      return;
    }

    // Update staking pool
    setStakingPools(prev => prev.map(p =>
      p.id === poolId ? {
        ...p,
        userStaked: (parseFloat(p.userStaked) + parseFloat(amount)).toString()
      } : p
    ));

    // Update token balance
    setTokenBalance(prev => ({
      ...prev,
      balance: (parseFloat(prev.balance) - parseFloat(amount)).toString(),
      staked: (parseFloat(prev.staked) + parseFloat(amount)).toString()
    }));

    // Add transaction
    const newTransaction: TokenTransaction = {
      id: Date.now().toString(),
      type: "stake",
      amount,
      timestamp: new Date()
    };
    setTransactions(prev => [newTransaction, ...prev]);

    toast({
      title: "Tokens Staked Successfully",
      description: `${amount} NFTY staked in ${pool.name}`,
    });

    onStake?.(poolId, amount);
  };

  const handleUnstake = (poolId: string) => {
    const pool = stakingPools.find(p => p.id === poolId);
    if (!pool || parseFloat(pool.userStaked) === 0) return;

    const amount = pool.userStaked;

    // Update staking pool
    setStakingPools(prev => prev.map(p =>
      p.id === poolId ? {
        ...p,
        userStaked: "0",
        rewardsAccrued: "0"
      } : p
    ));

    // Update token balance (with rewards)
    const rewards = parseFloat(pool.rewardsAccrued) || 0;
    setTokenBalance(prev => ({
      ...prev,
      balance: (parseFloat(prev.balance) + parseFloat(amount) + rewards).toString(),
      staked: (parseFloat(prev.staked) - parseFloat(amount)).toString(),
      totalEarned: (parseFloat(prev.totalEarned) + rewards).toString()
    }));

    // Add transaction
    const newTransaction: TokenTransaction = {
      id: Date.now().toString(),
      type: "unstake",
      amount,
      timestamp: new Date()
    };
    setTransactions(prev => [newTransaction, ...prev]);

    toast({
      title: "Tokens Unstaked Successfully",
      description: `${amount} NFTY + ${rewards.toFixed(2)} rewards claimed`,
    });

    onUnstake?.(poolId);
  };

  const totalValue = userTokens.reduce((sum, token) => sum + token.value, 0);
  const lockedTokens = userTokens.filter(token => new Date() < token.lockEndDate);
  const unlockedTokens = userTokens.filter(token => new Date() >= token.lockEndDate);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-cyan-400">Portfolio Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Total NFTY Balance</p>
              <p className="text-xl font-bold text-white">
                {parseFloat(tokenBalance.balance).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                ≈ ${(parseFloat(tokenBalance.balance) * 0.01).toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Staked Tokens</p>
              <p className="text-xl font-bold text-purple-400">
                {parseFloat(tokenBalance.staked).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                Earning {12}% APY
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Total Rewards</p>
              <p className="text-xl font-bold text-green-400">
                {parseFloat(tokenBalance.totalEarned).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                All-time earnings
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Portfolio Value</p>
              <p className="text-xl font-bold text-yellow-400">
                ${totalValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                Initial investment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900/80 neon-border">
          <TabsTrigger value="holdings" className="data-[state=active]:neon-button text-xs">
            <Coins className="w-3 h-3 mr-1" />
            Holdings
          </TabsTrigger>
          <TabsTrigger value="staking" className="data-[state=active]:neon-button text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Staking
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:neon-button text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          {userTokens.length === 0 ? (
            <Card className="neon-card">
              <CardContent className="py-8 text-center">
                <div className="space-y-3">
                  <Coins className="w-12 h-12 text-cyan-400 mx-auto" />
                  <h3 className="text-lg font-semibold text-cyan-400">No Tokens Yet</h3>
                  <p className="text-gray-400 text-sm">Mint NFTY tokens to start participating</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Locked Tokens */}
              {lockedTokens.length > 0 && (
                <Card className="neon-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-400" />
                        <CardTitle className="text-orange-400 text-sm">Locked Tokens</CardTitle>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-300">
                        {lockedTokens.length} positions
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lockedTokens.map((token) => {
                      const daysLeft = Math.ceil((token.lockEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const lockProgress = Math.max(0, 100 - (daysLeft / 180) * 100);

                      return (
                        <div key={token.id} className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-white">{token.amount} NFTY</p>
                              <p className="text-xs text-gray-400">{token.tier} Tier</p>
                            </div>
                            <Badge className="bg-orange-500/20 text-orange-300">
                              {daysLeft} days left
                            </Badge>
                          </div>
                          <Progress value={lockProgress} className="h-1" />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Unlocks: {token.lockEndDate.toLocaleDateString()}</span>
                            <span>Value: ${token.value.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Unlocked Tokens */}
              {unlockedTokens.length > 0 && (
                <Card className="neon-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-green-400" />
                        <CardTitle className="text-green-400 text-sm">Available Tokens</CardTitle>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300">
                        Ready to use
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {unlockedTokens.map((token) => (
                      <div key={token.id} className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-white">{token.amount} NFTY</p>
                            <p className="text-xs text-gray-400">{token.tier} Tier • Unlocked</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-400 font-medium">${token.value.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">Available</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="staking" className="space-y-4">
          {stakingPools.map((pool) => (
            <Card key={pool.id} className="neon-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-sm">{pool.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {pool.stakingReward}% APY • {pool.lockPeriod} day lock
                    </CardDescription>
                  </div>
                  <Badge className={pool.isActive ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}>
                    {pool.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Your Stake</p>
                    <p className="text-white font-medium">
                      {parseFloat(pool.userStaked).toLocaleString()} NFTY
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rewards Earned</p>
                    <p className="text-green-400 font-medium">
                      {parseFloat(pool.rewardsAccrued).toFixed(4)} NFTY
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Pool</p>
                    <p className="text-purple-400 font-medium">
                      {parseFloat(pool.totalStaked).toLocaleString()} NFTY
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">APY</p>
                    <p className="text-yellow-400 font-medium">{pool.stakingReward}%</p>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 neon-button text-xs"
                    onClick={() => handleStake(pool.id, "100")}
                    disabled={parseFloat(tokenBalance.balance) < 100}
                  >
                    Stake 100 NFTY
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs border-gray-600 hover:border-red-400 hover:text-red-400"
                    onClick={() => handleUnstake(pool.id)}
                    disabled={parseFloat(pool.userStaked) === 0}
                  >
                    Unstake All
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="neon-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <CardTitle className="text-cyan-400 text-sm">Transaction History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-2">
                        {tx.type === "mint" && <Coins className="w-3 h-3 text-green-400" />}
                        {tx.type === "stake" && <Lock className="w-3 h-3 text-purple-400" />}
                        {tx.type === "unstake" && <TrendingUp className="w-3 h-3 text-blue-400" />}
                        {tx.type === "burn" && <Flame className="w-3 h-3 text-orange-400" />}
                        <div>
                          <p className="text-xs font-medium text-white capitalize">{tx.type}</p>
                          <p className="text-xs text-gray-400">
                            {tx.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-white">
                          {tx.amount} NFTY
                        </p>
                        <p className="text-xs text-gray-400">
                          ${(parseFloat(tx.amount) * 0.01).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}