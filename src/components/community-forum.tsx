"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Avatar } from "~/components/ui/avatar";
import { useToast } from "~/hooks/use-toast";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Send,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Star,
  Plus,
  Filter,
  Clock,
  ThumbsUp,
  Eye
} from "lucide-react";
import { useMiniAppSdk } from "~/hooks/use-miniapp-sdk";

interface ForumPost {
  id: string;
  author: {
    address: string;
    username: string;
    avatar?: string;
    reputation: number;
    isVerified: boolean;
  };
  title: string;
  content: string;
  category: "strategy" | "success" | "question" | "announcement" | "general";
  likes: number;
  replies: number;
  views: number;
  createdAt: Date;
  isLiked: boolean;
  isPinned: boolean;
  tags: string[];
}

interface Reply {
  id: string;
  postId: string;
  author: {
    address: string;
    username: string;
    avatar?: string;
    reputation: number;
  };
  content: string;
  likes: number;
  createdAt: Date;
  isLiked: boolean;
}

interface CommunityForumProps {
  userPools: any[];
}

export default function CommunityForum({ userPools }: CommunityForumProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general" as ForumPost["category"],
    tags: ""
  });
  const [newReply, setNewReply] = useState("");
  const { toast } = useToast();
  const sdk = useMiniAppSdk();

  // Mock user data - would come from SDK in real implementation
  const currentUser = {
    address: sdk?.context?.user?.fid ? `0x${sdk.context.user.fid.toString(16).padStart(40, '0')}` : "0x1234567890abcdef",
    username: sdk?.context?.user?.username || "anonymous",
    avatar: sdk?.context?.user?.pfpUrl,
    reputation: Math.min(userPools.length * 10 + 50, 1000), // Reputation based on pool activity
    isVerified: userPools.length >= 3
  };

  // Initialize with sample posts
  useEffect(() => {
    const samplePosts: ForumPost[] = [
      {
        id: "1",
        author: {
          address: "0x742d35Cc6634C0532925a3b8D1db4C3D5b5ffe01",
          username: "YieldMaster",
          reputation: 850,
          isVerified: true
        },
        title: "Best ETH-USDC Pool Strategies for Q4 2024",
        content: "After running multiple yield pools for 6 months, I've discovered some key strategies that consistently deliver 12-15% APY. Here's what works...",
        category: "strategy",
        likes: 24,
        replies: 8,
        views: 156,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isLiked: false,
        isPinned: true,
        tags: ["ETH", "USDC", "Strategy", "High-APY"]
      },
      {
        id: "2",
        author: {
          address: "0x8ba1f109551bd432803012645hac136c41a3a1f7",
          username: "DeFiNewbie",
          reputation: 120,
          isVerified: false
        },
        title: "Just made my first $500 from NFT yields!",
        content: "Started with just $100 worth of Samish tokens last month. Today I withdrew $500 in rewards from my WBTC pool. This platform is amazing!",
        category: "success",
        likes: 18,
        replies: 12,
        views: 89,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isLiked: true,
        isPinned: false,
        tags: ["Success", "WBTC", "First-time"]
      },
      {
        id: "3",
        author: {
          address: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
          username: "CryptoAnalyst",
          reputation: 650,
          isVerified: true
        },
        title: "How to optimize gas fees when creating pools?",
        content: "Looking for tips on reducing transaction costs when setting up multiple yield pools. Any best practices?",
        category: "question",
        likes: 7,
        replies: 5,
        views: 43,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isLiked: false,
        isPinned: false,
        tags: ["Gas", "Optimization", "Question"]
      }
    ];

    // Load from localStorage or use samples
    const savedPosts = localStorage.getItem('nftyield_forum_posts');
    const savedReplies = localStorage.getItem('nftyield_forum_replies');

    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(samplePosts);
      localStorage.setItem('nftyield_forum_posts', JSON.stringify(samplePosts));
    }

    if (savedReplies) {
      setReplies(JSON.parse(savedReplies));
    }
  }, []);

  const saveData = (newPosts: ForumPost[], newReplies?: Reply[]) => {
    localStorage.setItem('nftyield_forum_posts', JSON.stringify(newPosts));
    setPosts(newPosts);

    if (newReplies) {
      localStorage.setItem('nftyield_forum_replies', JSON.stringify(newReplies));
      setReplies(newReplies);
    }
  };

  const categories = [
    { id: "all", name: "All Posts", icon: MessageSquare, color: "text-cyan-400" },
    { id: "strategy", name: "Strategies", icon: TrendingUp, color: "text-green-400" },
    { id: "success", name: "Success Stories", icon: Trophy, color: "text-yellow-400" },
    { id: "question", name: "Questions", icon: MessageCircle, color: "text-purple-400" },
    { id: "announcement", name: "Announcements", icon: Star, color: "text-pink-400" },
    { id: "general", name: "General", icon: Users, color: "text-gray-400" },
  ];

  const filteredPosts = posts.filter(post =>
    activeCategory === "all" || post.category === activeCategory
  ).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for your post",
        variant: "destructive"
      });
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      author: currentUser,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      likes: 0,
      replies: 0,
      views: 0,
      createdAt: new Date(),
      isLiked: false,
      isPinned: false,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const updatedPosts = [post, ...posts];
    saveData(updatedPosts);

    setNewPost({ title: "", content: "", category: "general", tags: "" });
    setIsCreatingPost(false);

    toast({
      title: "Post Created",
      description: "Your post has been shared with the community"
    });
  };

  const likePost = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    });
    saveData(updatedPosts);
  };

  const addReply = (postId: string) => {
    if (!newReply.trim()) return;

    const reply: Reply = {
      id: Date.now().toString(),
      postId,
      author: currentUser,
      content: newReply,
      likes: 0,
      createdAt: new Date(),
      isLiked: false
    };

    const updatedReplies = [...replies, reply];
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, replies: post.replies + 1 }
        : post
    );

    saveData(updatedPosts, updatedReplies);
    setNewReply("");

    toast({
      title: "Reply Added",
      description: "Your reply has been posted"
    });
  };

  const incrementViews = (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, views: post.views + 1 }
        : post
    );
    saveData(updatedPosts);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || "text-gray-400";
  };

  return (
    <div className="space-y-4">
      {/* Forum Header */}
      <Card className="neon-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Community Forum
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Share strategies, celebrate wins, and connect with the community
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{posts.length}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              variant={activeCategory === category.id ? "default" : "ghost"}
              className={`flex-shrink-0 text-xs ${
                activeCategory === category.id
                  ? "neon-button"
                  : `${category.color} hover:text-white`
              }`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Create Post Button */}
      {!isCreatingPost && (
        <Button
          onClick={() => setIsCreatingPost(true)}
          className="w-full neon-button text-sm py-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          Share Your Experience
        </Button>
      )}

      {/* Create Post Form */}
      {isCreatingPost && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-cyan-400 text-lg">Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-cyan-400 font-medium text-sm">Title *</Label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What's your post about?"
                className="neon-input text-sm"
              />
            </div>
            <div>
              <Label className="text-cyan-400 font-medium text-sm">Category</Label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value as ForumPost["category"] }))}
                className="w-full bg-black border border-cyan-500/30 rounded-lg p-2 text-sm text-white"
              >
                <option value="general">General Discussion</option>
                <option value="strategy">Strategy & Tips</option>
                <option value="success">Success Story</option>
                <option value="question">Question</option>
              </select>
            </div>
            <div>
              <Label className="text-cyan-400 font-medium text-sm">Content *</Label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts, strategies, or questions..."
                className="neon-input text-sm min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-cyan-400 font-medium text-sm">Tags (comma-separated)</Label>
              <Input
                value={newPost.tags}
                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="ETH, Strategy, Beginner"
                className="neon-input text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={createPost}
                className="flex-1 neon-button text-sm"
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
              <Button
                onClick={() => setIsCreatingPost(false)}
                variant="outline"
                className="px-4 text-sm"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <Card className="neon-card">
            <CardContent className="py-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No posts in this category yet</p>
              <p className="text-xs text-gray-500 mt-1">Be the first to start the conversation</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="neon-card hover:border-cyan-500/40 transition-colors cursor-pointer">
              <CardContent
                className="pt-4"
                onClick={() => {
                  setSelectedPost(post);
                  incrementViews(post.id);
                }}
              >
                <div className="space-y-3">
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {post.author.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">
                            {post.author.username}
                          </span>
                          {post.author.isVerified && (
                            <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                              Verified
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-gray-400">{post.author.reputation} rep</span>
                        </div>
                      </div>
                    </div>
                    {post.isPinned && (
                      <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                        Pinned
                      </Badge>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white text-sm leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-purple-500/30 text-purple-300"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          likePost(post.id);
                        }}
                        className={`flex items-center gap-1 text-xs ${
                          post.isLiked ? "text-red-400" : "text-gray-400 hover:text-red-400"
                        } transition-colors`}
                      >
                        <Heart className={`w-3 h-3 ${post.isLiked ? "fill-current" : ""}`} />
                        {post.likes}
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MessageCircle className="w-3 h-3" />
                        {post.replies}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs border-opacity-50 ${getCategoryColor(post.category)}`}
                    >
                      {post.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Post Detail Modal/View */}
      {selectedPost && (
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-cyan-400 text-lg">{selectedPost.title}</CardTitle>
                <CardDescription className="text-gray-300 text-sm mt-1">
                  by {selectedPost.author.username} • {formatTimeAgo(selectedPost.createdAt)}
                </CardDescription>
              </div>
              <Button
                onClick={() => setSelectedPost(null)}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/30 rounded-lg p-4">
              <p className="text-gray-300 text-sm whitespace-pre-wrap">
                {selectedPost.content}
              </p>
            </div>

            {/* Reply Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-400 text-sm">
                Replies ({selectedPost.replies})
              </h4>

              {/* Add Reply */}
              <div className="flex gap-2">
                <Input
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="neon-input text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addReply(selectedPost.id);
                    }
                  }}
                />
                <Button
                  onClick={() => addReply(selectedPost.id)}
                  className="neon-button px-3"
                  disabled={!newReply.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Replies List */}
              {replies
                .filter(reply => reply.postId === selectedPost.id)
                .map((reply) => (
                  <div
                    key={reply.id}
                    className="bg-gradient-to-r from-gray-800/20 to-gray-900/20 border border-gray-700/20 rounded-lg p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-black">
                          {reply.author.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-xs">
                            {reply.author.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}