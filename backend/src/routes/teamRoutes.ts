import { Router } from 'express';
import { getTeamsByLeague } from '../controllers/leagueController';
import prisma from '../config/database';

const router = Router();

// Get all teams (optionally filtered by leagueId)
router.get('/', async (req, res) => {
  try {
    const { leagueId } = req.query;

    const teams = await prisma.team.findMany({
      where: leagueId ? {
        leagues: {
          some: {
            leagueId: parseInt(leagueId as string),
            isActive: true
          }
        }
      } : undefined,
      include: {
        leagues: {
          where: { isActive: true },
          include: {
            league: {
              select: {
                id: true,
                name: true,
                logoUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/league/:leagueId', getTeamsByLeague);

export default router;
