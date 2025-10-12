import { Router } from 'express';
import {
  getAllPointsRules,
  getPointsRuleById,
  updatePointsRule
} from '../controllers/pointsRuleController';

const router = Router();

router.get('/', getAllPointsRules);
router.get('/:id', getPointsRuleById);
router.put('/:id', updatePointsRule); // Admin endpoint

export default router;
