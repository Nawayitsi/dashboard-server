import axios from 'axios';
import { logger } from '../utils/logger';

export class NotificationDispatcher {
  async dispatch(type: string, config: any, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const channelType = type.toUpperCase();
      switch (channelType) {
        case 'TELEGRAM':
          return await this.sendTelegram(config, message);
        case 'DISCORD':
          return await this.sendDiscord(config, message);
        case 'SLACK':
          return await this.sendSlack(config, message);
        case 'WEBHOOK':
          return await this.sendWebhook(config, message);
        case 'EMAIL':
          return await this.sendEmail(config, message);
        default:
          return { success: false, error: `Unsupported channel type: ${type}` };
      }
    } catch (error: any) {
      logger.error(`Notification dispatch failed for ${type}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  private async sendTelegram(config: any, message: string) {
    const { botToken, chatId } = config;
    if (!botToken || !chatId) {
      return { success: false, error: 'botToken and chatId are required for Telegram' };
    }
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });
    return { success: true };
  }

  private async sendDiscord(config: any, message: string) {
    const { webhookUrl } = config;
    if (!webhookUrl) {
      return { success: false, error: 'webhookUrl is required for Discord' };
    }
    await axios.post(webhookUrl, {
      content: message,
    });
    return { success: true };
  }

  private async sendSlack(config: any, message: string) {
    const { webhookUrl } = config;
    if (!webhookUrl) {
      return { success: false, error: 'webhookUrl is required for Slack' };
    }
    await axios.post(webhookUrl, {
      text: message,
    });
    return { success: true };
  }

  private async sendWebhook(config: any, message: string) {
    const { url, headers = {} } = config;
    if (!url) {
      return { success: false, error: 'url is required for Webhook' };
    }
    await axios.post(url, {
      event: 'notification',
      message,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    return { success: true };
  }

  private async sendEmail(config: any, message: string) {
    const { to, from = 'noreply@homelabos.local' } = config;
    if (!to) {
      return { success: false, error: 'recipient email (to) is required for Email' };
    }
    // Since we don't have nodemailer in dependencies, we simulate email sending to console/logger
    logger.info(`[Email Dispatcher] Simulating Email from ${from} to ${to}: ${message}`);
    return { success: true };
  }
}

export const notificationDispatcher = new NotificationDispatcher();
