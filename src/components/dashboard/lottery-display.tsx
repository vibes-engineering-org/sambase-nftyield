"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Trophy, Gift, Clock, Users, Zap, Star } from "lucide-react";

interface LotteryDisplayProps {
  userPools: any[];
  totalBurned: string;
}

interface LotteryStats {
  totalEntries: number;
  currentPool: number;
  nextLotteryTime: Date;
  eligibleUsers: number;
  userEligible: boolean;
  recentWinners: { address: string; amount: number; date: Date }[];
}

export default function LotteryDisplay({ userPools, totalBurned }: LotteryDisplayProps) {
  const [lotteryStats, setLotteryStats] = useState<LotteryStats>({
    totalEntries: 0,
    currentPool: 0,
    nextLotteryTime: new Date(),
    eligibleUsers: 0,
    userEligible: false,
    recentWinners: []
  });
  const { toast } = useToast();

  // Real lottery data from actual user pools
  useEffect(() => {
    const completedPools = userPools.filter(p => p.status === 'completed').length;
    const totalPools = userPools.length;
    const monthlyPot = totalPools * 2.5; // $2.50 per pool for monthly lottery

    // Calculate next lottery time (every 30 days from app start)
    const nextLottery = new Date();
    nextLottery.setDate(nextLottery.getDate() + 30);

    // Real winners would come from smart contract - empty for now
    const winners: { address: string; amount: number; date: Date }[] = [];

    setLotteryStats({
      totalEntries: totalPools, // Actual entries only
      currentPool: monthlyPot,
      nextLotteryTime: nextLottery,
      eligibleUsers: completedPools, // Actual eligible users only
      userEligible: completedPools > 0,
      recentWinners: winners
    });
  }, [userPools]);

  const formatTimeUntilLottery = () => {
    const now = new Date();
    const timeDiff = lotteryStats.nextLotteryTime.getTime() - now.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} days, ${hours} hours`;
    }
    return `${hours} hours`;
  };

  const handleEnterLottery = () => {
    if (!lotteryStats.userEligible) {
      toast({
        title: "Not Eligible",
        description: "Complete a full pool cycle (purchase + burn + complete) to enter lottery",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Lottery Entry Confirmed",
      description: "You're automatically entered when you complete pool cycles!"
    });
  };

  return (
    <div className="space-y-4">
      {/* Lottery Overview */}
      <Card className="neon-card border-yellow-500/20">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-yellow-400 text-lg">Automated Lottery System</CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            Random rewards for pool creators - no refunds, just rewards!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
              <Gift className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-yellow-400">${lotteryStats.currentPool.toFixed(2)}</div>
              <div className="text-xs text-gray-400">Monthly Pot</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-purple-400">{lotteryStats.eligibleUsers}</div>
              <div className="text-xs text-gray-400">Eligible Users</div>
            </div>
          </div>

          {/* Next Lottery Timer */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="font-medium text-cyan-400 text-sm">Next Monthly Draw</p>
                  <p className="text-xs text-gray-400">{formatTimeUntilLottery()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">{lotteryStats.totalEntries}</p>
                <p className="text-xs text-gray-400">Total Entries</p>
              </div>
            </div>
          </div>

          {/* User Status */}
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${lotteryStats.userEligible ? 'bg-green-400' : 'bg-gray-400'}`} />
              <div>
                <p className="font-medium text-white text-sm">Your Status</p>
                <p className="text-xs text-gray-400">
                  {lotteryStats.userEligible ? "Eligible for all rewards" : "Complete a pool to become eligible"}
                </p>
              </div>
            </div>
            <Badge
              variant={lotteryStats.userEligible ? "default" : "secondary"}
              className={lotteryStats.userEligible ? "bg-green-500/20 text-green-400" : ""}
            >
              {lotteryStats.userEligible ? "ELIGIBLE" : "PENDING"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            How Lottery Rewards Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3 p-2 bg-gray-900/30 rounded">
              <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center text-xs font-bold text-orange-400">1</div>
              <div>
                <p className="text-white font-medium">Purchase & Burn</p>
                <p className="text-xs text-gray-400">Buy $10 Samish tokens: $5 burned, $5 enters lottery</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 bg-gray-900/30 rounded">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-bold text-purple-400">2</div>
              <div>
                <p className="text-white font-medium">Complete Pool Cycle</p>
                <p className="text-xs text-gray-400">Finish your yield pool to become eligible for rewards</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 bg-gray-900/30 rounded">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center text-xs font-bold text-yellow-400">3</div>
              <div>
                <p className="text-white font-medium">Automatic Rewards</p>
                <p className="text-xs text-gray-400">$2.50 goes to random winner immediately, $2.50 to monthly pot</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Winners */}
      {lotteryStats.recentWinners.length > 0 && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-lg flex items-center gap-2">
              <Star className="w-5 h-5" />
              Recent Winners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lotteryStats.recentWinners.map((winner, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white font-mono">
                        {winner.address}
                      </p>
                      <p className="text-xs text-gray-400">
                        {winner.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-green-400">
                    ${winner.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}