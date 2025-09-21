"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { useWallet } from "~/contexts/WalletContext";
import { useToast } from "~/hooks/use-toast";
import {
  Settings,
  Save,
  RefreshCw,
  Coins,
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";

interface WalletAdminPanelProps {
  className?: string;
}

export default function WalletAdminPanel({ className = "" }: WalletAdminPanelProps) {
  const {
    minBappAmount,
    updateMinBappAmount,
    isConnected,
    address
  } = useWallet();

  const { toast } = useToast();

  const [tempMinBapp, setTempMinBapp] = useState(minBappAmount);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Simple admin check - allow any connected wallet for demo purposes
  // In production, you would check against a whitelist or contract role
  const isAdmin = isConnected && address; // For demo: any connected wallet is admin

  const handleSaveConfig = () => {
    if (!tempMinBapp || parseFloat(tempMinBapp) < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number for minimum $BAPP tokens",
        variant: "destructive"
      });
      return;
    }

    updateMinBappAmount(tempMinBapp);
    setIsEditing(false);

    toast({
      title: "Configuration Updated",
      description: `Minimum $BAPP requirement set to ${tempMinBapp} tokens`,
    });
  };

  const handleReset = () => {
    setTempMinBapp(minBappAmount);
    setIsEditing(false);
  };

  const handleClearStorage = () => {
    localStorage.removeItem('wallet_admin_config');
    localStorage.removeItem('nftyield_pools');
    localStorage.removeItem('nftyield_custom_pools');
    localStorage.removeItem('nftyield_token_lock');
    localStorage.removeItem('nftyield_chat_messages');

    toast({
      title: "Storage Cleared",
      description: "All local storage data has been reset",
      variant: "destructive"
    });
  };

  if (!isConnected) {
    return (
      <Card className={`neon-card ${className}`}>
        <CardContent className="py-8 text-center">
          <div className="space-y-3">
            <Lock className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-400">Admin Access Required</h3>
            <p className="text-gray-500 text-sm">Connect your wallet to access admin settings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className={`neon-card ${className}`}>
        <CardContent className="py-8 text-center">
          <div className="space-y-3">
            <Shield className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-semibold text-red-400">Access Denied</h3>
            <p className="text-gray-400 text-sm">You don&apos;t have admin privileges</p>
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              Connected: {address?.slice(0, 8)}...
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Admin Header */}
      <Card className="neon-card border-yellow-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-yellow-400 text-lg">Admin Panel</CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Configure wallet verification requirements
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-yellow-500/20 border-yellow-500/50 text-yellow-400">
              Admin Access
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Settings */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Token Requirements
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            Set minimum token amounts for access verification
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* $BAPP Token Requirement */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="minBapp" className="text-cyan-400 font-medium">
                Minimum $BAPP Tokens
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                  Current: {minBappAmount} BAPP
                </Badge>
                {!isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-7 px-2 text-xs"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  id="minBapp"
                  type="number"
                  value={tempMinBapp}
                  onChange={(e) => setTempMinBapp(e.target.value)}
                  placeholder="1000"
                  className="neon-input text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSaveConfig}
                  className="neon-button-success px-3"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="px-3 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{minBappAmount} $BAPP tokens</p>
                    <p className="text-xs text-gray-400">Required for chat access</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            )}
          </div>

          {/* Additional Requirements Info */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3">
            <h3 className="text-sm font-medium text-blue-400 mb-2">Additional Requirements</h3>
            <div className="space-y-1 text-xs text-gray-300">
              <p>• Must have used NFT Yield Protocol (active or completed pools)</p>
              <p>• Must have burned $samish creator tokens</p>
              <p>• All three conditions must be met for full access</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-400 text-lg">Advanced Settings</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-400 hover:text-white"
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        {showAdvanced && (
          <CardContent className="space-y-4">
            {/* Current Configuration Display */}
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/20 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Current Configuration</h3>
              <div className="space-y-1 text-xs text-gray-400 font-mono">
                <p>minBappAmount: {minBappAmount}</p>
                <p>adminAddress: {address?.slice(0, 20)}...</p>
                <p>lastUpdated: {new Date().toISOString()}</p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
              </div>

              <Button
                size="sm"
                onClick={handleClearStorage}
                className="bg-red-600 hover:bg-red-700 text-white text-xs"
              >
                Clear All Storage Data
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                This will reset all user data including pools, messages, and configurations
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Status Information */}
      <Card className="neon-card">
        <CardContent className="py-3">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Admin authenticated</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-3 h-3 text-blue-400" />
              <span>Configuration active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}