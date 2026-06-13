import prisma from '../config/database';
import { decryptConfig } from '../utils/encryption';
import { notificationDispatcher } from '../services/notification.dispatcher';
import { logger } from '../utils/logger';
import { emitNewAlert } from '../socket';

class AutomationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMs = 5000) {
    if (this.intervalId) return;

    logger.info(`⏰ Starting automation rules evaluator (interval: ${intervalMs / 1000}s)`);
    this.intervalId = setInterval(() => this.evaluate(), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('⏰ Automation rules evaluator stopped');
    }
  }

  private async evaluate() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const activeRules = await prisma.automationRule.findMany({
        where: { isEnabled: true },
      });

      for (const rule of activeRules) {
        try {
          const triggerConfig = rule.triggerConfig as any;
          const actionConfig = rule.actionConfig as any;

          // 1. Evaluate Trigger
          let isTriggered = false;
          let detailsMessage = '';

          if (rule.triggerType === 'METRIC_THRESHOLD') {
            const { metric, operator, value, serviceId } = triggerConfig;
            const lastMetric = await prisma.metric.findFirst({
              where: {
                type: metric,
                ...(serviceId ? { serviceId } : {}),
              },
              orderBy: { recordedAt: 'desc' },
            });

            if (lastMetric) {
              const metricValue = lastMetric.value;
              const targetVal = parseFloat(value);

              if (operator === '>') {
                isTriggered = metricValue > targetVal;
              } else if (operator === '<') {
                isTriggered = metricValue < targetVal;
              } else if (operator === '==' || operator === '=') {
                isTriggered = metricValue === targetVal;
              }

              if (isTriggered) {
                detailsMessage = `${metric} is ${metricValue}${lastMetric.unit || ''} (${operator} ${targetVal})`;
              }
            }
          } else if (rule.triggerType === 'SERVICE_STATUS') {
            const { serviceId, status } = triggerConfig;
            
            // Resolve service name if possible
            const service = await prisma.service.findUnique({
              where: { id: serviceId },
              include: { statuses: { orderBy: { checkedAt: 'desc' }, take: 1 } }
            });

            if (service) {
              const currentStatus = service.statuses[0]?.status || 'UNKNOWN';
              isTriggered = currentStatus === status;
              if (isTriggered) {
                detailsMessage = `Service "${service.name}" is ${currentStatus}`;
              }
            }
          }

          // 2. Cooldown check (default: 2 minutes / 120000ms to avoid alert storming)
          if (isTriggered) {
            const now = new Date();
            const lastTriggered = rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt) : null;
            const cooldownMs = 120000; // 2 minutes cooldown

            if (lastTriggered && (now.getTime() - lastTriggered.getTime() < cooldownMs)) {
              // Within cooldown, skip
              continue;
            }

            logger.info(`🚨 Automation Rule "${rule.name}" triggered: ${detailsMessage}`);

            // 3. Execute Action
            if (rule.actionType === 'SEND_NOTIFICATION') {
              const { channelId, template } = actionConfig;
              const channel = await prisma.notificationChannel.findUnique({
                where: { id: channelId },
              });

              if (channel && channel.isEnabled) {
                const decryptedConfig = decryptConfig(channel.config as Record<string, string>);
                const defaultTemplate = `🔔 <b>Automation Triggered</b>\nRule: <i>{rule_name}</i>\nDetails: {details}`;
                const messageTemplate = template || defaultTemplate;
                const finalMessage = messageTemplate
                  .replace(/{rule_name}/g, rule.name)
                  .replace(/{details}/g, detailsMessage);

                const result = await notificationDispatcher.dispatch(channel.type, decryptedConfig, finalMessage);
                if (!result.success) {
                  logger.error(`❌ Automation action SEND_NOTIFICATION failed for channel ${channel.name}: ${result.error}`);
                } else {
                  logger.info(`📧 Automation notification sent successfully via ${channel.name}`);
                }
              } else {
                logger.warn(`⚠️ Automation target channel ${channelId} not found or is disabled`);
              }
            } else if (rule.actionType === 'CREATE_ALERT') {
              const { severity, title, message } = actionConfig;
              const finalTitle = (title || `Automation Alert: ${rule.name}`)
                .replace(/{rule_name}/g, rule.name)
                .replace(/{details}/g, detailsMessage);
              const finalMessage = (message || `Trigger criteria met: {details}`)
                .replace(/{rule_name}/g, rule.name)
                .replace(/{details}/g, detailsMessage);

              const serviceId = triggerConfig.serviceId || null;

              // Check if duplicate alert is active
              const existingAlert = await prisma.alert.findFirst({
                where: {
                  title: finalTitle,
                  isResolved: false,
                }
              });

              if (!existingAlert) {
                const alert = await prisma.alert.create({
                  data: {
                    severity: severity || 'CRITICAL',
                    title: finalTitle,
                    message: finalMessage,
                    serviceId,
                  }
                });
                emitNewAlert(alert);
                logger.warn(`🚨 Automation created alert: ${finalTitle}`);
              }
            }

            // 4. Update Rule trigger time
            await prisma.automationRule.update({
              where: { id: rule.id },
              data: { lastTriggeredAt: now },
            });
          }

        } catch (ruleErr: any) {
          logger.error(`❌ Error evaluating rule "${rule.name}":`, ruleErr.message);
        }
      }

    } catch (error: any) {
      logger.error('❌ Error inside automation evaluator loop:', error.message);
    } finally {
      this.isRunning = false;
    }
  }
}

export const automationScheduler = new AutomationScheduler();
