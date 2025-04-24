import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Eye,
  Image as ImageIcon,
  MoreHorizontal,
  Ban,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  likeArticle,
  dislikeArticle,
  blockArticle,
} from "@/services/article.service";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Article } from "@/interfaces/articleInterface";

export const ArticleCard = ({
  article,
  onUpdate,
}: {
  article: Article;
  onUpdate?: (articleId: string, action: "like" | "dislike" | "block") => void;
}) => {
  const userId = useSelector((state: RootState) => state?.auth?.user?.id);

  const [liked, setLiked] = useState(
    article.likes?.some((like) =>
      typeof like === "string" ? like === userId : like._id === userId
    ) || false
  );
  const [disliked, setDisliked] = useState(
    article.dislikes?.some((dislike) =>
      typeof dislike === "string" ? dislike === userId : dislike._id === userId
    ) || false
  );
  const [blocked, setBlocked] = useState(
    article.blocks?.some((block) =>
      typeof block === "string" ? block === userId : block._id === userId
    ) || false
  );
  const [likeCount, setLikeCount] = useState(article.likes?.length || 0);
  const [dislikeCount, setDislikeCount] = useState(
    article.dislikes?.length || 0
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const hasMultipleImages = article.images && article.images.length > 1;
  const isAuthor = article.author?._id === userId;

  if (blocked) {
    return null;
  }

  const handleLike = async () => {
    try {
      await likeArticle(article._id);
      if (liked) {
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
        if (disliked) {
          setDisliked(false);
          setDislikeCount((prev) => Math.max(0, prev - 1));
        }
      }
      if (onUpdate) {
        onUpdate(article._id, "like");
      }
    } catch (error) {
      console.error("Error liking article:", error);
    }
  };

  const handleDislike = async () => {
    try {
      await dislikeArticle(article._id);
      if (disliked) {
        setDisliked(false);
        setDislikeCount((prev) => Math.max(0, prev - 1));
      } else {
        setDisliked(true);
        setDislikeCount((prev) => prev + 1);
        if (liked) {
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      }
      if (onUpdate) {
        onUpdate(article._id, "dislike");
      }
    } catch (error) {
      console.error("Error disliking article:", error);
    }
  };

  const handleBlockConfirm = async () => {
    try {
      await blockArticle(article._id);
      setBlocked(true);
      setShowBlockModal(false);
      if (onUpdate) {
        onUpdate(article._id, "block");
      }
      toast.success("Article blocked", {
        description: "This article has been blocked from your feed",
      });
    } catch (error) {
      console.error("Error blocking article:", error);
      toast.error("Failed to block article");
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.images && article.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === article.images!.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.images && article.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? article.images!.length - 1 : prevIndex - 1
      );
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-border">
        <Link
          to={`/article/${article._id}`}
          className="block h-48 overflow-hidden relative"
        >
          {article.images && article.images.length > 0 ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <img
                src={article.images[currentImageIndex]}
                alt={`${article.title} - image ${currentImageIndex + 1}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                loading="lazy"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              {hasMultipleImages && (
                <>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1}/{article.images.length}
                  </div>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors focus:outline-none group"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors focus:outline-none group"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                    {article.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          currentImageIndex === idx
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/60"
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </Link>

        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {typeof article.category === "object" && article.category !== null
                ? article.category.name
                : "Uncategorized"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(article.createdAt)}
            </span>
          </div>

          <Link
            to={`/article/${article._id}`}
            className="text-lg font-semibold mb-2 block hover:text-primary transition-colors"
          >
            {article.title}
          </Link>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {article.description}
          </p>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent/20 text-xs rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {article.author?.firstName?.[0] || ""}
                  {article.author?.lastName?.[0] || ""}
                </span>
              </div>
              <span className="ml-2 text-sm font-medium">
                {article.author?.firstName} {article.author?.lastName}
                {isAuthor && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to={`/article/${article._id}`}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>

              {!isAuthor && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(!showDropdown);
                    }}
                    className="p-1 rounded-full hover:bg-accent/20 focus:outline-none"
                  >
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-card rounded-md shadow-lg py-1 z-10 ring-1 ring-border">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBlockModal(true);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent/10 flex items-center text-destructive"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Block
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 p-1 rounded-md transition-colors ${
                  liked ? "text-primary bg-primary/10" : "hover:bg-accent/10"
                }`}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${liked ? "fill-primary" : ""}`}
                />
                <span className="text-xs">{likeCount}</span>
              </button>

              <button
                onClick={handleDislike}
                className={`flex items-center space-x-1 p-1 rounded-md transition-colors ${
                  disliked
                    ? "text-destructive bg-destructive/10"
                    : "hover:bg-accent/10"
                }`}
              >
                <ThumbsDown
                  className={`h-4 w-4 ${disliked ? "fill-destructive" : ""}`}
                />
                <span className="text-xs">{dislikeCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Block Article</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="p-1 rounded-full hover:bg-accent/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to block this article? It will be removed
              from your feed.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-md bg-accent/20 hover:bg-accent/30 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockConfirm}
                className="px-4 py-2 rounded-md bg-destructive text-white hover:bg-destructive/90 text-sm font-medium"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
