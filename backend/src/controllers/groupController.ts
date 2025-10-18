import { Request, Response } from 'express';
import prisma from '../config/database';

// Create a new private group
export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description, leagueId, allowedTeamIds, joinCode } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    // Validate league if provided (optional for cross-league private groups)
    if (leagueId) {
      const league = await prisma.league.findUnique({
        where: { id: parseInt(leagueId) }
      });

      if (!league) {
        return res.status(404).json({
          success: false,
          message: 'League not found'
        });
      }
    }

    // Validate teams if provided
    if (allowedTeamIds && allowedTeamIds.length > 0) {
      const teams = await prisma.team.findMany({
        where: {
          id: { in: allowedTeamIds },
          ...(leagueId && { leagueId: parseInt(leagueId) })
        }
      });

      if (teams.length !== allowedTeamIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some teams are invalid or do not exist'
        });
      }
    }

    // Generate join code if not provided
    const finalJoinCode = joinCode || `${name.substring(0, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;

    const group = await prisma.group.create({
      data: {
        name,
        description: description || '',
        ownerId: userId,
        isPrivate: true,
        isPublic: false,
        leagueId: leagueId ? parseInt(leagueId) : null,
        allowedTeamIds: allowedTeamIds || [],
        joinCode: finalJoinCode,
        logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      },
      include: {
        league: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    // Auto-add creator as owner member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'OWNER'
      }
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all groups (public + user's private groups)
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { isPublic: true },
          { members: { some: { userId } } }
        ]
      },
      include: {
        league: true,
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: [
        { isPublic: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get only public groups
export const getPublicGroups = async (req: Request, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      where: { isPublic: true },
      include: {
        league: true,
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        league: {
          priority: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's groups (both public and private where user is member)
export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            league: true,
            owner: {
              select: {
                id: true,
                username: true
              }
            },
            _count: {
              select: {
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        group: {
          isPublic: 'desc'
        }
      }
    });

    const groups = memberships.map(m => ({
      ...m.group,
      memberRole: m.role,
      memberPoints: m.totalPoints,
      memberPointsByLeague: m.pointsByLeague
    }));

    res.json({
      success: true,
      data: groups
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get group details by ID
export const getGroupDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        league: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            totalPoints: 'desc'
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is member (for private groups)
    const isMember = group.members.some(m => m.userId === userId);
    if (group.isPrivate && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this group.'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get group leaderboard with optional league filter
export const getGroupLeaderboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { leagueId } = req.query;
    const userId = (req as any).userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is member (for private groups)
    const isMember = group.members.some(m => m.userId === userId);
    if (group.isPrivate && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Calculate points based on league filter
    const leaderboard = group.members.map(member => {
      const pointsByLeague = member.pointsByLeague as Record<string, number>;

      let points = 0;
      if (leagueId) {
        // Filter by specific league
        points = pointsByLeague[leagueId.toString()] || 0;
      } else if (group.leagueId) {
        // Public group - use group's league
        points = pointsByLeague[group.leagueId.toString()] || 0;
      } else {
        // Cross-league private group - sum all leagues
        points = Object.values(pointsByLeague).reduce((sum, p) => sum + (p || 0), 0);
      }

      return {
        userId: member.user.id,
        username: member.user.username,
        email: member.user.email,
        avatar: member.user.avatar,
        points,
        role: member.role,
        joinedAt: member.joinedAt
      };
    });

    // Sort by points and add ranks
    leaderboard.sort((a, b) => b.points - a.points);
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.json({
      success: true,
      data: rankedLeaderboard
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Find group by join code
export const findGroupByCode = async (req: Request, res: Response) => {
  try {
    const { joinCode } = req.params;

    const group = await prisma.group.findUnique({
      where: { joinCode },
      include: {
        league: true,
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found with this join code'
      });
    }

    // Only show private groups info
    if (!group.isPrivate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid join code'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Join a group (with join code for private groups)
export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { joinCode } = req.body;
    const userId = (req as any).userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: parseInt(id),
          userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Check max members
    if (group._count.members >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Group is full'
      });
    }

    // Verify join code for private groups
    if (group.isPrivate && group.joinCode !== joinCode) {
      return res.status(403).json({
        success: false,
        message: 'Invalid join code'
      });
    }

    // Add user to group
    const member = await prisma.groupMember.create({
      data: {
        groupId: parseInt(id),
        userId,
        role: 'MEMBER'
      }
    });

    res.status(201).json({
      success: true,
      data: member,
      message: 'Successfully joined the group'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Leave a group
export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Cannot leave public groups
    if (group.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave public groups'
      });
    }

    // Cannot leave if owner
    if (group.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Group owner cannot leave. Please delete the group or transfer ownership first.'
      });
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: parseInt(id),
          userId
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update group - only basic fields (owner only)
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { name, description, maxMembers } = req.body;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
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
        message: 'Only the group owner can update the group'
      });
    }

    // Cannot update public groups
    if (group.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update public groups'
      });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(maxMembers && { maxMembers })
      },
      include: {
        league: true,
        owner: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedGroup
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Regenerate join code (owner only)
export const regenerateJoinCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
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
        message: 'Only the group owner can regenerate the join code'
      });
    }

    if (group.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Public groups do not have join codes'
      });
    }

    // Generate new code
    const newJoinCode = `${group.name.substring(0, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id) },
      data: { joinCode: newJoinCode }
    });

    res.json({
      success: true,
      data: { joinCode: updatedGroup.joinCode }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete group (owner only)
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const group = await prisma.group.findUnique({
      where: { id: parseInt(id) }
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
        message: 'Only the group owner can delete the group'
      });
    }

    // Cannot delete public groups
    if (group.isPublic) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete public groups'
      });
    }

    await prisma.group.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Auto-join user to public group (used internally)
export const autoJoinPublicGroup = async (userId: number, leagueId: number) => {
  try {
    const publicGroup = await prisma.group.findFirst({
      where: {
        isPublic: true,
        leagueId
      }
    });

    if (!publicGroup) {
      console.warn(`No public group found for league ${leagueId}`);
      return;
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: publicGroup.id,
          userId
        }
      }
    });

    if (existingMember) {
      return; // Already a member
    }

    // Add user to public group
    await prisma.groupMember.create({
      data: {
        groupId: publicGroup.id,
        userId,
        role: 'MEMBER'
      }
    });

    console.log(`User ${userId} auto-joined public group ${publicGroup.name}`);
  } catch (error) {
    console.error('Error auto-joining public group:', error);
  }
};
