import { db } from '../db';
import { blogPosts, BlogPost, NewBlogPost } from '../models/schema';
import { eq, desc, like, and } from 'drizzle-orm';

export interface CreateBlogPostData {
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  readTime?: number;
}

export interface UpdateBlogPostData {
  title?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  readTime?: number;
}

export interface BlogPostFilters {
  search?: string;
  author?: string;
  limit?: number;
  offset?: number;
}

export class BlogService {
  /**
   * Generate a URL-friendly slug from a title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Check if a slug already exists
   */
  private async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const query = excludeId 
      ? and(eq(blogPosts.slug, slug), eq(blogPosts.id, excludeId))
      : eq(blogPosts.slug, slug);
    
    const existing = await db.select().from(blogPosts).where(query);
    return existing.length > 0;
  }

  /**
   * Generate a unique slug
   */
  private async generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
    let slug = this.generateSlug(title);
    let counter = 1;
    let uniqueSlug = slug;

    while (await this.slugExists(uniqueSlug, excludeId)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  /**
   * Create a new blog post
   */
  async createBlogPost(data: CreateBlogPostData): Promise<BlogPost> {
    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (data.title.length > 255) {
      throw new Error('Title must be less than 255 characters');
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(data.title);

    // Prepare blog post data
    const blogPostData: NewBlogPost = {
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt?.trim() || null,
      content: data.content?.trim() || null,
      author: data.author?.trim() || null,
      readTime: data.readTime || null,
    };

    // Insert into database
    const [newBlogPost] = await db.insert(blogPosts).values(blogPostData).returning();
    return newBlogPost;
  }

  /**
   * Get all blog posts with optional filtering
   */
  async getBlogPosts(filters: BlogPostFilters = {}): Promise<{ posts: BlogPost[]; total: number }> {
    const { search, author, limit = 10, offset = 0 } = filters;

    // Build where conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        like(blogPosts.title, `%${search}%`)
      );
    }
    
    if (author) {
      conditions.push(eq(blogPosts.author, author));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: blogPosts.id })
      .from(blogPosts)
      .where(whereClause);
    
    const total = countResult.length;

    // Get posts with pagination
    const posts = await db
      .select()
      .from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return { posts, total };
  }

  /**
   * Get a single blog post by ID
   */
  async getBlogPostById(id: number): Promise<BlogPost | null> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    
    return post || null;
  }

  /**
   * Get a single blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));
    
    return post || null;
  }

  /**
   * Update a blog post
   */
  async updateBlogPost(id: number, data: UpdateBlogPostData): Promise<BlogPost | null> {
    // Check if blog post exists
    const existingPost = await this.getBlogPostById(id);
    if (!existingPost) {
      return null;
    }

    // Validate title if provided
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Title cannot be empty');
      }
      if (data.title.length > 255) {
        throw new Error('Title must be less than 255 characters');
      }
    }

    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (data.title && data.title !== existingPost.title) {
      slug = await this.generateUniqueSlug(data.title, id);
    }

    // Prepare update data
    const updateData: Partial<NewBlogPost> = {
      ...(data.title && { title: data.title.trim() }),
      ...(data.title && { slug }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt?.trim() || null }),
      ...(data.content !== undefined && { content: data.content?.trim() || null }),
      ...(data.author !== undefined && { author: data.author?.trim() || null }),
      ...(data.readTime !== undefined && { readTime: data.readTime || null }),
    };

    // Update in database
    const [updatedPost] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();

    return updatedPost || null;
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(id: number): Promise<boolean> {
    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    
    return !!deletedPost;
  }

  /**
   * Get recent blog posts
   */
  async getRecentBlogPosts(limit: number = 5): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit);
  }

  /**
   * Get blog posts by author
   */
  async getBlogPostsByAuthor(author: string, limit: number = 10, offset: number = 0): Promise<{ posts: BlogPost[]; total: number }> {
    const countResult = await db
      .select({ count: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.author, author));
    
    const total = countResult.length;

    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.author, author))
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return { posts, total };
  }
}

export const blogService = new BlogService();
