"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { useMiniAppSdk } from "~/hooks/use-miniapp-sdk";
import { useAccount } from "wagmi";
import WalletConnectButton from "~/components/wallet-connect-button";
import TokenHolderVerification from "~/components/token-holder-verification";
import {
  MessageSquare,
  Send,
  Users,
  Shield,
  Clock,
  Flame,
  Lock,
  Wallet,
  CheckCircle,
  AlertCircle,
  Crown
} from "lucide-react";

interface ChatMessage {
  id: string;
  author: {
    address: string;
    username: string;
    avatar?: string;
    poolCount: number;
    burnedTokens: number;
    isVerified: boolean;
  };
  content: string;
  timestamp: Date;
  type: "message" | "system" | "pool_update";
}

interface ActivePoolChatProps {
  userPools: any[];
  totalBurned: string;
}

export default function ActivePoolChat({ userPools, totalBurned }: ActivePoolChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasActivePool, setHasActivePool] = useState(false);
  const [isTokenHolder, setIsTokenHolder] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const sdk = useMiniAppSdk();
  const { address, isConnected: walletConnected } = useAccount();

  // Current user data
  const currentUser = {
    address: address || (sdk?.context?.user?.fid ? `0x${sdk.context.user.fid.toString(16).padStart(40, '0')}` : ""),
    username: sdk?.context?.user?.username || address?.slice(0, 6) || "Anonymous",
    avatar: sdk?.context?.user?.pfpUrl,
    poolCount: userPools.filter(pool => pool.status === "active").length,
    burnedTokens: parseFloat(totalBurned) || 0,
    isVerified: userPools.filter(pool => pool.status === "active").length >= 1
  };

  // Check wallet connection and active pool status
  useEffect(() => {
    const connected = Boolean(walletConnected && address);
    const hasActivePoolCheck = userPools.some(pool => pool.status === "active");

    setIsConnected(connected);
    setHasActivePool(hasActivePoolCheck);
  }, [walletConnected, address, userPools]);

  // Handle wallet connection changes
  const handleWalletConnectionChange = (connected: boolean, walletAddress?: string) => {
    setIsConnected(connected);
  };

  // Handle token holder verification changes
  const handleVerificationChange = (verified: boolean, details: any) => {
    setIsTokenHolder(verified);
    setVerificationDetails(details);
  };

  // Load messages from localStorage and add system messages
  useEffect(() => {
    const savedMessages = localStorage.getItem('nftyield_chat_messages');
    let loadedMessages: ChatMessage[] = [];

    if (savedMessages) {
      try {
        loadedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.warn('Failed to parse chat messages:', e);
      }
    } else {
      // Initialize with welcome message
      loadedMessages = [
        {
          id: "welcome",
          author: {
            address: "system",
            username: "NFTYield System",
            poolCount: 0,
            burnedTokens: 0,
            isVerified: true
          },
          content: "Welcome to the Active Pool Chat! This is an exclusive space for users with active NFT yield pools and burned Samish tokens. Share strategies, updates, and connect with fellow yield farmers.",
          timestamp: new Date(),
          type: "system"
        }
      ];
    }

    setMessages(loadedMessages);
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('nftyield_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add system message for pool updates
  useEffect(() => {
    if (userPools.length > 0 && isConnected) {
      const activePoolsCount = userPools.filter(pool => pool.status === "active").length;
      if (activePoolsCount > 0) {
        const poolUpdateMessage: ChatMessage = {
          id: `pool-update-${Date.now()}`,
          author: currentUser,
          content: `🎯 Pool Status: ${activePoolsCount} active pool${activePoolsCount > 1 ? 's' : ''} • $${(parseFloat(totalBurned) * 0.05).toFixed(2)} Samish burned`,
          timestamp: new Date(),
          type: "pool_update"
        };

        // Only add if we don't already have a recent pool update from this user
        setMessages(prev => {
          const hasRecentUpdate = prev.some(msg =>
            msg.author.address === currentUser.address &&
            msg.type === "pool_update" &&
            (new Date().getTime() - msg.timestamp.getTime()) < 300000 // 5 minutes
          );

          if (!hasRecentUpdate) {
            return [...prev, poolUpdateMessage];
          }
          return prev;
        });
      }
    }
  }, [userPools, isConnected, totalBurned]);

  const sendMessage = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to participate in chat",
        variant: "destructive"
      });
      return;
    }

    if (!isTokenHolder) {
      toast({
        title: "Token Holder Verification Required",
        description: "You need to hold and stake NFTY tokens or have an active pool to access this chat",
        variant: "destructive"
      });
      return;
    }

    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      author: currentUser,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: "message"
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    toast({
      title: "Message Sent",
      description: "Your message has been shared with the community"
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case "system":
        return "bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border-cyan-500/20";
      case "pool_update":
        return "bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-green-500/20";
      default:
        return "bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-700/20";
    }
  };

  const getUserBadgeColor = (poolCount: number, burnedTokens: number) => {
    if (poolCount >= 5 || burnedTokens >= 50) return "border-yellow-500/50 text-yellow-400";
    if (poolCount >= 3 || burnedTokens >= 25) return "border-purple-500/50 text-purple-400";
    if (poolCount >= 1 || burnedTokens >= 5) return "border-green-500/50 text-green-400";
    return "border-gray-500/50 text-gray-400";
  };

  // Access denied state
  if (!isConnected || !isTokenHolder) {
    return (
      <div className="space-y-4">
        <Card className="neon-card">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-red-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-red-400">Exclusive Token Holder Chat</h3>
                <p className="text-gray-300 text-sm max-w-sm mx-auto">
                  This chat is reserved for verified NFTY token holders with staked tokens or active pools
                </p>
              </div>

              <div className="space-y-3 bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-lg p-4">
                <div className="text-left space-y-2">
                  <div className={`flex items-center gap-3 ${isConnected ? "text-green-400" : "text-red-400"}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
                    <span className="text-sm">Wallet Connected</span>
                    {isConnected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>

                  <div className={`flex items-center gap-3 ${isTokenHolder ? "text-green-400" : "text-red-400"}`}>
                    <div className={`w-2 h-2 rounded-full ${isTokenHolder ? "bg-green-400" : "bg-red-400"}`}></div>
                    <span className="text-sm">Token Holder Verification</span>
                    {isTokenHolder ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                </div>

                {!isConnected && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 mb-2">
                      Connect your wallet to access token holder verification
                    </p>
                  </div>
                )}

                {isConnected && !isTokenHolder && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">
                      Hold and stake NFTY tokens or create an active pool to unlock chat access
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-orange-400">
                      <Flame className="w-3 h-3" />
                      <span>Requirements: 1000+ NFTY tokens + staking/active pool</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection Component */}
        {!isConnected && (
          <WalletConnectButton
            onConnectionChange={handleWalletConnectionChange}
            showDetails={true}
          />
        )}

        {/* Token Holder Verification Component */}
        {isConnected && (
          <TokenHolderVerification
            minimumTokens="1000"
            minimumStaked="500"
            onVerificationChange={handleVerificationChange}
            showDetails={true}
          />
        )}
      </div>
    );
  }

  // Active chat interface
  return (
    <div className="space-y-4">
      {/* Chat Header */}
      <Card className="neon-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-black" />
              </div>
              <div>
                <CardTitle className="text-green-400 text-lg">Active Pool Chat</CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Exclusive chat for verified pool participants
                </CardDescription>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{messages.filter(m => m.type === "message").length}</div>
              <div className="text-xs text-gray-400">Messages</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User Status */}
      <Card className="neon-card">
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">
                  {currentUser.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">{currentUser.username}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getUserBadgeColor(currentUser.poolCount, currentUser.burnedTokens)}`}
                  >
                    {currentUser.poolCount >= 5 ? <Crown className="w-3 h-3 mr-1" /> : null}
                    {currentUser.poolCount} pool{currentUser.poolCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>${(currentUser.burnedTokens * 0.05).toFixed(2)} Samish burned</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Container */}
      <Card className="neon-card">
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg p-3 ${getMessageTypeStyle(message.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                    {message.type === "system" ? (
                      <Shield className="w-3 h-3 text-black" />
                    ) : (
                      <span className="text-xs font-bold text-black">
                        {message.author.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">
                        {message.author.username}
                      </span>

                      {message.type !== "system" && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${getUserBadgeColor(message.author.poolCount, message.author.burnedTokens)}`}
                        >
                          {message.author.poolCount >= 5 ? <Crown className="w-3 h-3 mr-1" /> : null}
                          {message.author.poolCount}P
                        </Badge>
                      )}

                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="neon-card">
        <CardContent className="py-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts with active pool participants..."
              className="neon-input text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              className="neon-button px-4"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Active participants only</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Pool verified</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {newMessage.length}/500
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}