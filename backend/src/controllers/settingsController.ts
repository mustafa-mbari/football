import { Request, Response } from 'express';
import prisma from '../config/database';

// Get a specific setting by key
export const getSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const setting = await prisma.appSettings.findUnique({
      where: { key }
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all settings
export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findMany({
      orderBy: { key: 'asc' }
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update or create a setting
export const upsertSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }

    const setting = await prisma.appSettings.upsert({
      where: { key },
      update: {
        value: value.toString(),
        description: description || undefined
      },
      create: {
        key,
        value: value.toString(),
        description: description || undefined
      }
    });

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a setting
export const deleteSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    await prisma.appSettings.delete({
      where: { key }
    });

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
