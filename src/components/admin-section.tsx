"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Shield, Flame, TrendingUp, Users, DollarSign, BarChart3, Activity } from "lucide-react";

export default function AdminSection() {

  return (
    <div className="space-y-4">
      <Card className="neon-card border-cyan-500/20">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="neon-text text-lg">Admin Analytics</CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            Detailed platform statistics and user interaction data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comprehensive Analytics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-400">147</div>
              <div className="text-xs text-gray-400">Total Users</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-400">23</div>
              <div className="text-xs text-gray-400">Active Pools</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
              <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-400">$89.50</div>
              <div className="text-xs text-gray-400">Pending Refunds</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
              <BarChart3 className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-400">$2,340</div>
              <div className="text-xs text-gray-400">Total Volume</div>
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
                  <span className="text-white">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Session Time:</span>
                  <span className="text-white">4.2 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pool Creation Rate:</span>
                  <span className="text-white">73%</span>
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
                  <span className="text-gray-400">Total Burns This Week:</span>
                  <span className="text-orange-400">$67.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Burn Rate Trend:</span>
                  <span className="text-green-400">+15.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Burn Per User:</span>
                  <span className="text-white">$5.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <h4 className="text-purple-400 font-medium text-sm mb-2">Platform Notes</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Users must lock $10 Samish Creator tokens to create pools</li>
              <li>• $5 automatically burned per pool (deflationary mechanism)</li>
              <li>• $5 refunded when pool duration ends</li>
              <li>• All transactions occur on Base network</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}