import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { 
  MessageSquare, 
  TrendingUp, 
  Shield,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Share2,
  AlertTriangle,
  Twitter,
  Globe,
  Users,
  Hash,
  Clock,
  Eye,
  Home,
  Plus
} from 'lucide-react';

interface SocialMention {
  id: string;
  platform: 'twitter' | 'reddit' | 'telegram' | 'discord' | 'news';
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  url: string;
  verified: boolean;
  votes: { up: number; down: number };
  responses: number;
}

interface CommunityPost {
  id: string;
  author: string;
  title: string;
  content: string;
  type: 'news' | 'event' | 'discussion' | 'alert';
  timestamp: string;
  tags: string[];
  votes: { up: number; down: number };
  comments: number;
  verified: boolean;
}

const Community = () => {
  const { track } = useAnalytics();
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'discussion', tags: '' });
  const [activeTab, setActiveTab] = useState('mentions');

  // Mock data for social mentions
  const mockMentions: SocialMention[] = [
    {
      id: '1',
      platform: 'twitter',
      author: '@CryptoAnalyst',
      content: 'PulseChain showing strong fundamentals and growing adoption. The community is building something special here. #PLS #PulseChain',
      sentiment: 'positive',
      timestamp: '2 hours ago',
      url: 'https://twitter.com/example',
      verified: true,
      votes: { up: 24, down: 2 },
      responses: 8
    },
    {
      id: '2',
      platform: 'reddit',
      author: 'u/BlockchainExpert',
      content: 'Concerned about the recent price action on PulseChain. Need more utility and adoption to sustain growth.',
      sentiment: 'negative',
      timestamp: '4 hours ago',
      url: 'https://reddit.com/example',
      verified: false,
      votes: { up: 12, down: 18 },
      responses: 15
    },
    {
      id: '3',
      platform: 'news',
      author: 'CoinDesk',
      content: 'PulseChain ecosystem continues to expand with new DeFi protocols launching weekly. Market cap reaches new milestone.',
      sentiment: 'positive',
      timestamp: '6 hours ago',
      url: 'https://coindesk.com/example',
      verified: true,
      votes: { up: 89, down: 5 },
      responses: 23
    }
  ];

  // Mock data for community posts
  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      author: 'PulseBuilder',
      title: 'PulseChain Mainnet Celebration Event - March 15th',
      content: 'Join us for a community celebration of PulseChain mainnet launch anniversary. Virtual event with special guests and announcements.',
      type: 'event',
      timestamp: '1 hour ago',
      tags: ['event', 'mainnet', 'celebration'],
      votes: { up: 45, down: 1 },
      comments: 12,
      verified: true
    },
    {
      id: '2',
      author: 'DefenderDAO',
      title: 'Misinformation Alert: False Claims About PLS Security',
      content: 'Recent FUD campaign spreading false security concerns. Here are the verified facts and security audit reports.',
      type: 'alert',
      timestamp: '3 hours ago',
      tags: ['security', 'fud', 'verification'],
      votes: { up: 78, down: 3 },
      comments: 25,
      verified: true
    },
    {
      id: '3',
      author: 'CommunityMod',
      title: 'Weekly PulseChain Development Update',
      content: 'Summary of this week\'s developments including new partnerships, technical improvements, and ecosystem growth.',
      type: 'news',
      timestamp: '1 day ago',
      tags: ['development', 'weekly', 'update'],
      votes: { up: 156, down: 8 },
      comments: 34,
      verified: true
    }
  ];

  useEffect(() => {
    setMentions(mockMentions);
    setPosts(mockPosts);
    track('community_page_viewed');
  }, [track]);

  const handleNewPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: 'You',
      title: newPost.title,
      content: newPost.content,
      type: newPost.type as any,
      timestamp: 'Just now',
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      votes: { up: 1, down: 0 },
      comments: 0,
      verified: false
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', type: 'discussion', tags: '' });
    toast.success('Post created successfully!');
    track('community_post_created', { type: post.type });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'neutral': return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'event': return 'bg-purple-500/20 text-purple-400 border-purple-400/30';
      case 'alert': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'discussion': return 'bg-green-500/20 text-green-400 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'reddit': return <MessageSquare className="h-4 w-4" />;
      case 'news': return <Globe className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-card-border">
        <Link to="/" className="flex items-center">
          <TrendingUp className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold text-foreground">PulseCycle Pro</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/pulse-insight">
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Pulse Insight
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-card-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">PulseChain Community</h1>
              <p className="text-muted-foreground">Monitor mentions, share news, and defend our vision</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <Users className="h-3 w-3 mr-1" />
                Community Hub
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/30">
                <Shield className="h-3 w-3 mr-1" />
                Verified Content
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mentions" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Mentions
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Community Feed
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </TabsTrigger>
          </TabsList>

          {/* Social Mentions Tab */}
          <TabsContent value="mentions" className="space-y-6">
            <Card className="p-6 bg-gradient-glow border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Social Media Monitoring</h3>
                  <p className="text-sm text-muted-foreground">Real-time mentions across platforms</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">156</div>
                  <div className="text-sm text-muted-foreground">Positive Mentions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">23</div>
                  <div className="text-sm text-muted-foreground">Negative Mentions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">87%</div>
                  <div className="text-sm text-muted-foreground">Sentiment Score</div>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              {mentions.map((mention) => (
                <Card key={mention.id} className="p-6 bg-card border-card-border">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(mention.platform)}
                      <Badge className={getSentimentColor(mention.sentiment)}>
                        {mention.sentiment}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">{mention.author}</span>
                        {mention.verified && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{mention.timestamp}</span>
                      </div>
                      <p className="text-foreground mb-3">{mention.content}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {mention.votes.up}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {mention.votes.down}
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {mention.responses} Responses
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Community Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-6 bg-card border-card-border">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback>{post.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">{post.author}</span>
                        {post.verified && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge className={getTypeColor(post.type)}>
                          {post.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{post.title}</h3>
                      <p className="text-foreground mb-3">{post.content}</p>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.votes.up}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {post.votes.down}
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments} Comments
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="p-6 bg-card border-card-border">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Upcoming Events</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-card-border rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">15</div>
                    <div className="text-sm text-muted-foreground">MAR</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">PulseChain Mainnet Anniversary</h4>
                    <p className="text-muted-foreground">Community celebration with special announcements</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">2:00 PM UTC</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Create Post Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="p-6 bg-card border-card-border">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">Create New Post</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <Input
                    placeholder="Enter post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
                  <Textarea
                    placeholder="Share your thoughts, news, or insights..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                    <select
                      className="w-full p-2 bg-card border border-card-border rounded-md text-foreground"
                      value={newPost.type}
                      onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                    >
                      <option value="discussion">Discussion</option>
                      <option value="news">News</option>
                      <option value="event">Event</option>
                      <option value="alert">Alert</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Tags (comma separated)</label>
                    <Input
                      placeholder="e.g. news, defi, mainnet"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleNewPost} className="w-full">
                  Create Post
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;