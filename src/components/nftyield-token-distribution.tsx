"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  PieChart,
  Users,
  Coins,
  Gift,
  TrendingUp,
  Calendar,
  Zap,
  Award,
  DollarSign,
  Target
} from "lucide-react";

interface DistributionPhase {
  name: string;
  allocation: number;
  totalTokens: string;
  price: number;
  status: "upcoming" | "active" | "completed";
  startDate: Date;
  endDate: Date;
  description: string;
}

interface AirdropCampaign {
  id: string;
  name: string;
  tokensPerUser: string;
  totalTokens: string;
  claimed: string;
  requirements: string[];
  status: "active" | "completed";
  endDate: Date;
}

const DISTRIBUTION_PHASES: DistributionPhase[] = [
  {
    name: "Seed Round",
    allocation: 10,
    totalTokens: "10000000",
    price: 0.005,
    status: "upcoming",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-02-01"),
    description: "Early investors and founders"
  },
  {
    name: "Private Sale",
    allocation: 15,
    totalTokens: "15000000",
    price: 0.008,
    status: "upcoming",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-03-01"),
    description: "Strategic partners and VCs"
  },
  {
    name: "Public Sale",
    allocation: 25,
    totalTokens: "25000000",
    price: 0.01,
    status: "upcoming",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-04-01"),
    description: "Community members and retail investors"
  },
  {
    name: "Ecosystem Fund",
    allocation: 20,
    totalTokens: "20000000",
    price: 0,
    status: "upcoming",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2025-04-01"),
    description: "Development, partnerships, and growth"
  },
  {
    name: "Community Rewards",
    allocation: 15,
    totalTokens: "15000000",
    price: 0,
    status: "active",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2026-03-01"),
    description: "Staking rewards and airdrops"
  },
  {
    name: "Team & Advisors",
    allocation: 10,
    totalTokens: "10000000",
    price: 0,
    status: "upcoming",
    startDate: new Date("2024-06-01"),
    endDate: new Date("2028-06-01"),
    description: "Team allocation with 4-year vesting"
  },
  {
    name: "Liquidity Reserve",
    allocation: 5,
    totalTokens: "5000000",
    price: 0,
    status: "upcoming",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-04-01"),
    description: "DEX liquidity and market making"
  }
];

// No airdrops are currently active
const AIRDROP_CAMPAIGNS: AirdropCampaign[] = [];

