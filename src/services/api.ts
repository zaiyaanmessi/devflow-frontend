import axios from 'axios';
import { User, Question, Answer, Vote, Comment } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add JWT token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses - DON'T auto-logout on 401
// Let the component handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/register', {
      username,
      email,
      password,
    }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  getMe: () => api.get<User>('/auth/me'),
};

// Question endpoints
export const questionAPI = {
  getAll: (page = 1, limit = 10, search?: string, tags?: string) =>
    api.get<{ questions: Question[]; total: number }>('/questions', {
      params: { page, limit, search, tags },
    }),
  getById: (id: string) => api.get<Question>(`/questions/${id}`),
  create: (title: string, body: string, tags: string[]) =>
    api.post<Question>('/questions', { title, body, tags }),
  update: (id: string, title: string, body: string, tags: string[]) =>
    api.put<Question>(`/questions/${id}`, { title, body, tags }),
  delete: (id: string) => api.delete(`/questions/${id}`),
  search: (query: string, tags?: string, sort?: string) =>
    api.get<{ questions: Question[] }>('/questions', {
      params: { search: query, tags, sort },
    }),
};

// Answer endpoints
export const answerAPI = {
  create: (questionId: string, body: string) =>
    api.post<Answer>(`/questions/${questionId}/answers`, { body }),
  accept: (questionId: string, answerId: string) =>
    api.put<Answer>(`/questions/${questionId}/answers/${answerId}/accept`),
};

// Vote endpoints
export const voteAPI = {
  create: (targetType: 'question' | 'answer', targetId: string, value: 1 | -1) =>
    api.post<Vote>('/votes', { targetType, targetId, value }),
  delete: (voteId: string) => api.delete(`/votes/${voteId}`),
};

// Comment endpoints
export const commentAPI = {
  create: (body: string, targetType: 'question' | 'answer', targetId: string) =>
    api.post<Comment>('/comments', { body, targetType, targetId }),
};

// User endpoints
export const userAPI = {
  getProfile: (userId: string) => api.get<User>(`/users/${userId}`),
  updateProfile: (userId: string, bio: string, username: string) =>
    api.put<User>(`/users/${userId}`, { bio, username }),
  getQuestions: (userId: string) =>
    api.get<{ questions: Question[] }>(`/users/${userId}/questions`),
};

export default api;