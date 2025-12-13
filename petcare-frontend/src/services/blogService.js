import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/blog`,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==================== BLOG POSTS ====================
export const getAllPosts = async (params = {}) => {
  const { data } = await api.get('/', { params });
  return data;
};

export const getPostBySlug = async (slug) => {
  const { data } = await api.get(`/${slug}`);
  return data;
};

export const searchPosts = async (query, params = {}) => {
  const { data } = await api.get('/search', { params: { query, ...params } });
  return data;
};

export const getPopularPosts = async (limit = 5) => {
  const { data } = await api.get('/popular/posts', { params: { limit } });
  return data;
};

export const createPost = async (postData) => {
  const { data } = await api.post('/', postData);
  return data;
};

export const updatePost = async (postId, postData) => {
  const { data } = await api.put(`/${postId}`, postData);
  return data;
};

export const deletePost = async (postId) => {
  const { data } = await api.delete(`/${postId}`);
  return data;
};

// ==================== COMMENTS ====================
export const getComments = async (postId, params = {}) => {
  const { data } = await api.get(`/${postId}/comments`, { params });
  return data;
};

export const createComment = async (postId, commentData) => {
  const { data } = await api.post(`/${postId}/comments`, commentData);
  return data;
};

export const updateComment = async (postId, commentId, commentData) => {
  const { data } = await api.put(`/${postId}/comments/${commentId}`, commentData);
  return data;
};

export const deleteComment = async (postId, commentId) => {
  const { data } = await api.delete(`/${postId}/comments/${commentId}`);
  return data;
};

export const likeComment = async (postId, commentId) => {
  const { data } = await api.post(`/${postId}/comments/${commentId}/like`);
  return data;
};

export default {
  getAllPosts,
  getPostBySlug,
  searchPosts,
  getPopularPosts,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
};