export default function NFTYieldTokenDistribution() {
  const [selectedPhase, setSelectedPhase] = useState<DistributionPhase | null>(null);
  const [userEligibility, setUserEligibility] = useState({
    hasNFT: false,
    hasDiscord: false,
    hasTwitter: false,
    hasYieldPool: false,
    stakingDays: 0
  });

  // No tokens have actually been distributed yet
  const totalDistributed = 0;

  // No active sales, so no established price yet
  const currentPrice = 0;

  useEffect(() => {
    // Check user eligibility from localStorage or API
    const checkEligibility = () => {
      const userData = JSON.parse(localStorage.getItem('nftyield_user_data') || '{}');
      const userPools = JSON.parse(localStorage.getItem('nftyield_pools') || '[]');

      setUserEligibility({
        hasNFT: userData.hasNFT || false,
        hasDiscord: userData.hasDiscord || false,
        hasTwitter: userData.hasTwitter || false,
        hasYieldPool: userPools.length > 0,
        stakingDays: userData.stakingDays || 0
      });
    };

    checkEligibility();
  }, []);

  const claimAirdrop = (campaignId: string) => {
    const campaign = AIRDROP_CAMPAIGNS.find(c => c.id === campaignId);
    if (!campaign) return;

    // Check eligibility
    if (campaignId === "genesis_airdrop") {
      if (!userEligibility.hasNFT || !userEligibility.hasDiscord || !userEligibility.hasTwitter) {
        return;
      }
    }

    if (campaignId === "yield_farmers") {
      if (!userEligibility.hasYieldPool || userEligibility.stakingDays < 30) {
        return;
      }
    }

    // Record claim
    const claims = JSON.parse(localStorage.getItem('nftyield_airdrop_claims') || '[]');
    if (claims.includes(campaignId)) return;

    claims.push(campaignId);
    localStorage.setItem('nftyield_airdrop_claims', JSON.stringify(claims));

    // Update user tokens
    const userTokens = JSON.parse(localStorage.getItem('nftyield_user_tokens') || '[]');
    userTokens.push({
      id: Date.now().toString(),
      amount: campaign.tokensPerUser,
      tier: "Airdrop",
      value: parseFloat(campaign.tokensPerUser) * currentPrice,
      timestamp: new Date(),
      lockEndDate: new Date()
    });
    localStorage.setItem('nftyield_user_tokens', JSON.stringify(userTokens));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-300";
      case "active": return "bg-blue-500/20 text-blue-300";
      case "upcoming": return "bg-gray-500/20 text-gray-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const claims = JSON.parse(localStorage.getItem('nftyield_airdrop_claims') || '[]');

  return (
    <div className="space-y-6">
      {/* Distribution Overview */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-cyan-400">Token Distribution</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            100M NFTY total supply with strategic allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Current Price</p>
              <p className="text-xl font-bold text-gray-500">Not Available</p>
            </div>
            <div>
              <p className="text-gray-400">Total Distributed</p>
              <p className="text-xl font-bold text-blue-400">
                {(totalDistributed / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-gray-400">Market Cap</p>
              <p className="text-lg font-bold text-gray-500">
                $0
              </p>
            </div>
            <div>
              <p className="text-gray-400">Current Holders</p>
              <p className="text-lg font-bold text-gray-500">0</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Distribution Progress</span>
              <span className="text-white">{((totalDistributed / 100000000) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={(totalDistributed / 100000000) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="phases" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/80 neon-border">
          <TabsTrigger value="phases" className="data-[state=active]:neon-button">
            <Target className="w-4 h-4 mr-2" />
            Distribution Phases
          </TabsTrigger>
          <TabsTrigger value="airdrops" className="data-[state=active]:neon-button">
            <Gift className="w-4 h-4 mr-2" />
            Airdrops
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-4">
          {DISTRIBUTION_PHASES.map((phase, index) => (
            <Card key={index} className="neon-card cursor-pointer hover:border-cyan-400/50 transition-colors"
                  onClick={() => setSelectedPhase(selectedPhase?.name === phase.name ? null : phase)}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{phase.name}</h3>
                      {phase.status === "active" && <Zap className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Allocation</p>
                      <p className="text-white font-medium">{phase.allocation}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tokens</p>
                      <p className="text-cyan-400 font-medium">
                        {(parseFloat(phase.totalTokens) / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="text-green-400 font-medium">
                        {phase.price > 0 ? `$${phase.price}` : "Free"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress value={phase.allocation} className="h-1" />
                    <p className="text-xs text-gray-400">{phase.description}</p>
                  </div>

                  {selectedPhase?.name === phase.name && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400">Start Date</p>
                          <p className="text-white">{phase.startDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">End Date</p>
                          <p className="text-white">{phase.endDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                      {phase.status === "active" && phase.price > 0 && (
                        <Button className="w-full neon-button text-xs mt-2">
                          <Coins className="w-3 h-3 mr-1" />
                          Participate in {phase.name}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="airdrops" className="space-y-4">
          <Card className="neon-card">
            <CardContent className="py-8 text-center">
              <div className="space-y-3">
                <Gift className="w-12 h-12 text-gray-400 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-400">No Airdrops Available</h3>
                <p className="text-gray-500 text-sm">No airdrop campaigns are currently active</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tokenomics Summary */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <CardTitle className="text-green-400 text-sm">Tokenomics Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Supply:</span>
              <span className="text-white font-medium">100,000,000 NFTY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Initial Price:</span>
              <span className="text-green-400 font-medium">$0.005 - $0.01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Deflationary Mechanism:</span>
              <span className="text-orange-400 font-medium">5% burn on transactions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Staking Rewards:</span>
              <span className="text-purple-400 font-medium">12-25% APY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Governance:</span>
              <span className="text-blue-400 font-medium">DAO voting rights</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}