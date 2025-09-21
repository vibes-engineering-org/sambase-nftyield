"use client";

import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContract } from "wagmi";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AlertCircle, CheckCircle, ExternalLink, Plus, Trash2 } from "lucide-react";
import { WalletConnect } from "~/components/ui/wallet-connect";

const MARKETING_WALLET = "0x5d7ECF67eD425F30bfDb164A8880D1D652be79B2";
const MARKETING_PERCENTAGE = 10;

// Placeholder contract address - will be updated after deployment
const SPLITS_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
const isContractDeployed = SPLITS_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

// NFTYieldSplits contract ABI
const SPLITS_CONTRACT_ABI = [
  {
    inputs: [
      { name: "_recipients", type: "address[]" },
      { name: "_percentages", type: "uint256[]" },
      { name: "_name", type: "string" }
    ],
    name: "createSplit",
    outputs: [{ name: "splitId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "_splitId", type: "uint256" }],
    name: "sendToSplit",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "_splitId", type: "uint256" }],
    name: "getSplit",
    outputs: [
      { name: "recipients", type: "address[]" },
      { name: "percentages", type: "uint256[]" },
      { name: "totalReceived", type: "uint256" },
      { name: "totalDistributed", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "name", type: "string" },
      { name: "createdAt", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserSplits",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

interface SplitData {
  id: number;
  name: string;
  recipients: string[];
  percentages: number[];
  totalReceived: bigint;
  totalDistributed: bigint;
  isActive: boolean;
  createdAt: number;
}

export default function SplitContract() {
  const { address, isConnected } = useAccount();
  const [recipients, setRecipients] = useState<string[]>([""]);
  const [percentages, setPercentages] = useState<string[]>([""]);
  const [splitName, setSplitName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedSplitId, setSelectedSplitId] = useState<number>(1);
  const [userSplits, setUserSplits] = useState<SplitData[]>([]);
  const [activeTab, setActiveTab] = useState("create");

  const { data: balance } = useBalance({
    address: address,
  });

  // Read user's splits
  const { data: userSplitIds } = useReadContract({
    address: SPLITS_CONTRACT_ADDRESS as `0x${string}`,
    abi: SPLITS_CONTRACT_ABI,
    functionName: "getUserSplits",
    args: address ? [address] : undefined,
    query: { enabled: isContractDeployed && !!address }
  });

  // Write contract hooks
  const { writeContract: createSplit, data: createHash, isPending: isCreating, error: createError } = useWriteContract();
  const { writeContract: sendFunds, data: sendHash, isPending: isSending, error: sendError } = useWriteContract();

  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  const { isLoading: isSendConfirming, isSuccess: isSendSuccess } = useWaitForTransactionReceipt({
    hash: sendHash,
  });

  const addRecipient = () => {
    setRecipients([...recipients, ""]);
    setPercentages([...percentages, ""]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
      setPercentages(percentages.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, value: string) => {
    const updated = [...recipients];
    updated[index] = value;
    setRecipients(updated);
  };

  const updatePercentage = (index: number, value: string) => {
    const updated = [...percentages];
    updated[index] = value;
    setPercentages(updated);
  };

  const calculateSplit = () => {
    const validRecipients = recipients.filter(addr => addr.trim() !== "");
    const validPercentages = percentages
      .map((p, i) => recipients[i].trim() !== "" ? parseFloat(p) || 0 : 0)
      .filter((_, i) => recipients[i].trim() !== "");

    const totalUserPercentage = validPercentages.reduce((sum, p) => sum + p, 0);
    const totalPercentage = MARKETING_PERCENTAGE + totalUserPercentage;

    return {
      marketing: MARKETING_PERCENTAGE,
      validRecipients,
      validPercentages,
      totalPercentage
    };
  };

  const handleCreateSplit = async () => {
    if (!isConnected || !splitName.trim() || !isContractDeployed) return;

    const { validRecipients, validPercentages, totalPercentage } = calculateSplit();

    if (validRecipients.length === 0) {
      alert("Please add at least one recipient address");
      return;
    }

    if (totalPercentage > 100) {
      alert("Total percentage cannot exceed 100%");
      return;
    }

    try {
      // Convert percentages to basis points (1% = 100 basis points)
      const basisPointPercentages = validPercentages.map(p => BigInt(Math.floor(p * 100)));

      createSplit({
        address: SPLITS_CONTRACT_ADDRESS as `0x${string}`,
        abi: SPLITS_CONTRACT_ABI,
        functionName: "createSplit",
        args: [validRecipients as `0x${string}`[], basisPointPercentages, splitName],
      });
    } catch (err) {
      console.error("Split creation failed:", err);
    }
  };

  const handleSendFunds = async () => {
    if (!isConnected || !amount || !isContractDeployed) return;

    try {
      sendFunds({
        address: SPLITS_CONTRACT_ADDRESS as `0x${string}`,
        abi: SPLITS_CONTRACT_ABI,
        functionName: "sendToSplit",
        args: [BigInt(selectedSplitId)],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error("Send funds failed:", err);
    }
  };

  const split = calculateSplit();

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Revenue Splits</CardTitle>
            <CardDescription className="text-gray-400">
              Automated revenue distribution with marketing allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Features:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Automatic 10% marketing allocation</li>
                <li>• Custom recipient percentages</li>
                <li>• Instant distribution on payment</li>
                <li>• Support for ETH and ERC20 tokens</li>
                <li>• Multiple split configurations</li>
                <li>• On-chain transparency</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <WalletConnect
          onConnected={() => {
            // Optionally refresh split data when connected
            console.log("Wallet connected for splits");
          }}
          className="w-full max-w-md mx-auto"
        />
      </div>
    );
  }

  if (!isContractDeployed) {
    return (
      <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Contract Not Deployed
          </CardTitle>
          <CardDescription className="text-gray-400">
            The Splits contract needs to be deployed first
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-400 text-sm">
                To deploy the contracts, run:
              </p>
              <code className="text-xs text-yellow-300 block mt-2 font-mono">
                pnpm hardhat run src/contracts/scripts/deploy.js --network base-sepolia
              </code>
            </div>

            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Features when deployed:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Automatic 10% marketing allocation</li>
                <li>• Custom recipient percentages</li>
                <li>• Instant distribution on payment</li>
                <li>• Support for ETH and ERC20 tokens</li>
                <li>• Multiple split configurations</li>
                <li>• On-chain transparency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <WalletConnect
        showHeader={false}
        className="w-full max-w-md mx-auto"
      />

      <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue Splits</CardTitle>
          <CardDescription className="text-gray-400">
            Automated revenue distribution with marketing allocation
          </CardDescription>
        </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="create" className="text-xs">Create Split</TabsTrigger>
            <TabsTrigger value="send" className="text-xs">Send Funds</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            {/* Split Name */}
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Split Name</Label>
              <Input
                value={splitName}
                onChange={(e) => setSplitName(e.target.value)}
                placeholder="NFT Project Revenue Split"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <Separator className="bg-gray-700" />

            {/* Marketing Wallet Display */}
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">
                Marketing Wallet ({MARKETING_PERCENTAGE}% - Auto-included)
              </Label>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-green-600/30">
                <p className="text-green-400 text-xs font-mono break-all">
                  {MARKETING_WALLET}
                </p>
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white text-sm font-medium">Recipients</Label>
                <Button
                  onClick={addRecipient}
                  size="sm"
                  variant="outline"
                  className="text-xs border-gray-600 text-gray-300 hover:text-white"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              {recipients.map((recipient, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="0x..."
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                    {recipients.length > 1 && (
                      <Button
                        onClick={() => removeRecipient(index)}
                        size="sm"
                        variant="destructive"
                        className="px-3"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={percentages[index] || ""}
                    onChange={(e) => updatePercentage(index, e.target.value)}
                    placeholder="Percentage (e.g., 45)"
                    type="number"
                    max="90"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              ))}
            </div>

            {/* Split Preview */}
            {splitName && split.validRecipients.length > 0 && (
              <div className="space-y-2 p-3 bg-gray-800/30 rounded-lg border border-gray-600">
                <Label className="text-white text-sm font-medium">Preview</Label>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-green-400">
                    <span>Marketing:</span>
                    <span>{split.marketing}%</span>
                  </div>
                  {split.validPercentages.map((percentage, index) => (
                    <div key={index} className="flex justify-between text-blue-400">
                      <span>Recipient {index + 1}:</span>
                      <span>{percentage}%</span>
                    </div>
                  ))}
                  <Separator className="bg-gray-600 my-1" />
                  <div className="flex justify-between text-white font-medium">
                    <span>Total:</span>
                    <span className={split.totalPercentage > 100 ? "text-red-400" : "text-white"}>
                      {split.totalPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Create Split Button */}
            <Button
              onClick={handleCreateSplit}
              disabled={!splitName.trim() || split.validRecipients.length === 0 || split.totalPercentage > 100 || isCreating || isCreateConfirming}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCreating || isCreateConfirming ? "Creating Split..." : "Create Split"}
            </Button>

            {createError && (
              <p className="text-red-400 text-xs text-center">
                Error: {createError.message}
              </p>
            )}

            {isCreateSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-400 text-xs">
                <CheckCircle className="w-4 h-4" />
                Split created successfully!
              </div>
            )}
          </TabsContent>

          <TabsContent value="send" className="space-y-4 mt-4">
            {/* Split Selection */}
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Split ID</Label>
              <Input
                type="number"
                value={selectedSplitId}
                onChange={(e) => setSelectedSplitId(parseInt(e.target.value) || 1)}
                min="1"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">Amount (ETH)</Label>
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

            {/* Send Button */}
            <Button
              onClick={handleSendFunds}
              disabled={!amount || isSending || isSendConfirming}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSending || isSendConfirming ? "Sending..." : "Send to Split"}
            </Button>

            {sendError && (
              <p className="text-red-400 text-xs text-center">
                Error: {sendError.message}
              </p>
            )}

            {isSendSuccess && (
              <div className="flex items-center justify-center gap-2 text-green-400 text-xs">
                <CheckCircle className="w-4 h-4" />
                Funds distributed successfully!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}