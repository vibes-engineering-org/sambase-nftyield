"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { Shield, Wallet, Check, Flame, TrendingUp } from "lucide-react";

export default function AdminSection() {
  const [adminWallet, setAdminWallet] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitWallet = async () => {
    if (!adminWallet || !adminWallet.startsWith("0x") || adminWallet.length !== 42) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid Ethereum wallet address starting with 0x",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call to store admin wallet
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
      toast({
        title: "Wallet Address Submitted",
        description: "Admin wallet has been configured to receive registration fees.",
      });
    }, 1000);
  };

  return (
    <Card className="neon-card border-cyan-500/20">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-2">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <CardTitle className="neon-text text-lg">Admin Dashboard</CardTitle>
        <CardDescription className="text-gray-300 text-sm">
          Monitor Samish Creator token burns and refunds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Analytics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-orange-400">$127.50</div>
            <div className="text-xs text-gray-400">Total Burned</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-400">$89.50</div>
            <div className="text-xs text-gray-400">Pending Refunds</div>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="adminWallet" className="text-cyan-400 font-medium text-sm">
                Admin Wallet Address
              </Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
                <Input
                  id="adminWallet"
                  placeholder="0x742d35Cc..."
                  value={adminWallet}
                  onChange={(e) => setAdminWallet(e.target.value)}
                  className="neon-input pl-10 text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmitWallet}
              disabled={isLoading || !adminWallet}
              className="w-full neon-button text-sm"
            >
              {isLoading ? "Submitting..." : "Configure Admin Wallet"}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-400">Admin Configured</h3>
              <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                {adminWallet}
              </p>
            </div>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setAdminWallet("");
              }}
              variant="outline"
              size="sm"
              className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs"
            >
              Update
            </Button>
          </div>
        )}

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
          <h4 className="text-purple-400 font-medium text-sm mb-2">Token Mechanics</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Users purchase $10 Samish Creator tokens on Zora</li>
            <li>• $5 automatically burned (deflationary)</li>
            <li>• $5 held as refundable deposit</li>
            <li>• Supports @samish creator economy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}