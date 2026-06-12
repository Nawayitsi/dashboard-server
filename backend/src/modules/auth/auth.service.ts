import prisma from '../../config/database';
import { comparePassword } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { LoginResponse, TokenResponse } from './auth.types';

export class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLoginAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.refreshToken !== refreshToken || !user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }

      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export const authService = new AuthService();
