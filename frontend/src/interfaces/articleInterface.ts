export interface Article {
    _id: string;
    title: string;
    description: string;
    images?: string[];
    category?: { name: string; _id: string } | string;
    createdAt: string;
    tags?: string[];
    author?: { firstName: string; lastName: string; _id: string };
    likes?: { _id: string; firstName: string; lastName: string }[];
    dislikes?: { _id: string; firstName: string; lastName: string }[];
    blocks?: { _id: string; firstName: string; lastName: string }[];
  }
export interface GetArticlesParams {
    page?: number;
    limit?: number;
    search?: string;
  }