import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';

export class AutomationController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = await prisma.automationRule.findMany({
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, rules);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await prisma.automationRule.findUnique({
        where: { id: req.params.id as string },
      });
      if (!rule) throw new AppError('Automation rule not found', 404);
      sendSuccess(res, rule);
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, triggerType, triggerConfig, actionType, actionConfig, isEnabled } = req.body;
      if (!name || !triggerType || !triggerConfig || !actionType || !actionConfig) {
        throw new AppError('Missing required automation rule fields', 400);
      }

      const rule = await prisma.automationRule.create({
        data: {
          name,
          description: description || null,
          triggerType,
          triggerConfig: triggerConfig as any,
          actionType,
          actionConfig: actionConfig as any,
          isEnabled: isEnabled !== undefined ? isEnabled : true,
        },
      });

      sendSuccess(res, rule, 'Automation rule created', 201);
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, triggerType, triggerConfig, actionType, actionConfig, isEnabled } = req.body;
      const rule = await prisma.automationRule.findUnique({
        where: { id: req.params.id as string },
      });
      if (!rule) throw new AppError('Automation rule not found', 404);

      const updated = await prisma.automationRule.update({
        where: { id: req.params.id as string },
        data: {
          name: name !== undefined ? name : rule.name,
          description: description !== undefined ? description : rule.description,
          triggerType: triggerType !== undefined ? triggerType : rule.triggerType,
          triggerConfig: triggerConfig !== undefined ? triggerConfig : rule.triggerConfig,
          actionType: actionType !== undefined ? actionType : rule.actionType,
          actionConfig: actionConfig !== undefined ? actionConfig : rule.actionConfig,
          isEnabled: isEnabled !== undefined ? isEnabled : rule.isEnabled,
        },
      });

      sendSuccess(res, updated, 'Automation rule updated');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await prisma.automationRule.findUnique({
        where: { id: req.params.id as string },
      });
      if (!rule) throw new AppError('Automation rule not found', 404);

      await prisma.automationRule.delete({
        where: { id: req.params.id as string },
      });

      sendSuccess(res, null, 'Automation rule deleted');
    } catch (error) { next(error); }
  }
}

export const automationController = new AutomationController();
