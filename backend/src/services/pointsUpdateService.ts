import prisma from '../config/database';

export class PointsUpdateService {
  /**
   * Update group points for a user after they earn points from a prediction
   * This is called whenever a prediction is scored
   */
  async updateGroupPoints(userId: number, leagueId: number, pointsEarned: number, weekNumber?: number): Promise<void> {
    try {
      // Get all groups user is member of
      const memberships = await prisma.groupMember.findMany({
        where: { userId },
        include: { group: true }
      });

      for (const membership of memberships) {
        const group = membership.group;

        // Determine if points should be added to this group
        let shouldAddPoints = false;

        if (group.isPublic) {
          // Public groups: only add points if league matches
          shouldAddPoints = group.leagueId === leagueId;
        } else {
          // Private groups
          if (group.leagueId) {
            // League-specific private group
            shouldAddPoints = group.leagueId === leagueId;
          } else {
            // Cross-league private group (leagueId is null)
            shouldAddPoints = true;
          }
        }

        if (shouldAddPoints) {
          await this.addPointsToMember(membership.id, leagueId, pointsEarned, weekNumber);
        }
      }
    } catch (error) {
      console.error('Error updating group points:', error);
      throw error;
    }
  }

  /**
   * Add points to a specific group member for a specific league
   */
  private async addPointsToMember(membershipId: number, leagueId: number, points: number, weekNumber?: number): Promise<void> {
    try {
      const member = await prisma.groupMember.findUnique({
        where: { id: membershipId }
      });

      if (!member) {
        console.warn(`GroupMember ${membershipId} not found`);
        return;
      }

      // Get current pointsByLeague
      const pointsByLeague = (member.pointsByLeague as Record<string, number>) || {};
      const leagueKey = leagueId.toString();

      // Add points for this league
      pointsByLeague[leagueKey] = (pointsByLeague[leagueKey] || 0) + points;

      // Calculate new total points (sum of all leagues)
      const totalPoints = Object.values(pointsByLeague).reduce((sum, p) => sum + (p || 0), 0);

      // Update gameweek-specific points if weekNumber is provided
      const pointsByGameweek = (member.pointsByGameweek as Record<string, Record<string, number>>) || {};
      if (weekNumber !== undefined && weekNumber !== null) {
        if (!pointsByGameweek[leagueKey]) {
          pointsByGameweek[leagueKey] = {};
        }
        const weekKey = weekNumber.toString();
        pointsByGameweek[leagueKey][weekKey] = (pointsByGameweek[leagueKey][weekKey] || 0) + points;
      }

      // Update member
      await prisma.groupMember.update({
        where: { id: membershipId },
        data: {
          pointsByLeague,
          pointsByGameweek,
          totalPoints
        }
      });
    } catch (error) {
      console.error('Error adding points to member:', error);
      throw error;
    }
  }

