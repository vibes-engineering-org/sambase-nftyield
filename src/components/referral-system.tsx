"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { Users, Gift, Copy, Check, Bell, Trophy } from "lucide-react";
import { useMiniAppSdk } from "~/hooks/use-miniapp-sdk";

interface Referral {
  id: string;
  referredUser: string;
  status: "pending" | "locked" | "completed";
  bonusEarned: number;
  createdAt: Date;
}

interface ReferralSystemProps {
  onReferralComplete: (bonus: number) => void;
}

export default function ReferralSystem({ onReferralComplete }: ReferralSystemProps) {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalBonus, setTotalBonus] = useState(0);
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const { toast } = useToast();
  const sdk = useMiniAppSdk();

  // Generate referral code based on user address or FID
  useEffect(() => {
    if (sdk?.context?.user?.fid) {
      const code = `NFT-${sdk.context.user.fid.toString().padStart(6, '0')}`;
      setReferralCode(code);
    } else {
      // Fallback random code
      const randomCode = `NFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setReferralCode(randomCode);
    }
  }, [sdk?.context?.user]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedReferrals = localStorage.getItem('nftyield_referrals');
    const savedBonus = localStorage.getItem('nftyield_referral_bonus');
    const savedNotifications = localStorage.getItem('nftyield_notifications');

    if (savedReferrals) {
      setReferrals(JSON.parse(savedReferrals));
    }
    if (savedBonus) {
      setTotalBonus(parseFloat(savedBonus));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save data to localStorage
  const saveData = (newReferrals: Referral[], newBonus: number) => {
    localStorage.setItem('nftyield_referrals', JSON.stringify(newReferrals));
    localStorage.setItem('nftyield_referral_bonus', newBonus.toString());
    setReferrals(newReferrals);
    setTotalBonus(newBonus);
  };

  const copyReferralLink = async () => {
    const referralLink = `https://nftyield.app?ref=${referralCode}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Referral Link Copied",
        description: "Share this link to earn referral bonuses"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  // Simulate referral registration (would be called when someone uses referral link)
  const addReferral = (referredUser: string) => {
    const newReferral: Referral = {
      id: Date.now().toString(),
      referredUser,
      status: "pending",
      bonusEarned: 0,
      createdAt: new Date()
    };

    const updatedReferrals = [...referrals, newReferral];
    saveData(updatedReferrals, totalBonus);

    addNotification(`New referral: ${referredUser.slice(0, 8)}... registered`);
  };

  // Update referral status when they lock tokens
  const updateReferralStatus = (referralId: string, newStatus: "locked" | "completed") => {
    const updatedReferrals = referrals.map(ref => {
      if (ref.id === referralId) {
        const bonus = newStatus === "locked" ? 2.5 : 5; // $2.50 on lock, $5 total on completion
        return {
          ...ref,
          status: newStatus,
          bonusEarned: bonus
        };
      }
      return ref;
    });

    const newTotalBonus = updatedReferrals.reduce((sum, ref) => sum + ref.bonusEarned, 0);
    saveData(updatedReferrals, newTotalBonus);

    const bonusAmount = newStatus === "locked" ? 2.5 : 5;
    onReferralComplete(bonusAmount);

    addNotification(`Earned $${bonusAmount} referral bonus!`);

    toast({
      title: "Referral Bonus Earned!",
      description: `You earned $${bonusAmount} from your referral`,
    });
  };

  const addNotification = (message: string) => {
    const newNotifications = [message, ...notifications].slice(0, 10); // Keep last 10
    setNotifications(newNotifications);
    localStorage.setItem('nftyield_notifications', JSON.stringify(newNotifications));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('nftyield_notifications', JSON.stringify([]));
  };

  const pendingReferrals = referrals.filter(r => r.status === "pending").length;
  const completedReferrals = referrals.filter(r => r.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Referral Stats */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Referral Rewards
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            Invite friends and earn bonuses when they lock tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gradient-to-b from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
              <div className="text-lg font-bold text-purple-400">{referrals.length}</div>
              <div className="text-xs text-gray-400">Total Refs</div>
            </div>
            <div className="bg-gradient-to-b from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="text-lg font-bold text-green-400">{completedReferrals}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="bg-gradient-to-b from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="text-lg font-bold text-yellow-400">${totalBonus.toFixed(2)}</div>
              <div className="text-xs text-gray-400">Earned</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-2">
            <Label className="text-cyan-400 font-medium text-sm">Your Referral Code</Label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="neon-input text-sm font-mono"
              />
              <Button
                onClick={copyReferralLink}
                className={`px-3 ${copied ? "neon-button-success" : "neon-button"}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Share your code to earn $2.50 when friends lock tokens, $5 when they complete pools
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-pink-400 text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <Button
                onClick={clearNotifications}
                variant="ghost"
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.slice(0, 5).map((notification, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-2"
              >
                <p className="text-sm text-gray-300">{notification}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Referral List */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-400 text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Referrals ({referrals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No referrals yet</p>
              <p className="text-xs text-gray-500 mt-1">Share your code to start earning</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-black" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {referral.referredUser.slice(0, 12)}...
                      </p>
                      <p className="text-xs text-gray-400">
                        {referral.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        referral.status === "completed"
                          ? "border-green-500/50 text-green-400"
                          : referral.status === "locked"
                          ? "border-yellow-500/50 text-yellow-400"
                          : "border-gray-500/50 text-gray-400"
                      }`}
                    >
                      {referral.status.toUpperCase()}
                    </Badge>
                    {referral.bonusEarned > 0 && (
                      <div className="text-sm font-bold text-green-400">
                        +${referral.bonusEarned}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug: Test Referral Actions */}
      <Card className="neon-card border-dashed border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-400 text-sm">Test Actions (Debug)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={() => addReferral("0x1234567890abcdef")}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              Add Test Referral
            </Button>
            {pendingReferrals > 0 && (
              <Button
                onClick={() => updateReferralStatus(referrals.find(r => r.status === "pending")?.id || "", "locked")}
                className="text-xs bg-yellow-600 hover:bg-yellow-700"
              >
                Lock Tokens
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}