"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { Shield, Wallet, Check } from "lucide-react";

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
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="neon-text text-xl">Admin Configuration</CardTitle>
        <CardDescription className="text-gray-300">
          Configure the wallet address to receive $10 USDC registration fees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSubmitted ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminWallet" className="text-cyan-400 font-medium">
                Admin Wallet Address
              </Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                <Input
                  id="adminWallet"
                  placeholder="0x742d35Cc6564C0532E8c55DF0b6beE"
                  value={adminWallet}
                  onChange={(e) => setAdminWallet(e.target.value)}
                  className="neon-input pl-10"
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-gray-400">
                This wallet will receive all $10 USDC registration fees from pool creators
              </p>
            </div>

            <Button
              onClick={handleSubmitWallet}
              disabled={isLoading || !adminWallet}
              className="w-full neon-button"
            >
              {isLoading ? "Submitting..." : "Configure Admin Wallet"}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400">Configuration Complete</h3>
              <p className="text-gray-300 text-sm mt-2">
                Admin wallet configured successfully
              </p>
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
              className="border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
            >
              Update Wallet
            </Button>
          </div>
        )}

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <h4 className="text-purple-400 font-medium text-sm mb-2">How It Works</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Users pay $10 USDC registration fee to create pools</li>
            <li>• Fees are automatically sent to the configured admin wallet</li>
            <li>• Admin wallet receives all registration payments securely</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}