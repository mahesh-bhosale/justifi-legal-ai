import api from './api';

export interface BlogPostDTO {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  readTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  readTime?: number;
}

export type UpdateBlogPostInput = CreateBlogPostInput;

export async function listBlogs(params?: Record<string, string | number | boolean>) {
  const response = await api.get('/api/blogs', { params });
  // Backend returns { success, message, data: { posts, total, limit, offset } }
  return (response.data?.data?.posts ?? []) as BlogPostDTO[];
}

export async function getRecentBlogs() {
  const response = await api.get('/api/blogs/recent');
  // Backend returns { success, message, data: BlogPostDTO[] }
  return (response.data?.data ?? []) as BlogPostDTO[];
}

export async function getBlogById(id: number | string) {
  const response = await api.get(`/api/blogs/${id}`);
  return response.data?.data as BlogPostDTO;
}

export async function getBlogBySlug(slug: string) {
  const response = await api.get(`/api/blogs/slug/${slug}`);
  return response.data?.data as BlogPostDTO;
}

export async function getBlogsByAuthor(author: string) {
  const response = await api.get(`/api/blogs/author/${author}`);
  // Backend returns { success, message, data: { posts, total, author } }
  return (response.data?.data?.posts ?? []) as BlogPostDTO[];
}

export async function createBlogPost(payload: CreateBlogPostInput) {
  const response = await api.post('/api/blogs', payload);
  return response.data?.data as BlogPostDTO;
}

export async function updateBlogPost(id: number | string, payload: UpdateBlogPostInput) {
  const response = await api.put(`/api/blogs/${id}`, payload);
  return response.data?.data as BlogPostDTO;
}

export async function deleteBlogPost(id: number | string) {
  const response = await api.delete(`/api/blogs/${id}`);
  return Boolean(response.data?.success);
}


