import api from '@/api/axios';
import { Article, GetArticlesParams } from '@/interfaces/articleInterface';

export const getArticles = async (params: GetArticlesParams = {}) => {
  const response = await api.get('/articles', { params });
  return response.data;
};
export const getArticleById = async (articleId :string) => {
    const response = await api.get(`/articles/${articleId}`, );
    return response.data;
  };
  
export const likeArticle = async (articleId: string) => {
  await api.post(`/articles/${articleId}/like`);
};

export const dislikeArticle = async (articleId: string) => {
  await api.post(`/articles/${articleId}/dislike`);
};

export const blockArticle = async (articleId: string) => {
  await api.post(`/articles/${articleId}/block`);
};

export const getUserArticles = async (params: GetArticlesParams = {}) => {
  try {
    const response = await api.get('/articles/my-articles', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user articles:', error);
    throw error;
  }
};

  export const deleteArticle = async (articleId: string) => {
    try {
      const response = await api.delete(`/articles/${articleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  };
  export const updateArticle = async (id: string, articleData: Partial<Article>) => {
    try {
      const response = await api.put(`/articles/${id}`, articleData);
      return response.data;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  };

 export const uploadFileToS3 = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload image');
    }
  };