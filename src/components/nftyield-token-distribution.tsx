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
    status: "completed",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-02-01"),
    description: "Early investors and founders"
  },
  {
    name: "Private Sale",
    allocation: 15,
    totalTokens: "15000000",
    price: 0.008,
    status: "completed",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-03-01"),
    description: "Strategic partners and VCs"
  },
  {
    name: "Public Sale",
    allocation: 25,
    totalTokens: "25000000",
    price: 0.01,
    status: "active",
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

const AIRDROP_CAMPAIGNS: AirdropCampaign[] = [
  {
    id: "genesis_airdrop",
    name: "Genesis Airdrop",
    tokensPerUser: "100",
    totalTokens: "1000000",
    claimed: "250000",
    requirements: ["Hold NFT in wallet", "Join Discord", "Follow Twitter"],
    status: "active",
    endDate: new Date("2024-12-31")
  },
  {
    id: "yield_farmers",
    name: "Yield Farmers",
    tokensPerUser: "50",
    totalTokens: "500000",
    claimed: "150000",
    requirements: ["Create yield pool", "Stake for 30+ days"],
    status: "active",
    endDate: new Date("2025-06-30")
  }
];

export default function NFTYieldTokenDistribution() {
  const [selectedPhase, setSelectedPhase] = useState<DistributionPhase | null>(null);
  const [userEligibility, setUserEligibility] = useState({
    hasNFT: false,
    hasDiscord: false,
    hasTwitter: false,
    hasYieldPool: false,
    stakingDays: 0
  });

  const totalDistributed = DISTRIBUTION_PHASES
    .filter(phase => phase.status === "completed")
    .reduce((sum, phase) => sum + parseFloat(phase.totalTokens), 0);

  const currentPrice = DISTRIBUTION_PHASES.find(p => p.status === "active")?.price || 0.01;

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
              <p className="text-xl font-bold text-green-400">${currentPrice}</p>
            </div>
            <div>
              <p className="text-gray-400">Total Distributed</p>
              <p className="text-xl font-bold text-blue-400">
                {(totalDistributed / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-gray-400">Market Cap</p>
              <p className="text-lg font-bold text-purple-400">
                ${(totalDistributed * currentPrice / 1000).toFixed(0)}K
              </p>
            </div>
            <div>
              <p className="text-gray-400">Holders</p>
              <p className="text-lg font-bold text-yellow-400">1,247</p>
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
          {AIRDROP_CAMPAIGNS.map((campaign) => {
            const progress = (parseFloat(campaign.claimed) / parseFloat(campaign.totalTokens)) * 100;
            const isClaimed = claims.includes(campaign.id);

            let isEligible = false;
            if (campaign.id === "genesis_airdrop") {
              isEligible = userEligibility.hasNFT && userEligibility.hasDiscord && userEligibility.hasTwitter;
            } else if (campaign.id === "yield_farmers") {
              isEligible = userEligibility.hasYieldPool && userEligibility.stakingDays >= 30;
            }

            return (
              <Card key={campaign.id} className="neon-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-purple-400" />
                      <CardTitle className="text-purple-400 text-sm">{campaign.name}</CardTitle>
                    </div>
                    <Badge className={campaign.status === "active" ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}>
                      {campaign.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {campaign.tokensPerUser} NFTY per eligible user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-400">Reward</p>
                      <p className="text-green-400 font-bold">{campaign.tokensPerUser} NFTY</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Ends</p>
                      <p className="text-white">{campaign.endDate.toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Claimed</span>
                      <span className="text-white">
                        {(parseFloat(campaign.claimed) / 1000).toFixed(0)}K / {(parseFloat(campaign.totalTokens) / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-300">Requirements:</p>
                    <div className="space-y-1">
                      {campaign.requirements.map((req, index) => {
                        let isMet = false;
                        if (req.includes("NFT")) isMet = userEligibility.hasNFT;
                        if (req.includes("Discord")) isMet = userEligibility.hasDiscord;
                        if (req.includes("Twitter")) isMet = userEligibility.hasTwitter;
                        if (req.includes("pool")) isMet = userEligibility.hasYieldPool;
                        if (req.includes("30+ days")) isMet = userEligibility.stakingDays >= 30;

                        return (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${isMet ? "bg-green-400" : "bg-gray-600"}`} />
                            <span className={isMet ? "text-green-400" : "text-gray-400"}>{req}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={() => claimAirdrop(campaign.id)}
                    disabled={!isEligible || isClaimed || campaign.status !== "active"}
                    className="w-full neon-button text-xs"
                  >
                    {isClaimed ? (
                      <>
                        <Award className="w-3 h-3 mr-1" />
                        Already Claimed
                      </>
                    ) : !isEligible ? (
                      <>
                        <Users className="w-3 h-3 mr-1" />
                        Requirements Not Met
                      </>
                    ) : (
                      <>
                        <Gift className="w-3 h-3 mr-1" />
                        Claim {campaign.tokensPerUser} NFTY
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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