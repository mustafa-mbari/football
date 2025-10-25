import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllPointsRules = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    const whereClause = active === 'true' ? { isActive: true } : {};

    const rules = await prisma.pointsRule.findMany({
      where: whereClause,
      orderBy: {
        priority: 'asc'
      }
    });

    res.json({
      success: true,
      data: rules
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPointsRuleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rule = await prisma.pointsRule.findUnique({
      where: { id: parseInt(id) }
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Points rule not found'
      });
    }

    res.json({
      success: true,
      data: rule
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePointsRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, points, isActive, priority } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (points !== undefined) updateData.points = points;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = priority;

    const rule = await prisma.pointsRule.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      success: true,
      data: rule,
      message: 'Points rule updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
