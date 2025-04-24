import { useState, useEffect, useRef, useCallback } from 'react';
import { ArticleCard } from '@/components/ArticleCard';
import { getArticles } from '@/services/article.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { Article } from '@/interfaces/articleInterface';

const Dashboard = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchArticles = useCallback(
    async (pageNum: number, search: string, append: boolean = true) => {
      try {
        setLoading(true);
        const { articles: newArticles, hasMore: moreAvailable } = await getArticles({
          page: pageNum,
          limit: 12, // Increased for better UX
          search,
        });

        setArticles((prev) => (append ? [...prev, ...newArticles] : newArticles));
        setHasMore(moreAvailable);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Initial fetch and refresh
  useEffect(() => {
    fetchArticles(1, searchQuery, false);
  }, [searchQuery, fetchArticles]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchArticles(1, searchQuery, false);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
    setArticles([]); // Clear articles to reset scroll
  };

  // Infinite scroll observer
  const lastArticleElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
          fetchArticles(page + 1, searchQuery);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, searchQuery, fetchArticles]
  );

  // Handle updates from ArticleCard
  const handleArticleUpdate = (articleId: string, action: 'like' | 'dislike' | 'block') => {
    if (action === 'block') {
      setArticles((prev) => prev.filter((article) => article._id !== articleId));
    }
    // Likes and dislikes are managed in ArticleCard
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Feed</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10 bg-card border border-border w-64"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full"
            disabled={refreshing}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div
              key={article._id}
              ref={index === articles.length - 1 ? lastArticleElementRef : null}
            >
              <ArticleCard article={article} onUpdate={handleArticleUpdate} />
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-12 bg-card p-8 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-2">No articles found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery.trim()
              ? 'No articles match your search criteria.'
              : "You don't have any articles in your feed yet."}
          </p>
        </div>
      ) : null}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      <div ref={loadMoreRef} />
    </div>
  );
};

export default Dashboard;