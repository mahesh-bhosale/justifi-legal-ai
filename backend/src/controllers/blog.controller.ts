import { Request, Response } from 'express';
import { blogService, CreateBlogPostData, UpdateBlogPostData, BlogPostFilters } from '../services/blog.service';

export class BlogController {
  /**
   * Create a new blog post
   * POST /api/blogs
   */
  async createBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const { title, excerpt, content, author, readTime } = req.body;

      // Validate request body
      if (!title || typeof title !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Title is required and must be a string'
        });
        return;
      }

      const blogData: CreateBlogPostData = {
        title,
        excerpt,
        content,
        author,
        readTime: readTime ? parseInt(readTime) : undefined
      };

      const newBlogPost = await blogService.createBlogPost(blogData);

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: newBlogPost
      });
    } catch (error) {
      console.error('Error creating blog post:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get all blog posts with optional filtering
   * GET /api/blogs
   */
  async getBlogPosts(req: Request, res: Response): Promise<void> {
    try {
      const { search, author, limit, offset } = req.query;

      const filters: BlogPostFilters = {
        search: search as string,
        author: author as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };

      const result = await blogService.getBlogPosts(filters);

      res.status(200).json({
        success: true,
        message: 'Blog posts retrieved successfully',
        data: {
          posts: result.posts,
          total: result.total,
          limit: filters.limit || 10,
          offset: filters.offset || 0
        }
      });
    } catch (error) {
      console.error('Error retrieving blog posts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get a single blog post by ID
   * GET /api/blogs/:id
   */
  async getBlogPostById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const blogId = parseInt(id);

      if (isNaN(blogId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blog post ID'
        });
        return;
      }

      const blogPost = await blogService.getBlogPostById(blogId);

      if (!blogPost) {
        res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog post retrieved successfully',
        data: blogPost
      });
    } catch (error) {
      console.error('Error retrieving blog post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get a single blog post by slug
   * GET /api/blogs/slug/:slug
   */
  async getBlogPostBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug || typeof slug !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Valid slug is required'
        });
        return;
      }

      const blogPost = await blogService.getBlogPostBySlug(slug);

      if (!blogPost) {
        res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog post retrieved successfully',
        data: blogPost
      });
    } catch (error) {
      console.error('Error retrieving blog post by slug:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Update a blog post
   * PUT /api/blogs/:id
   */
  async updateBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, excerpt, content, author, readTime } = req.body;
      const blogId = parseInt(id);

      if (isNaN(blogId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blog post ID'
        });
        return;
      }

      const updateData: UpdateBlogPostData = {
        title,
        excerpt,
        content,
        author,
        readTime: readTime ? parseInt(readTime) : undefined
      };

      const updatedBlogPost = await blogService.updateBlogPost(blogId, updateData);

      if (!updatedBlogPost) {
        res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog post updated successfully',
        data: updatedBlogPost
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Delete a blog post
   * DELETE /api/blogs/:id
   */
  async deleteBlogPost(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const blogId = parseInt(id);

      if (isNaN(blogId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blog post ID'
        });
        return;
      }

      const deleted = await blogService.deleteBlogPost(blogId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get recent blog posts
   * GET /api/blogs/recent
   */
  async getRecentBlogPosts(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const postLimit = limit ? parseInt(limit as string) : 5;

      const recentPosts = await blogService.getRecentBlogPosts(postLimit);

      res.status(200).json({
        success: true,
        message: 'Recent blog posts retrieved successfully',
        data: recentPosts
      });
    } catch (error) {
      console.error('Error retrieving recent blog posts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Get blog posts by author
   * GET /api/blogs/author/:author
   */
  async getBlogPostsByAuthor(req: Request, res: Response): Promise<void> {
    try {
      const { author } = req.params;
      const { limit, offset } = req.query;

      if (!author || typeof author !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Valid author is required'
        });
        return;
      }

      const result = await blogService.getBlogPostsByAuthor(
        author,
        limit ? parseInt(limit as string) : 10,
        offset ? parseInt(offset as string) : 0
      );

      res.status(200).json({
        success: true,
        message: 'Blog posts by author retrieved successfully',
        data: {
          posts: result.posts,
          total: result.total,
          author
        }
      });
    } catch (error) {
      console.error('Error retrieving blog posts by author:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export const blogController = new BlogController();
