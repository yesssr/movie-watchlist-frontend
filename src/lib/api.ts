import axios, { AxiosResponse } from "axios";
import {
  ApiResponse,
  AuthResponse,
  User,
  Movie,
  MovieStats,
  LoginCredentials,
  RegisterCredentials,
  MovieFormData,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor untuk handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let components handle 401 errors individually
    // Don't auto-redirect to prevent infinite loops
    return Promise.reject(error);
  }
);

export const authApi = {
  getGoogleAuthUrl: (): string => {
    return `${API_BASE_URL}/api/auth/google`;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/api/auth/register",
      credentials
    );
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/api/auth/login",
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.post(
      "/api/auth/logout"
    );
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await apiClient.get("/api/auth/profile");
    return response.data;
  },

  updateProfile: async (data: {
    username?: string;
    email?: string;
    password?: string;
  }) => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await apiClient.put("/api/auth/profile", data);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post(
      "/api/auth/refresh"
    );
    return response.data;
  },
};

export const movieApi = {
  getMovies: async (params?: {
    status?: string;
    genre?: string;
    search?: string;
  }): Promise<ApiResponse<{ movies: Movie[]; count: number }>> => {
    const response: AxiosResponse<
      ApiResponse<{ movies: Movie[]; count: number }>
    > = await apiClient.get("/api/movies", { params });
    return response.data;
  },

  getMovie: async (id: string): Promise<ApiResponse<{ movie: Movie }>> => {
    const response: AxiosResponse<ApiResponse<{ movie: Movie }>> =
      await apiClient.get(`/api/movies/${id}`);
    return response.data;
  },

  createMovie: async (
    movieData: MovieFormData
  ): Promise<ApiResponse<{ movie: Movie }>> => {
    const response: AxiosResponse<ApiResponse<{ movie: Movie }>> =
      await apiClient.post("/api/movies", movieData);
    return response.data;
  },

  updateMovie: async (
    id: string,
    movieData: Partial<MovieFormData>
  ): Promise<ApiResponse<{ movie: Movie }>> => {
    const response: AxiosResponse<ApiResponse<{ movie: Movie }>> =
      await apiClient.put(`/api/movies/${id}`, movieData);
    return response.data;
  },

  deleteMovie: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.delete(
      `/api/movies/${id}`
    );
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{ stats: MovieStats }>> => {
    const response: AxiosResponse<ApiResponse<{ stats: MovieStats }>> =
      await apiClient.get("/api/movies/stats");
    return response.data;
  },

  searchTMDb: async (query: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await apiClient.get(
      `/api/movies/search-tmdb?query=${encodeURIComponent(query)}`
    );
    return response.data;
  },
};

export default apiClient;
