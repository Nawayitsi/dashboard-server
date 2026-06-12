import prisma from '../../config/database';
import { hashPassword } from '../../utils/password';
import { AppError } from '../../middleware/errorHandler';
import { Role } from '@prisma/client';

export class UsersService {
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true, email: true, username: true, firstName: true,
          lastName: true, role: true, isActive: true, avatar: true,
          createdAt: true, lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return { users, total };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, username: true, firstName: true,
        lastName: true, role: true, isActive: true, avatar: true,
        createdAt: true, lastLoginAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async create(data: {
    email: string; username: string; password: string;
    firstName?: string; lastName?: string; role?: Role;
  }) {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (exists) throw new AppError('Email or username already exists', 409);

    const hashed = await hashPassword(data.password);
    return prisma.user.create({
      data: { ...data, password: hashed },
      select: {
        id: true, email: true, username: true, firstName: true,
        lastName: true, role: true, isActive: true, createdAt: true,
      },
    });
  }

  async update(id: string, data: {
    firstName?: string; lastName?: string; role?: Role;
    isActive?: boolean; avatar?: string;
  }) {
    await this.findById(id);
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, username: true, firstName: true,
        lastName: true, role: true, isActive: true, avatar: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.user.delete({ where: { id } });
  }
}

export const usersService = new UsersService();
