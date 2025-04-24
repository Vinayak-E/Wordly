import { useState, useEffect, useRef, useCallback } from 'react';
import { getUserArticles, deleteArticle } from '@/services/article.service';
import { ArticleCard } from '@/components/ArticleCard';
import { Pencil, Trash2, Loader2, AlertCircle, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Article } from '@/interfaces/articleInterface';



interface UserPopup {
  type: 'likes' | 'dislikes' | 'blocks';
  users: { firstName: string; lastName: string; _id: string }[];
}

const MyArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userPopup, setUserPopup] = useState<UserPopup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchArticles = useCallback(
    async (pageNum: number, search: string, append: boolean = true) => {
      try {
        setLoading(true);
        const { articles: newArticles, hasMore: moreAvailable } = await getUserArticles({
          page: pageNum,
          limit: 12,
          search,
        });
        setArticles((prev) => (append ? [...prev, ...newArticles] : newArticles));
        setHasMore(moreAvailable);
        setError(null);
      } catch (err) {
        setError('Failed to load your articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchArticles(1, searchQuery, false);
  }, [searchQuery, fetchArticles]);

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

  const handleDeleteClick = (articleId: string) => {
    setDeleteConfirm(articleId);
  };

  const handleDeleteConfirm = async (articleId: string) => {
    try {
      setIsDeleting(true);
      await deleteArticle(articleId);
      setArticles(articles.filter((article) => article._id !== articleId));
      toast.success('Article deleted successfully');
    } catch (err) {
      console.error('Failed to delete article:', err);
      toast.error('Failed to delete article');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleEditClick = (articleId: string) => {
    navigate(`/articles/edit/${articleId}`);
  };

  const handleShowUsers = (articleId: string, type: 'likes' | 'dislikes' | 'blocks') => {
    const article = articles.find((a) => a._id === articleId);
    if (!article) return;

    let users: { _id: string; firstName: string; lastName: string }[] = [];

    if (type === 'likes' && article.likes) {
      users = article.likes;
    } else if (type === 'dislikes' && article.dislikes) {
      users = article.dislikes;
    } else if (type === 'blocks' && article.blocks) {
      users = article.blocks;
    }

    setUserPopup({ type, users });
  };

  const handleCardUpdate = (articleId: string, action: 'like' | 'dislike' | 'block') => {
    console.log(`Article ${articleId} was ${action}d`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
    setArticles([]);
  };

  if (error && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Error Loading Articles</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Articles</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your articles..."
              className="pl-10 bg-card border border-border w-64"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Button
            onClick={() => navigate('/create-article')}
            className="px-4 py-2 bg-primary text-card hover:bg-primary/90 transition-colors"
          >
            Create New Article
          </Button>
        </div>
      </div>

      {articles.length === 0 && !loading ? (
        <div className="text-center py-16 bg-accent/10 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Articles Yet</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery.trim() ? 'No articles match your search criteria.' : "You haven't created any articles yet."}
          </p>
          <Button
            onClick={() => navigate('/create-article')}
            className="px-6 py-2 bg-primary text-background hover:bg-primary/90 transition-colors"
          >
            Create Your First Article
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div
              key={article._id}
              ref={index === articles.length - 1 ? lastArticleElementRef : null}
              className="relative"
            >
              <ArticleCard article={article} onUpdate={handleCardUpdate} />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(article._id)}
                  className="bg-card/80 hover:bg-card rounded-full shadow-md"
                  title="Edit article"
                >
                  <Pencil className="w-4 h-4 text-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(article._id)}
                  className="bg-card/80 hover:bg-card rounded-full shadow-md"
                  title="Delete article"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="mt-2 flex justify-between px-2">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleShowUsers(article._id, 'likes')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  View {article.likes?.length || 0} likes
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleShowUsers(article._id, 'blocks')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  View {article.blocks?.length || 0} blocks
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <div ref={loadMoreRef} />

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Delete Article</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="p-1 rounded-full hover:bg-accent/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteConfirm(deleteConfirm)}
                disabled={isDeleting}
                className="px-4 py-2 bg-destructive text-white hover:bg-destructive/90 flex items-center"
              >
                {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {userPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {userPopup.type === 'likes' ? 'Likes' : userPopup.type === 'dislikes' ? 'Dislikes' : 'Blocks'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setUserPopup(null)}
                className="p-1 rounded-full hover:bg-accent/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {userPopup.users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No users found</p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {userPopup.users.map((user) => (
                  <div key={user._id} className="flex items-center p-2 hover:bg-accent/10 rounded-md">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-primary">
                        {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                      </span>
                    </div>
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyArticlesPage;