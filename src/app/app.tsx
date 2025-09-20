"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import YieldPoolApp from "~/components/yield/yield-pool-app";
import BaseAppTokenSwap from "~/components/base-app-token-swap";
import { Coins, TrendingUp, Star } from "lucide-react";

export default function App() {
  const [activeApp, setActiveApp] = useState<"nftyield" | "basetoken">("basetoken");

  return (
    <div className="min-h-screen bg-black">
      {/* TEMPLATE_CONTENT_START - Replace content below */}

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
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/80 rounded-lg neon-border mb-4">
          <Button
            variant={activeApp === "basetoken" ? "default" : "ghost"}
            onClick={() => setActiveApp("basetoken")}
            className={`${activeApp === "basetoken" ? "neon-button" : "text-gray-300 hover:text-white"} text-sm`}
          >
            <Coins className="w-4 h-4 mr-2" />
            BAPP Token
          </Button>
          <Button
            variant={activeApp === "nftyield" ? "default" : "ghost"}
            onClick={() => setActiveApp("nftyield")}
            className={`${activeApp === "nftyield" ? "neon-button" : "text-gray-300 hover:text-white"} text-sm`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            NFT Yield
          </Button>
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

      {/* TEMPLATE_CONTENT_END */}
    </div>
  );
}
