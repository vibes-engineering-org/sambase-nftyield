"use client";

import { useState } from "react";
import { parseEther, formatEther } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

const MARKETING_WALLET = "0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2";
const MARKETING_PERCENTAGE = 10;

// Simple split contract ABI
const SPLIT_CONTRACT_ABI = [
  {
    inputs: [
      { name: "_marketingWallet", type: "address" },
      { name: "_recipients", type: "address[]" },
      { name: "_percentages", type: "uint256[]" }
    ],
    name: "createSplit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "distributeFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export default function SplitContract() {
  const { address, isConnected } = useAccount();
  const [recipients, setRecipients] = useState<string[]>([""]);
  const [amount, setAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: balance } = useBalance({
    address: address,
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const addRecipient = () => {
    setRecipients([...recipients, ""]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, value: string) => {
    const updated = [...recipients];
    updated[index] = value;
    setRecipients(updated);
  };

  const calculateSplit = () => {
    const validRecipients = recipients.filter(addr => addr.trim() !== "");
    const remainingPercentage = 100 - MARKETING_PERCENTAGE;
    const perRecipient = validRecipients.length > 0 ? remainingPercentage / validRecipients.length : 0;

    return {
      marketing: MARKETING_PERCENTAGE,
      perRecipient: perRecipient,
      validRecipients
    };
  };

  const handleCreateSplit = async () => {
    if (!isConnected || !amount) return;

    const { validRecipients, perRecipient } = calculateSplit();

    if (validRecipients.length === 0) {
      alert("Please add at least one recipient address");
      return;
    }

    try {
      setIsCreating(true);

      // Create percentages array (marketing + recipients)
      const percentages = [MARKETING_PERCENTAGE, ...validRecipients.map(() => Math.floor(perRecipient))];
      const allRecipients = [MARKETING_WALLET, ...validRecipients];

      // For demo purposes, we'll simulate the split creation
      // In a real implementation, you'd deploy or interact with an actual split contract
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`Split created successfully!\nMarketing (${MARKETING_PERCENTAGE}%): ${MARKETING_WALLET}\nRecipients (${perRecipient.toFixed(1)}% each): ${validRecipients.join(", ")}`);

    } catch (err) {
      console.error("Split creation failed:", err);
      alert("Split creation failed. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const split = calculateSplit();

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Split Contract</CardTitle>
          <CardDescription className="text-gray-400">
            Connect your wallet to create revenue splits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center">Please connect your wallet to continue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Split Contract</CardTitle>
        <CardDescription className="text-gray-400">
          Automatically splits payments with 10% to marketing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Marketing Wallet Display */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Marketing Wallet (10%)</Label>
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600">
            <p className="text-green-400 text-xs font-mono break-all">
              {MARKETING_WALLET}
            </p>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Recipients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm font-medium">
              Recipients ({split.perRecipient.toFixed(1)}% each)
            </Label>
            <Button
              onClick={addRecipient}
              size="sm"
              variant="outline"
              className="text-xs border-gray-600 text-gray-300 hover:text-white"
            >
              Add
            </Button>
          </div>

          {recipients.map((recipient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={recipient}
                onChange={(e) => updateRecipient(index, e.target.value)}
                placeholder={`Recipient ${index + 1} address`}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              {recipients.length > 1 && (
                <Button
                  onClick={() => removeRecipient(index)}
                  size="sm"
                  variant="destructive"
                  className="px-3"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>

        <Separator className="bg-gray-700" />

        {/* Amount */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">Amount to Split (ETH)</Label>
          <Input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
          {balance && (
            <p className="text-xs text-gray-400">
              Balance: {formatEther(balance.value)} {balance.symbol}
            </p>
          )}
        </div>

        {/* Split Preview */}
        {amount && split.validRecipients.length > 0 && (
          <div className="space-y-2 p-3 bg-gray-800/30 rounded-lg border border-gray-600">
            <Label className="text-white text-sm font-medium">Split Preview</Label>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-green-400">
                <span>Marketing:</span>
                <span>{((parseFloat(amount) * MARKETING_PERCENTAGE) / 100).toFixed(4)} ETH</span>
              </div>
              {split.validRecipients.map((addr, index) => (
                <div key={index} className="flex justify-between text-blue-400">
                  <span>Recipient {index + 1}:</span>
                  <span>{((parseFloat(amount) * split.perRecipient) / 100).toFixed(4)} ETH</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Split Button */}
        <Button
          onClick={handleCreateSplit}
          disabled={!amount || split.validRecipients.length === 0 || isCreating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isCreating ? "Creating Split..." : "Create Split Contract"}
        </Button>

        {error && (
          <p className="text-red-400 text-xs text-center">
            Error: {error.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}