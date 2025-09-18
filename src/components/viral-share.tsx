"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ShareCastButton } from "~/components/share-cast-button";
import { useToast } from "~/hooks/use-toast";
import { Share2, Trophy, Zap, TrendingUp, Copy } from "lucide-react";

interface ViralShareProps {
  pools: Array<{
    id: string;
    nftCollection: string;
    rewardPercentage: number;
    contributionAmount: string;
    duration: number;
  }>;
  totalEarned?: string;
  nftCount?: number;
}

export default function ViralShare({ pools, totalEarned = "0", nftCount = 0 }: ViralShareProps) {
  const [shareStats, setShareStats] = useState({ shares: 0, views: 0 });
  const { toast } = useToast();

  const generateShareText = () => {
    const poolCount = pools.length;
    const maxReward = Math.max(...pools.map(p => p.rewardPercentage), 0);

    return `Just earned ${totalEarned} tokens from my ${nftCount} NFTs using NFTYield!

💎 ${poolCount} active yield pools earning passive income
⚡ Up to ${maxReward}% rewards per NFT
🔥 Powered by $SAMISH Creator token on @zora
💰 Deflationary mechanics: $5 burned, $5 refundable

Turn your NFTs into yield machines!
#NFTYield #SAMISH #Base #Zora #CreatorEconomy`;
  };

  const generateMilestoneText = () => {
    if (pools.length >= 5) {
      return `🎉 Power User Milestone! I just created my ${pools.length}th NFTYield pool!

💪 Managing multiple NFT yield streams
🔥 All powered by $SAMISH Creator tokens
💰 Supporting @samish on @zora while earning yield

The deflationary tokenomics are working! Ready to join? 🚀
#NFTYield #SAMISH #PowerUser #CreatorEconomy`;
    }

    return generateShareText();
  };

  const handleShare = (platform: string) => {
    const text = generateShareText();
    const encodedText = encodeURIComponent(text);
    const url = encodeURIComponent(window.location.origin);

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedText}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${encodedText}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      setShareStats(prev => ({ ...prev, shares: prev.shares + 1 }));
      toast({
        title: "Share Successful",
        description: `Your NFTYield success story has been shared on ${platform}!`,
      });
    }
  };

  const copyToClipboard = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Share text copied! Paste it anywhere to spread the word.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const achievements = [
    { label: "Pool Creator", condition: pools.length > 0, icon: Zap },
    { label: "Multi-Pool Manager", condition: pools.length >= 3, icon: TrendingUp },
    { label: "Power User", condition: pools.length >= 5, icon: Trophy },
  ];

  return (
    <Card className="neon-card border-purple-500/20">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <CardTitle className="neon-text text-lg">Share Your Success</CardTitle>
        <CardDescription className="text-gray-300 text-sm">
          Show the world how NFTYield works
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-lg font-bold text-cyan-400">{pools.length}</div>
            <div className="text-xs text-gray-400">Pools</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-purple-400">{nftCount}</div>
            <div className="text-xs text-gray-400">NFTs</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-pink-400">{totalEarned}</div>
            <div className="text-xs text-gray-400">Earned</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Achievements</h4>
          <div className="flex flex-wrap gap-1">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Badge
                  key={achievement.label}
                  variant={achievement.condition ? "default" : "secondary"}
                  className={`text-xs ${achievement.condition
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "bg-gray-700 text-gray-400"
                  }`}
                >
                  <Icon className="w-2 h-2 mr-1" />
                  {achievement.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Share Preview */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
          <p className="text-xs text-gray-400 whitespace-pre-line">
            {generateShareText()}
          </p>
        </div>

        {/* Primary Farcaster Share */}
        <ShareCastButton
          text={generateShareText()}
          className="w-full neon-button text-sm py-3"
          variant="default"
        />

        {/* Secondary Social Share */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleShare("twitter")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
            disabled={pools.length === 0}
          >
            Twitter
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs py-2"
            disabled={pools.length === 0}
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>

        {/* Share Stats */}
        {shareStats.shares > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
            <p className="text-green-400 text-xs font-medium">
              Shared {shareStats.shares} time{shareStats.shares !== 1 ? 's' : ''}!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Growing the NFTYield community
            </p>
          </div>
        )}

        {pools.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-3">
            Create your first pool to unlock sharing
          </div>
        )}
      </CardContent>
    </Card>
  );
}