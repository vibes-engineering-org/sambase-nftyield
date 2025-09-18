"use client";

import { useState, useEffect, useCallback } from "react";
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
    // Check if we already have a saved referral code
    const savedCode = localStorage.getItem('nftyield_referral_code');
    if (savedCode) {
      setReferralCode(savedCode);
      return;
    }

    if (sdk?.context?.user?.fid) {
      const code = `NFT-${sdk.context.user.fid.toString().padStart(6, '0')}`;
      setReferralCode(code);
      localStorage.setItem('nftyield_referral_code', code);
    } else if (sdk?.isSDKLoaded) {
      // Fallback random code only after SDK is loaded to ensure consistency
      const randomCode = `NFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setReferralCode(randomCode);
      localStorage.setItem('nftyield_referral_code', randomCode);
    }
  }, [sdk?.context?.user, sdk?.isSDKLoaded]);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      // Ensure we're in browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      const savedReferrals = localStorage.getItem('nftyield_referrals');
      const savedBonus = localStorage.getItem('nftyield_referral_bonus');
      const savedNotifications = localStorage.getItem('nftyield_notifications');

      if (savedReferrals) {
        const parsedReferrals = JSON.parse(savedReferrals).map((ref: any) => ({
          ...ref,
          createdAt: new Date(ref.createdAt)
        }));
        setReferrals(parsedReferrals);
      }
      if (savedBonus) {
        const bonus = parseFloat(savedBonus);
        if (!isNaN(bonus)) {
          setTotalBonus(bonus);
        }
      }
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.warn('Failed to load referral data from localStorage:', error);
      // Reset to defaults if data is corrupted
      setReferrals([]);
      setTotalBonus(0);
      setNotifications([]);
    }
  }, []);

  // Save data to localStorage
  const saveData = (newReferrals: Referral[], newBonus: number) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('nftyield_referrals', JSON.stringify(newReferrals));
        localStorage.setItem('nftyield_referral_bonus', newBonus.toString());
      }
      setReferrals(newReferrals);
      setTotalBonus(newBonus);
    } catch (error) {
      console.warn('Failed to save referral data:', error);
      setReferrals(newReferrals);
      setTotalBonus(newBonus);
    }
  };

  const copyReferralLink = useCallback(async () => {
    if (!referralCode) {
      toast({
        title: "Referral Code Not Ready",
        description: "Please wait for your referral code to be generated",
        variant: "destructive"
      });
      return;
    }

    const referralLink = `https://nftyield.app?ref=${referralCode}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Referral Link Copied",
          description: "Share this link to earn referral bonuses"
        });
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = referralLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          textArea.remove();
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast({
            title: "Referral Link Copied",
            description: "Share this link to earn referral bonuses"
          });
        } catch (err) {
          textArea.remove();
          throw new Error("Copy command failed");
        }
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy Failed",
        description: `Manual copy: ${referralLink}`,
        variant: "destructive"
      });
    }
  }, [referralCode, toast]);

  // Simulate referral registration (would be called when someone uses referral link)
  const addReferral = useCallback((referredUser: string) => {
    if (!referredUser || referredUser.trim() === '') {
      toast({
        title: "Invalid Referral",
        description: "Referred user address cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Check if referral already exists
    const existingReferral = referrals.find(ref =>
      ref.referredUser.toLowerCase() === referredUser.toLowerCase()
    );

    if (existingReferral) {
      toast({
        title: "Referral Already Exists",
        description: "This user has already been referred",
        variant: "destructive"
      });
      return;
    }

    const newReferral: Referral = {
      id: Date.now().toString(),
      referredUser: referredUser.trim(),
      status: "pending",
      bonusEarned: 0,
      createdAt: new Date()
    };

    const updatedReferrals = [...referrals, newReferral];
    saveData(updatedReferrals, totalBonus);

    addNotification(`New referral: ${referredUser.slice(0, 8)}... registered`);

    toast({
      title: "Referral Added Successfully",
      description: "You'll earn bonuses when they lock tokens"
    });
  }, [referrals, totalBonus, toast]);

  // Update referral status when they lock tokens
  const updateReferralStatus = useCallback((referralId: string, newStatus: "locked" | "completed") => {
    if (!referralId) {
      toast({
        title: "Invalid Referral ID",
        description: "Cannot update referral status",
        variant: "destructive"
      });
      return;
    }

    const referralToUpdate = referrals.find(ref => ref.id === referralId);
    if (!referralToUpdate) {
      toast({
        title: "Referral Not Found",
        description: "Unable to find the referral to update",
        variant: "destructive"
      });
      return;
    }

    const updatedReferrals = referrals.map(ref => {
      if (ref.id === referralId) {
        // Progressive bonus: $2.50 on lock, additional $2.50 on completion (total $5)
        const bonus = newStatus === "locked" ? 2.5 : newStatus === "completed" ? 5 : 0;
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

    const bonusAmount = newStatus === "locked" ? 2.5 : newStatus === "completed" ? 2.5 : 0;
    if (bonusAmount > 0) {
      onReferralComplete(bonusAmount);
      addNotification(`Earned $${bonusAmount} referral bonus!`);

      toast({
        title: "Referral Bonus Earned!",
        description: `You earned $${bonusAmount} from your referral`,
      });
    }
  }, [referrals, toast, onReferralComplete]);

  const addNotification = useCallback((message: string) => {
    if (!message || message.trim() === '') return;

    setNotifications(prev => {
      const newNotifications = [message.trim(), ...prev].slice(0, 10); // Keep last 10
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('nftyield_notifications', JSON.stringify(newNotifications));
        }
      } catch (error) {
        console.warn('Failed to save notifications:', error);
      }
      return newNotifications;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.setItem('nftyield_notifications', JSON.stringify([]));
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been removed"
    });
  }, [toast]);

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
                value={referralCode || "Generating..."}
                readOnly
                className="neon-input text-sm font-mono"
                placeholder="Loading referral code..."
              />
              <Button
                onClick={copyReferralLink}
                disabled={!referralCode}
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
                onClick={() => {
                  const pendingRef = referrals.find(r => r.status === "pending");
                  if (pendingRef) {
                    updateReferralStatus(pendingRef.id, "locked");
                  }
                }}
                className="text-xs bg-yellow-600 hover:bg-yellow-700"
              >
                Lock Tokens ({pendingReferrals})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}