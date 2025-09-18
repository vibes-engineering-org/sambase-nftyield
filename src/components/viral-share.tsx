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

    return `Just earned ${totalEarned} tokens from my ${nftCount} NFTs in NFTYield pools! 🚀

💎 Managing ${poolCount} active yield pools
⚡ Up to ${maxReward}% rewards per NFT
🔥 Passive income from my NFT collection

Join the NFTYield revolution and turn your NFTs into income!
#NFTYield #PassiveIncome #Web3 #DeFi`;
  };

  const generateMilestoneText = () => {
    if (pools.length >= 5) {
      return `🎉 Milestone achieved! I just created my ${pools.length}th NFTYield pool!

Power user status unlocked! 💪
Earning passive income from multiple NFT collections with NFTYield.

Ready to maximize your NFT potential? Join me! 🚀
#NFTYield #PowerUser #Web3`;
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
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="neon-text text-xl">Share Your Success</CardTitle>
        <CardDescription className="text-gray-300">
          Show the world how you're earning with NFTYield
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-cyan-400">{pools.length}</div>
            <div className="text-xs text-gray-400">Active Pools</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-purple-400">{nftCount}</div>
            <div className="text-xs text-gray-400">NFTs Earning</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-pink-400">{totalEarned}</div>
            <div className="text-xs text-gray-400">Tokens Earned</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Your Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Badge
                  key={achievement.label}
                  variant={achievement.condition ? "default" : "secondary"}
                  className={achievement.condition
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "bg-gray-700 text-gray-400"
                  }
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {achievement.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Share Preview */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Share Preview</h4>
          <p className="text-xs text-gray-400 whitespace-pre-line">
            {generateShareText()}
          </p>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Share on Social Media</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShare("twitter")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={pools.length === 0}
            >
              Share on Twitter
            </Button>
            <Button
              onClick={() => handleShare("facebook")}
              className="bg-blue-700 hover:bg-blue-800 text-white"
              disabled={pools.length === 0}
            >
              Share on Facebook
            </Button>
            <Button
              onClick={() => handleShare("linkedin")}
              className="bg-blue-800 hover:bg-blue-900 text-white"
              disabled={pools.length === 0}
            >
              Share on LinkedIn
            </Button>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={pools.length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </Button>
          </div>
        </div>

        {/* Farcaster Share */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Share on Farcaster</h4>
          <ShareCastButton
            text={generateShareText()}
            className="w-full neon-button"
            variant="default"
          />
        </div>

        {/* Share Stats */}
        {shareStats.shares > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-green-400 text-sm font-medium">
              🎉 You've shared {shareStats.shares} time{shareStats.shares !== 1 ? 's' : ''}!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Keep sharing to grow the NFTYield community!
            </p>
          </div>
        )}

        {pools.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-4">
            Create your first yield pool to unlock sharing features
          </div>
        )}
      </CardContent>
    </Card>
  );
}