  /**
   * Recalculate all group points for a user from their historical predictions
   * Used when a user joins a new group or when recalculating points
   */
  async recalculateUserGroupPoints(userId: number, groupId: number): Promise<void> {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      if (!group) {
        throw new Error('Group not found');
      }

      // Build query for predictions
      const whereClause: any = {
        userId,
        isProcessed: true,
        match: {}
      };

      // Filter by league if group is league-specific
      if (group.leagueId) {
        whereClause.match.leagueId = group.leagueId;
      }

      // Filter by allowed teams if specified
      if (group.allowedTeamIds && group.allowedTeamIds.length > 0) {
        whereClause.match.OR = [
          { homeTeamId: { in: group.allowedTeamIds } },
          { awayTeamId: { in: group.allowedTeamIds } }
        ];
      }

      // Get all relevant predictions
      const predictions = await prisma.prediction.findMany({
        where: whereClause,
        include: {
          match: {
            select: {
              leagueId: true,
              weekNumber: true
            }
          }
        }
      });

      // Group points by league and by gameweek
      const pointsByLeague: Record<string, number> = {};
      const pointsByGameweek: Record<string, Record<string, number>> = {};

      for (const prediction of predictions) {
        const leagueKey = prediction.match.leagueId.toString();
        const weekNumber = prediction.match.weekNumber;

        // Accumulate league totals
        pointsByLeague[leagueKey] = (pointsByLeague[leagueKey] || 0) + prediction.totalPoints;

        // Accumulate gameweek totals
        if (weekNumber !== null && weekNumber !== undefined) {
          if (!pointsByGameweek[leagueKey]) {
            pointsByGameweek[leagueKey] = {};
          }
          const weekKey = weekNumber.toString();
          pointsByGameweek[leagueKey][weekKey] = (pointsByGameweek[leagueKey][weekKey] || 0) + prediction.totalPoints;
        }
      }

      // Calculate total
      const totalPoints = Object.values(pointsByLeague).reduce((sum, p) => sum + (p || 0), 0);

      // Update group member
      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      });

      if (membership) {
        await prisma.groupMember.update({
          where: { id: membership.id },
          data: {
            pointsByLeague,
            pointsByGameweek,
            totalPoints
          }
        });

        console.log(`Recalculated points for user ${userId} in group ${groupId}: ${totalPoints} total points`);
      }
    } catch (error) {
      console.error('Error recalculating user group points:', error);
      throw error;
    }
  }

  /**
   * Recalculate points for all members of a group
   * Useful after changing group settings (teams, league, etc.)
   */
  async recalculateGroupPoints(groupId: number): Promise<void> {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: true
        }
      });

      if (!group) {
        throw new Error('Group not found');
      }

      console.log(`Recalculating points for ${group.members.length} members in group ${group.name}`);

      // First, fix any unprocessed predictions with points
      await this.fixUnprocessedPredictions(groupId);

      for (const member of group.members) {
        await this.recalculateUserGroupPoints(member.userId, groupId);
      }

      console.log(`Completed recalculation for group ${group.name}`);
    } catch (error) {
      console.error('Error recalculating group points:', error);
      throw error;
    }
  }

  /**
   * Fix unprocessed predictions that have points
   * This ensures predictions with scores are marked as processed
   */
  private async fixUnprocessedPredictions(groupId: number): Promise<void> {
    try {
      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      if (!group) {
        return;
      }

      // Build where clause for this group's predictions
      const whereClause: any = {
        isProcessed: false,
        match: {
          status: 'FINISHED'
        }
      };

      // Filter by league if group is league-specific
      if (group.leagueId) {
        whereClause.match.leagueId = group.leagueId;
      }

      // Update all unprocessed predictions for finished matches
      const result = await prisma.prediction.updateMany({
        where: whereClause,
        data: {
          isProcessed: true,
          status: 'COMPLETED'
        }
      });

      if (result.count > 0) {
        console.log(`  Fixed ${result.count} unprocessed predictions for group ${group.name}`);
      }
    } catch (error) {
      console.error('Error fixing unprocessed predictions:', error);
      // Don't throw - continue with recalculation
    }
  }

  /**
   * Recalculate points for all groups and all users
   * Use this after major changes or data migrations
   */
  async recalculateAllGroupPoints(): Promise<void> {
    try {
      console.log('Starting full group points recalculation...');

      // First, fix ALL unprocessed predictions globally
      console.log('\n🔄 Fixing unprocessed predictions for all leagues...');
      const fixResult = await prisma.prediction.updateMany({
        where: {
          isProcessed: false,
          match: {
            status: 'FINISHED'
          }
        },
        data: {
          isProcessed: true,
          status: 'COMPLETED'
        }
      });

      if (fixResult.count > 0) {
        console.log(`✅ Fixed ${fixResult.count} unprocessed predictions globally\n`);
      }

      const groups = await prisma.group.findMany({
        include: {
          members: true
        }
      });

      console.log(`Found ${groups.length} groups`);

      for (const group of groups) {
        console.log(`\nProcessing group: ${group.name} (${group.members.length} members)`);
        await this.recalculateGroupPoints(group.id);
      }

      console.log('\n✅ Full recalculation completed');
    } catch (error) {
      console.error('Error recalculating all group points:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const pointsUpdateService = new PointsUpdateService();
