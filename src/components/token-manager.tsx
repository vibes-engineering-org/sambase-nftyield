"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { useBaseAppToken } from "~/hooks/useBaseAppToken";
import { useToast } from "~/hooks/use-toast";
import { Send, Trash2, QrCode, Copy, Wallet, Check } from "lucide-react";
import { useAccount } from "wagmi";
import { Address, isAddress } from "viem";

export default function TokenManager() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"send" | "burn">("send");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    isConnected,
    isLoading,
    userBalance,
    transferTokens,
    burnTokens,
  } = useBaseAppToken();

  const handleTransfer = async () => {
    if (!recipientAddress || !transferAmount) {
      toast({
        title: "Missing Information",
        description: "Please enter recipient address and amount.",
        variant: "destructive"
      });
      return;
    }

    if (!isAddress(recipientAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address.",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(transferAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    try {
      await transferTokens(recipientAddress as Address, transferAmount);
      toast({
        title: "Transfer Initiated",
        description: `Sending ${transferAmount} BAPP tokens to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
      });
      setRecipientAddress("");
      setTransferAmount("");
    } catch (err) {
      toast({
        title: "Transfer Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBurn = async () => {
    if (!burnAmount) {
      toast({
        title: "Missing Amount",
        description: "Please enter the amount to burn.",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(burnAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    try {
      await burnTokens(burnAmount);
      toast({
        title: "Burn Initiated",
        description: `Burning ${burnAmount} BAPP tokens from your wallet.`,
      });
      setBurnAmount("");
    } catch (err) {
      toast({
        title: "Burn Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Your address has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard.",
        variant: "destructive"
      });
    }
  };

  if (!isConnected) {
    return (
      <Card className="neon-card">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-white">Connect Your Wallet</h3>
              <p className="text-gray-400 text-sm">
                Connect your wallet to send, receive, and burn BAPP tokens
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Info */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-400 text-lg">Your Wallet</CardTitle>
              <CardDescription className="text-gray-300 text-sm">
                Manage your BAPP tokens
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance */}
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-400">Your BAPP Balance</p>
              <p className="text-2xl font-bold text-blue-400">{userBalance}</p>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Your Address</p>
                <p className="text-sm font-mono text-white truncate">
                  {address}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyAddress}
                className="ml-2 text-gray-400 hover:text-white"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/80 rounded-lg neon-border">
        <Button
          variant={activeTab === "send" ? "default" : "ghost"}
          onClick={() => setActiveTab("send")}
          className={`${activeTab === "send" ? "neon-button" : "text-gray-300 hover:text-white"} text-sm`}
        >
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
        <Button
          variant={activeTab === "burn" ? "default" : "ghost"}
          onClick={() => setActiveTab("burn")}
          className={`${activeTab === "burn" ? "neon-button" : "text-gray-300 hover:text-white"} text-sm`}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Burn
        </Button>
      </div>

      {/* Send Tokens */}
      {activeTab === "send" && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send BAPP Tokens
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              Transfer tokens to another wallet address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-cyan-400 font-medium text-sm">
                Recipient Address
              </Label>
              <Input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="neon-input text-sm font-mono"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-cyan-400 font-medium text-sm">
                Amount (BAPP)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="neon-input text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferAmount("100")}
                className="text-xs text-gray-300 border-gray-600"
                disabled={isLoading}
              >
                100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferAmount("1000")}
                className="text-xs text-gray-300 border-gray-600"
                disabled={isLoading}
              >
                1K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferAmount("10000")}
                className="text-xs text-gray-300 border-gray-600"
                disabled={isLoading}
              >
                10K
              </Button>
            </div>

            <Button
              onClick={handleTransfer}
              disabled={!recipientAddress || !transferAmount || isLoading}
              className="w-full neon-button text-sm py-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Burn Tokens */}
      {activeTab === "burn" && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Burn BAPP Tokens
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              Permanently destroy tokens from your wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">
                <strong>Warning:</strong> Burning tokens is permanent and cannot be undone.
                The tokens will be removed from circulation forever.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="burnAmount" className="text-red-400 font-medium text-sm">
                Amount to Burn (BAPP)
              </Label>
              <Input
                id="burnAmount"
                type="number"
                placeholder="100"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                className="neon-input text-sm border-red-500/30 focus:border-red-500"
                disabled={isLoading}
              />
            </div>

            {/* Quick Burn Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBurnAmount("100")}
                className="text-xs text-red-300 border-red-600 hover:bg-red-600/20"
                disabled={isLoading}
              >
                100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBurnAmount("1000")}
                className="text-xs text-red-300 border-red-600 hover:bg-red-600/20"
                disabled={isLoading}
              >
                1K
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBurnAmount("10000")}
                className="text-xs text-red-300 border-red-600 hover:bg-red-600/20"
                disabled={isLoading}
              >
                10K
              </Button>
            </div>

            <Button
              onClick={handleBurn}
              disabled={!burnAmount || isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-4"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Burning...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Burn Tokens
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}