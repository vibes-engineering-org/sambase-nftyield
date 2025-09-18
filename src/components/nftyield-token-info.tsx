"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Coins,
  ExternalLink,
  Copy,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useToast } from "~/hooks/use-toast";

interface TokenInfo {
  name: string;
  symbol: string;
  contractAddress: string;
  network: string;
  explorer: string;
  decimals: number;
  utility: string[];
}

const NFTYIELD_TOKEN: TokenInfo = {
  name: "NFTYIELD",
  symbol: "NFTY",
  contractAddress: "Please contact team for contract address",
  network: "Base Network",
  explorer: "",
  decimals: 18,
  utility: [
    "NFT Yield Pool Participation",
    "Platform Governance Rights",
    "Access to Premium Features",
    "Community Rewards"
  ]
};

export default function NFTYieldTokenInfo() {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  const handleCopyAddress = async () => {
    if (NFTYIELD_TOKEN.contractAddress === "Please contact team for contract address") {
      toast({
        title: "Token Not Deployed Yet",
        description: "Contract address will be available after token deployment",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(NFTYIELD_TOKEN.contractAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast({
        title: "Address Copied",
        description: "Contract address copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy address to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Token Overview */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-cyan-400">NFTYIELD Token</CardTitle>
          </div>
          <CardDescription className="text-gray-300">
            Utility token for NFT yield pools and platform governance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Token Name</p>
              <p className="font-medium text-white">{NFTYIELD_TOKEN.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Symbol</p>
              <p className="font-medium text-white">{NFTYIELD_TOKEN.symbol}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Network</p>
              <Badge className="bg-blue-500/20 text-blue-300">
                {NFTYIELD_TOKEN.network}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Decimals</p>
              <p className="font-medium text-white">{NFTYIELD_TOKEN.decimals}</p>
            </div>
          </div>

          <Separator className="bg-gray-800/50" />

          {/* Contract Address */}
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Contract Address</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-900/50 rounded p-2 font-mono text-xs text-gray-300">
                {NFTYIELD_TOKEN.contractAddress}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyAddress}
                className="text-gray-400 hover:text-white"
                disabled={NFTYIELD_TOKEN.contractAddress === "Please contact team for contract address"}
              >
                {copiedAddress ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Utility */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            <CardTitle className="text-purple-400 text-sm">Token Utility</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {NFTYIELD_TOKEN.utility.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <ChevronRight className="w-3 h-3 text-purple-400" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Purchase */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <CardTitle className="text-yellow-400 text-sm">How to Purchase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-yellow-400">Token Not Yet Available</p>
            <p className="text-xs text-gray-300">
              The NFTYIELD token is currently under development. Purchase methods will be available once the token is deployed.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-cyan-400">Future Purchase Options:</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>• Decentralized exchanges (DEX) on Base Network</p>
              <p>• Direct minting through NFTYield platform</p>
              <p>• Yield pool rewards and incentives</p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full text-xs border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
              disabled
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              Purchase Options Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-orange-500/20 bg-orange-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-orange-400">Important Notice</p>
              <p className="text-xs text-gray-300">
                This token is currently in development. No staking functionality is available.
                The token serves as a utility for NFT yield pool participation only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}