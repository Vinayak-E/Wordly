import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  X, 
  Tag as TagIcon, 
  Plus, 
  Save, 
  ArrowLeft, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/services/auth.service';
import api from '@/api/axios';
import { toast } from 'sonner';
import { uploadFileToS3 } from '@/services/article.service';

interface Category {
  _id: string;
  name: string;
}

const CreateArticle = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    category: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };


  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newFilesArray = [...files, ...newFiles];
      setFiles(newFilesArray);
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];
    
    URL.revokeObjectURL(previewUrls[index]);
    
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      category: '',
    };
    
    let isValid = true;
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    if (!selectedCategory) {
      newErrors.category = 'Category is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
  
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          try {
            return await uploadFileToS3(file);
          } catch (error: any) {
            toast.error(error.message);
            throw error; 
          }
        })
      );
      
      const articleData = {
        title,
        description,
        category: selectedCategory,
        tags,
        images: imageUrls,
      };
      
      const response = await api.post('/articles', articleData);
      
      toast.success('Article created successfully!');
      navigate(`/article/${response.data.article._id}`);
    } catch (error: any) {
      console.error('Error creating article:', error);
      toast.error(error.response?.data?.message || 'Failed to create article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="container mx-auto px-6 lg:px-8  pb-20">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create Article</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="sr-only">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full text-3xl font-bold bg-transparent focus:outline-none ${
                  errors.title ? 'border-b-2 border-destructive' : 'border-b border-border'
                } pb-2 placeholder:text-muted-foreground/50`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-muted-foreground mb-1">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full py-2 px-3 bg-card border ${
                  errors.category ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-destructive">{errors.category}</p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Images
                </label>
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
                          alt={`Preview ${index}`} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click to upload images
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tags
              </label>
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
                  <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Add a tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full py-2 pl-10 pr-4 bg-card border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              <p className="mt-1 text-xs text-muted-foreground">
                Press Enter to add tags
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Write your article content here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={10}
                className={`w-full py-2 px-3 bg-card border ${
                  errors.description ? 'border-destructive' : 'border-border'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description}</p>
              )}
            </div>
          </div>
          
          <div className="sticky bottom-6 mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 shadow-md"
              size="lg"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Publish Article</>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateArticle;