import { useState, useEffect, FormEvent, ChangeEvent, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Loader2, Image as ImageIcon, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getArticleById, updateArticle, uploadFileToS3 } from '@/services/article.service';
import { getCategories } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Article } from '@/interfaces/articleInterface';

interface Category {
  _id: string;
  name: string;
}


const ArticleEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch article data
        if (id) {
          const articleData = await getArticleById(id);
          setArticle(articleData);
          setTitle(articleData.title);
          setDescription(articleData.description);
          setTags(articleData.tags || []);
          setCategoryId(articleData.category?._id || '');
          setImageUrls(articleData.images || []);
          setPreviewUrls(articleData.images || []); // Initialize with existing images
        }

        // Fetch categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load article data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...newFiles]);

      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveImageFile = (indexToRemove: number) => {
    const newFiles = [...imageFiles];
    const newPreviewUrls = [...previewUrls];

    // Revoke the preview URL if it was created from a new file
    if (indexToRemove >= imageUrls.length) {
      URL.revokeObjectURL(previewUrls[indexToRemove]);
    }

    newFiles.splice(indexToRemove - imageUrls.length, 1);
    newPreviewUrls.splice(indexToRemove, 1);

    setImageFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handleRemoveImageUrl = (indexToRemove: number) => {
    const newImageUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    const newPreviewUrls = previewUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newImageUrls);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error('Article ID is missing');
      return;
    }

    if (!title.trim() || !description.trim() || !categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      // Upload new images
      let allImageUrls = [...imageUrls];
      if (imageFiles.length > 0) {
        const newUrls = await Promise.all(
          imageFiles.map(async (file) => {
            try {
              return await uploadFileToS3(file);
            } catch (error: any) {
              toast.error(error.message || 'Failed to upload image');
              throw error;
            }
          })
        );
        allImageUrls = [...allImageUrls, ...newUrls];
      }

      // Update the article
      await updateArticle(id, {
        title,
        description,
        tags,
        category: categoryId,
        images: allImageUrls,
      });

      toast.success('Article updated successfully');
      navigate('/my-articles');
    } catch (err) {
      console.error('Error updating article:', err);
      toast.error('Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Error Loading Article</h2>
        <p className="text-muted-foreground">{error || 'Article not found'}</p>
        <Button
          onClick={() => navigate('/my-articles')}
          className="mt-4"
        >
          Go Back to My Articles
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 ">
      <Button
        variant="ghost"
        onClick={() => navigate('/my-articles')}
        className="flex  items-center mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to My Articles
      </Button>

      <h1 className="text-3xl text-center font-bold mb-8">Edit Article</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-3 border ${
              !title.trim() ? 'border-destructive' : 'border-border'
            } rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30`}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium mb-2">
            Category <span className="text-destructive">*</span>
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`w-full p-3 border ${
              !categoryId ? 'border-destructive' : 'border-border'
            } rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30`}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description <span className="text-destructive">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full p-3 border ${
              !description.trim() ? 'border-destructive' : 'border-border'
            } rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-32`}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center bg-accent/20 text-sm rounded-full px-3 py-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <div className="relative flex-grow">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add a tag"
                className="w-full py-2 px-3 bg-card border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddTag}
              variant="secondary"
              className="rounded-l-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Press Enter to add tags</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Images</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs"
            >
              <ImageIcon className="h-4 w-4 mr-1" /> Add Images
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </div>

          {previewUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="h-24 w-full overflow-hidden rounded-lg border border-border">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      index < imageUrls.length
                        ? handleRemoveImageUrl(index)
                        : handleRemoveImageFile(index)
                    }
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Click to upload images</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/my-articles')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditPage;