import { Router } from 'express';
import { addReview, getReviews, markHelpful } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/:productId',             getReviews);           // Public
router.post('/:productId',    protect, addReview);            // Auth required
router.post('/:reviewId/helpful', protect, markHelpful);      // Auth required

export default router;
