"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Shield, Flame, TrendingUp, Users, DollarSign, BarChart3, Activity, Trophy, Gift } from "lucide-react";

interface AdminSectionProps {
  pools?: any[];
  totalBurned?: string;
}

export default function AdminSection({ pools = [], totalBurned = "0" }: AdminSectionProps) {
  const totalUsers = pools.length; // Actual pool creators only
  const activePools = pools.filter(p => p.status === 'active').length;
  const totalVolume = parseFloat(totalBurned) * 2 * 0.05; // Burned * 2 (since 50% is burned) * price only
  const lotteryPool = pools.length * 5; // $5 per pool in lottery system
  const monthlyLotteryPot = pools.length * 2.5; // $2.50 per pool for monthly lottery
  const completedPools = pools.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-4">
      <Card className="neon-card border-cyan-500/20">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="neon-text text-lg">Admin Analytics</CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            Platform analytics with automated lottery rewards system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comprehensive Analytics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-400">{totalUsers}</div>
              <div className="text-xs text-gray-400">Total Users</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-400">{activePools}</div>
              <div className="text-xs text-gray-400">Active Pools</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
              <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-400">${lotteryPool.toFixed(2)}</div>
              <div className="text-xs text-gray-400">Lottery Pool</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
              <BarChart3 className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-400">${totalVolume.toFixed(0)}</div>
              <div className="text-xs text-gray-400">Total Volume</div>
            </div>
          </div>

          {/* Lottery System Stats */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-400">Automated Lottery System</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">${monthlyLotteryPot.toFixed(2)}</div>
                <div className="text-gray-400">Monthly Pot</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{completedPools}</div>
                <div className="text-gray-400">Eligible Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">30</div>
                <div className="text-gray-400">Days Until Draw</div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-3">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">User Engagement</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Active Users:</span>
                  <span className="text-white">{totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Pools:</span>
                  <span className="text-white">{activePools}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pool Completion Rate:</span>
                  <span className="text-white">{totalUsers > 0 ? Math.round((completedPools / totalUsers) * 100) : 0}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Token Burn Analytics</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Burned:</span>
                  <span className="text-orange-400">${(parseFloat(totalBurned) * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tokens Burned:</span>
                  <span className="text-orange-400">{totalBurned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Burn Per User:</span>
                  <span className="text-white">{totalUsers > 0 ? (parseFloat(totalBurned) / totalUsers).toFixed(0) : 0} tokens</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <h4 className="text-purple-400 font-medium text-sm mb-2">New Lottery System</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Users lock $10 Samish Creator tokens to create pools</li>
              <li>• $5 automatically burned per pool (deflationary mechanism)</li>
              <li>• $5 enters automated lottery: $2.50 immediate + $2.50 monthly pot</li>
              <li>• Random winners selected from eligible users who completed full cycle</li>
              <li>• Monthly lottery distributes accumulated pot to one lucky winner</li>
              <li>• Fully automated smart contract - no admin intervention needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}