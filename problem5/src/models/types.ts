import { Request } from 'express';
import { Role } from '@prisma/client';

// Extend Express Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    isActive: boolean;
  };
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// Resource filter parameters
export interface ResourceFilters {
  status?: string;
  category?: string;
  tags?: string[];
  ownerId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Login response
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

// Create resource DTO
export interface CreateResourceDto {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Update resource DTO
export interface UpdateResourceDto {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Register user DTO
export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

// Login DTO
export interface LoginDto {
  email: string;
  password: string;
}

// Error response structure
export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: string[];
  stack?: string;
}
