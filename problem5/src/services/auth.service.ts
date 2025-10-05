import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import {
  RegisterUserDto,
  LoginDto,
  LoginResponse,
  JwtPayload,
} from '../models/types';
import {
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '../utils/errors';
import { logger } from '../config/logger';

/**
 * Authentication Service - Business logic layer
 * Implements security best practices: bcrypt hashing, JWT tokens, etc.
 */
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly saltRounds: number = 10;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'development-secret-key-change-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (process.env.NODE_ENV === 'production' && this.jwtSecret === 'development-secret-key-change-in-production') {
      logger.warn('Using default JWT secret in production! Set JWT_SECRET environment variable.');
    }
  }

  /**
   * Register new user with password hashing
   */
  async register(data: RegisterUserDto): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password using bcrypt (prevents rainbow table attacks)
    const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: Role.USER, // Default role
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    // Generate tokens
    return this.generateLoginResponse(user);
  }

  /**
   * Login user with credentials
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      logger.warn('Failed login attempt', { email: data.email });
      throw new UnauthorizedError('Invalid credentials');
    }

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    // Generate tokens
    return this.generateLoginResponse(user);
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Generate login response with tokens
   */
  private generateLoginResponse(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  }): LoginResponse {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpirationTime(this.jwtExpiresIn);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      expiresIn,
    };
  }

  /**
   * Parse JWT expiration time to seconds
   */
  private parseExpirationTime(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // Default 24 hours

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 3600;
      case 'd':
        return num * 86400;
      default:
        return 86400;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

    // Update password
    await userRepository.update(userId, { password: hashedPassword });

    logger.info('Password changed successfully', { userId });
  }
}

export const authService = new AuthService();
