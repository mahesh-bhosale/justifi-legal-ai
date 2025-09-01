import { Router } from 'express';
import { blogController } from '../controllers/blog.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/', blogController.getBlogPosts);
router.get('/recent', blogController.getRecentBlogPosts);
router.get('/slug/:slug', blogController.getBlogPostBySlug);
router.get('/author/:author', blogController.getBlogPostsByAuthor);
router.get('/:id', blogController.getBlogPostById);

// Protected routes (admin only)
router.post('/', 
  verifyToken, 
  requireRole(['admin']), 
  blogController.createBlogPost
);

router.put('/:id', 
  verifyToken, 
  requireRole(['admin']), 
  blogController.updateBlogPost
);

router.delete('/:id', 
  verifyToken, 
  requireRole(['admin']), 
  blogController.deleteBlogPost
);

export default router;
