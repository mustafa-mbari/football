import { Request, Response } from 'express';
import prisma from '../config/database';

// Request a group change (league/teams) - requires admin approval
export const createChangeRequest = async (req: Request, res: Response) => {
  try {
    const { id: groupId } = req.params;
    const userId = (req as any).userId;
    const { changeType, requestedValue, reason } = req.body;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group owner can request changes'
      });
    }

    if (group.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify public groups'
      });
    }

    // Check if there's already a pending request for this group
    const existingRequest = await prisma.groupChangeRequest.findFirst({
      where: {
        groupId: parseInt(groupId),
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'There is already a pending change request for this group'
      });
    }

    // Get current value based on change type
    let currentValue: any = null;
    if (changeType === 'LEAGUE_CHANGE') {
      currentValue = { leagueId: group.leagueId };
    } else if (changeType === 'TEAM_SELECTION_CHANGE') {
      currentValue = { allowedTeamIds: group.allowedTeamIds };
    } else if (changeType === 'CROSS_LEAGUE_TOGGLE') {
      currentValue = { leagueId: group.leagueId, allowedTeamIds: group.allowedTeamIds };
    }

    const changeRequest = await prisma.groupChangeRequest.create({
      data: {
        groupId: parseInt(groupId),
        requestedById: userId,
        changeType,
        currentValue,
        requestedValue,
        reason
      },
      include: {
        group: {
          include: {
            league: true
          }
        },
        requestedBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: changeRequest,
      message: 'Change request submitted for admin approval'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all change requests (admin only)
export const getAllChangeRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const changeRequests = await prisma.groupChangeRequest.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        group: {
          include: {
            league: true,
            owner: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        requestedBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: changeRequests
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get change requests for a specific group
export const getGroupChangeRequests = async (req: Request, res: Response) => {
  try {
    const { id: groupId } = req.params;

    const changeRequests = await prisma.groupChangeRequest.findMany({
      where: { groupId: parseInt(groupId) },
      include: {
        requestedBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: changeRequests
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approve change request (admin only)
export const approveChangeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { reviewNote } = req.body;

    const changeRequest = await prisma.groupChangeRequest.findUnique({
      where: { id: parseInt(id) },
      include: {
        group: true
      }
    });

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Change request not found'
      });
    }

    if (changeRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been reviewed'
      });
    }

    // Apply the changes to the group
    const requestedValue = changeRequest.requestedValue as any;
    let updateData: any = {};

    if (changeRequest.changeType === 'LEAGUE_CHANGE') {
      updateData.leagueId = requestedValue.leagueId;
    } else if (changeRequest.changeType === 'TEAM_SELECTION_CHANGE') {
      updateData.allowedTeamIds = requestedValue.allowedTeamIds;
    } else if (changeRequest.changeType === 'CROSS_LEAGUE_TOGGLE') {
      updateData.leagueId = requestedValue.leagueId;
      updateData.allowedTeamIds = requestedValue.allowedTeamIds;
    }

    // Update group and change request in a transaction
    const [updatedRequest, updatedGroup] = await prisma.$transaction([
      prisma.groupChangeRequest.update({
        where: { id: parseInt(id) },
        data: {
          status: 'APPROVED',
          reviewedBy: userId,
          reviewedAt: new Date(),
          reviewNote
        }
      }),
      prisma.group.update({
        where: { id: changeRequest.groupId },
        data: updateData
      })
    ]);

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Change request approved and applied'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reject change request (admin only)
export const rejectChangeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { reviewNote } = req.body;

    const changeRequest = await prisma.groupChangeRequest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Change request not found'
      });
    }

    if (changeRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been reviewed'
      });
    }

    const updatedRequest = await prisma.groupChangeRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNote
      }
    });

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Change request rejected'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
