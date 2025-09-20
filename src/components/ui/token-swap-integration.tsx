"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ExternalLink, ArrowUpDown, TrendingUp } from "lucide-react";

interface TokenSwapIntegrationProps {
  tokenAddress?: string;
  tokenSymbol?: string;
}

const SWAP_PLATFORMS = [
  {
    name: "Uniswap V3",
    url: "https://app.uniswap.org/#/swap",
    description: "Leading DEX on Base",
    color: "text-pink-400 border-pink-400"
  },
  {
    name: "Aerodrome",
    url: "https://aerodrome.finance/swap",
    description: "Base's native DEX",
    color: "text-blue-400 border-blue-400"
  },
  {
    name: "BaseSwap",
    url: "https://baseswap.fi/swap",
    description: "Community DEX",
    color: "text-green-400 border-green-400"
  }
];

export default function TokenSwapIntegration({
  tokenAddress = "0x0000000000000000000000000000000000000000",
  tokenSymbol = "BAPP"
}: TokenSwapIntegrationProps) {
  const isContractDeployed = tokenAddress !== "0x0000000000000000000000000000000000000000";

  const openSwap = (baseUrl: string) => {
    if (!isContractDeployed) return;

    const swapUrl = `${baseUrl}?outputCurrency=${tokenAddress}`;
    window.open(swapUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="neon-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <ArrowUpDown className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-purple-400 text-lg">Trade {tokenSymbol}</CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              {isContractDeployed ? "Trade on Base Network DEXs" : "Available after contract deployment"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isContractDeployed && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
            <p className="text-orange-400 text-sm font-medium">
              Deploy your token contract first to enable DEX trading
            </p>
          </div>
        )}

        <div className="space-y-3">
          {SWAP_PLATFORMS.map((platform) => (
            <div
              key={platform.name}
              className={`bg-gray-900/50 border border-gray-700 rounded-lg p-3 ${
                isContractDeployed ? "hover:border-gray-600 transition-colors" : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium text-sm">{platform.name}</h3>
                    <Badge variant="outline" className={`text-xs ${platform.color}`}>
                      DEX
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-xs">{platform.description}</p>
                </div>
                <Button
                  onClick={() => openSwap(platform.url)}
                  disabled={!isContractDeployed}
                  variant="outline"
                  size="sm"
                  className="ml-3"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Swap
                </Button>
              </div>
            </div>
          ))}
        </div>

        {isContractDeployed && (
          <div className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-sm font-medium text-green-400">Trading Active</p>
            </div>
            <p className="text-xs text-gray-400">
              {tokenSymbol} is tradeable on Base network DEXs. Add liquidity to improve trading experience.
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Trading fees and slippage apply. Always verify contract address before trading.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}