import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, ArrowLeft, Calendar, User, Tag, Eye, Clock } from 'lucide-react';
import { likeArticle, dislikeArticle, getArticleById } from '@/services/article.service';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { toast } from 'sonner';

interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  images?: string[];
  category?: { name: string };
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  author?: { firstName: string; lastName: string };
  likes?: string[];
  dislikes?: string[];
  blocks?: string[];
  viewCount?: number;
  readTime?: number;
}

const ArticleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const data = await getArticleById(articleId);
      setArticle(data);
      setLiked(data.likes?.includes(userId) || false);
      setDisliked(data.dislikes?.includes(userId) || false);
      setLikeCount(data.likes?.length || 0);
      setDislikeCount(data.dislikes?.length || 0);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!article) return;

    try {
      await likeArticle(article._id);

      // Update local state to show changes immediately
      if (liked) {
        // If already liked, unlike
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // If not liked, like and remove dislike if exists
        setLiked(true);
        setLikeCount((prev) => prev + 1);

        if (disliked) {
          setDisliked(false);
          setDislikeCount((prev) => Math.max(0, prev - 1));
        }
      }

      toast.success(liked ? 'Article unliked' : 'Article liked');
    } catch (error) {
      console.error('Error liking article:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleDislike = async () => {
    if (!article) return;

    try {
      await dislikeArticle(article._id);

      // Update local state to show changes immediately
      if (disliked) {
        // If already disliked, remove dislike
        setDisliked(false);
        setDislikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // If not disliked, dislike and remove like if exists
        setDisliked(true);
        setDislikeCount((prev) => prev + 1);

        if (liked) {
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      }

      toast.success(disliked ? 'Dislike removed' : 'Article disliked');
    } catch (error) {
      console.error('Error disliking article:', error);
      toast.error('Failed to update dislike status');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto py-12">
        <div className="bg-card rounded-lg shadow-md p-8 text-center border border-border">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-1 text-sm mb-6 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </button>

      <article className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
        {/* Header image */}
        {article.images && article.images.length > 0 && (
        <div className="relative w-full h-64 md:h-[32rem] bg-muted overflow-hidden">
        <img
          src={article.images[0]}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
        )}

        <div className="p-6 md:p-8">
          {/* Category */}
          {article.category && (
            <div className="mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {article.category.name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>

          {/* Meta information */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
            {article.author && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>
                  {article.author.firstName} {article.author.lastName}
                </span>
              </div>
            )}

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(article.createdAt)}</span>
            </div>

            {article.viewCount !== undefined && (
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{article.viewCount} views</span>
              </div>
            )}

            {article.readTime && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{article.readTime} min read</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-lg font-medium mb-6 text-muted-foreground">{article.description}</div>

          {/* Content */}
          <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none mb-8">
            {/* This should be processed markdown or HTML content */}
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Tags:
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent/20 text-sm rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4 border-t border-border">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                liked ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'
              }`}
            >
              <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-primary' : ''}`} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={handleDislike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                disliked ? 'bg-destructive/10 text-destructive' : 'hover:bg-accent/10'
              }`}
            >
              <ThumbsDown className={`h-5 w-5 ${disliked ? 'fill-destructive' : ''}`} />
              <span>{dislikeCount}</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;