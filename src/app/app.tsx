"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import YieldPoolApp from "~/components/yield/yield-pool-app";
import BaseAppTokenSwap from "~/components/base-app-token-swap";
import SplitContract from "~/components/split-contract";
import UnifiedWalletConnect from "~/components/UnifiedWalletConnect";
import WalletAdminPanel from "~/components/WalletAdminPanel";
import { useWallet } from "~/contexts/WalletContext";
import { Coins, TrendingUp, Star, Split, Settings, Wallet } from "lucide-react";

export default function App() {
  const [activeApp, setActiveApp] = useState<"nftyield" | "basetoken" | "split" | "wallet" | "admin">("basetoken");
  const { isConnected, isTokenVerified } = useWallet();

  return (
    <div className="min-h-screen bg-black">
      {/* TEMPLATE_CONTENT_START - Replace content below */}

      {/* Global Wallet Status Bar */}
      <div className="w-full max-w-md mx-auto p-3 pb-0">
        <UnifiedWalletConnect variant="status" />
      </div>

      {/* App Switcher Header */}
      <div className="w-full max-w-md mx-auto p-3">
        <div className="text-center space-y-3 py-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-lg bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-60"></div>
            <div className="relative bg-black border-2 border-transparent bg-clip-padding rounded-xl p-4">
              <div className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                <h1 className="text-3xl font-black tracking-tight">Base Network DApps</h1>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-cyan-400 font-medium">Multi-App Platform</span>
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* App Selection */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-900/80 rounded-lg neon-border">
            <Button
              variant={activeApp === "basetoken" ? "default" : "ghost"}
              onClick={() => setActiveApp("basetoken")}
              className={`${activeApp === "basetoken" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
            >
              <Coins className="w-4 h-4 mr-1" />
              BAPP Token
            </Button>
            <Button
              variant={activeApp === "nftyield" ? "default" : "ghost"}
              onClick={() => setActiveApp("nftyield")}
              className={`${activeApp === "nftyield" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              NFT Yield
            </Button>
            <Button
              variant={activeApp === "split" ? "default" : "ghost"}
              onClick={() => setActiveApp("split")}
              className={`${activeApp === "split" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
            >
              <Split className="w-4 h-4 mr-1" />
              Split
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/80 rounded-lg neon-border">
            <Button
              variant={activeApp === "wallet" ? "default" : "ghost"}
              onClick={() => setActiveApp("wallet")}
              className={`${activeApp === "wallet" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
            >
              <Wallet className="w-4 h-4 mr-1" />
              Wallet
            </Button>
            <Button
              variant={activeApp === "admin" ? "default" : "ghost"}
              onClick={() => setActiveApp("admin")}
              className={`${activeApp === "admin" ? "neon-button" : "text-gray-300 hover:text-white"} text-xs`}
            >
              <Settings className="w-4 h-4 mr-1" />
              Admin
            </Button>
          </div>
        </div>
      </div>

      {/* App Content */}
      {activeApp === "basetoken" && (
        <div className="w-full max-w-md mx-auto p-3">
          <BaseAppTokenSwap />
        </div>
      )}

      {activeApp === "nftyield" && (
        <YieldPoolApp />
      )}

      {activeApp === "split" && (
        <div className="w-full max-w-md mx-auto p-3">
          <SplitContract />
        </div>
      )}

      {activeApp === "wallet" && (
        <div className="w-full max-w-md mx-auto p-3">
          <UnifiedWalletConnect
            showDetails={true}
            variant="full"
          />
        </div>
      )}

      {activeApp === "admin" && (
        <div className="w-full max-w-md mx-auto p-3">
          <WalletAdminPanel />
        </div>
      )}

      {/* TEMPLATE_CONTENT_END */}
    </div>
  );
}
