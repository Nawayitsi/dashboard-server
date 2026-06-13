import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class SettingsService {
  async findAll(group?: string) {
    const where = group ? { group } : {};
    return prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
  }

  async get(key: string) {
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new AppError('Setting not found', 404);
    return setting;
  }

  async upsert(key: string, value: any, group = 'general') {
    return prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group },
    });
  }

  async bulkUpdate(settings: Array<{ key: string; value: any; group?: string }>) {
    const results = await Promise.all(
      settings.map(s => this.upsert(s.key, s.value, s.group))
    );
    return results;
  }

  async getAppearance() {
    const settings = await prisma.appearanceSetting.findMany();
    // Convert array of {key, value} to a single object
    const result: Record<string, string> = {
      brandName: 'HomelabOS',
      logo: '',
      favicon: '/favicon.ico',
      primaryColor: '#4F8CFF',
      accentColor: '#7A5CFF',
      theme: 'dark',
      sidebarStyle: 'glass',
      cardStyle: 'glass',
    };
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    return result;
  }

  async updateAppearance(data: Record<string, string>) {
    const results = await Promise.all(
      Object.entries(data).map(([key, value]) =>
        prisma.appearanceSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
    return results;
  }
}

export const settingsService = new SettingsService();
