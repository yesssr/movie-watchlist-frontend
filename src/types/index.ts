export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  user_id: string;
  title: string;
  genre?: string;
  status: "want_to_watch" | "watching" | "watched";
  rating?: number;
  review?: string;
  poster_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MovieStats {
  want_to_watch: number;
  watching: number;
  watched: number;
  total: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface MovieFormData {
  title: string;
  genre?: string;
  status: Movie["status"];
  rating?: number;
  review?: string;
}
