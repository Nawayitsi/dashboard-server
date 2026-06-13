import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { encryptConfig, decryptConfig } from '../../utils/encryption';
import { notificationDispatcher } from '../../services/notification.dispatcher';

export class NotificationChannelsService {
  async findAll() {
    const channels = await prisma.notificationChannel.findMany({
      orderBy: { name: 'asc' },
    });
    // Never return decrypted configurations directly to the public/non-admin API.
    // For admin list, return it with values masked or decrypted depending on route requirements.
    // Let's decrypt it for internal backend usage, but mask it when returning.
    return channels.map(c => {
      const decrypted = decryptConfig(c.config as Record<string, string>);
      // Mask sensitive fields like apiToken, password, secret, botToken, webhookUrl
      const masked: Record<string, string> = {};
      for (const [key, val] of Object.entries(decrypted)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('token') ||
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('url') ||
          lowerKey.includes('webhook')
        ) {
          masked[key] = '••••••••';
        } else {
          masked[key] = val;
        }
      }
      return {
        ...c,
        config: masked,
      };
    });
  }

  async findById(id: string) {
    const channel = await prisma.notificationChannel.findUnique({
      where: { id },
    });
    if (!channel) throw new AppError('Notification channel not found', 404);

    const decrypted = decryptConfig(channel.config as Record<string, string>);
    return {
      ...channel,
      config: decrypted,
    };
  }

  async create(data: { name: string; type: string; config: any; isEnabled?: boolean; templates?: any }) {
    const encryptedConfig = encryptConfig(data.config);
    return prisma.notificationChannel.create({
      data: {
        name: data.name,
        type: data.type.toUpperCase(),
        config: encryptedConfig,
        isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
        templates: data.templates || null,
      },
    });
  }

  async update(id: string, data: Partial<{ name: string; type: string; config: any; isEnabled: boolean; templates: any }>) {
    await this.findById(id);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type.toUpperCase();
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
    if (data.templates !== undefined) updateData.templates = data.templates;
    if (data.config !== undefined) {
      updateData.config = encryptConfig(data.config);
    }

    return prisma.notificationChannel.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.notificationChannel.delete({ where: { id } });
  }

  async testChannel(id: string) {
    const channel = await this.findById(id);
    const message = `🔔 Test Notification from <b>${channel.name}</b> setup! Configured successfully.`;
    const result = await notificationDispatcher.dispatch(channel.type, channel.config, message);
    if (!result.success) {
      throw new AppError(`Test failed: ${result.error}`, 400);
    }
    return result;
  }
}

export const notificationChannelsService = new NotificationChannelsService();
