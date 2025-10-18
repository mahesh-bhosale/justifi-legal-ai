// /frontend/app/blog/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getBlogById, BlogPostDTO } from '../../../lib/blogs';

export default function BlogDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [blogPost, setBlogPost] = useState<BlogPostDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBlogById(Number(id));
        setBlogPost(data);
      } catch (err) {
        setError('Failed to load blog post');
        console.error('Error loading blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadBlogPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 w-1/4 bg-gray-200 rounded mb-12"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error || 'Blog post not found'}</p>
          <Link 
            href="/blog"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        <article className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="mb-6 flex justify-between items-center">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {blogPost.author || 'Unknown Author'}
            </span>
            <div className="text-sm text-gray-500">
              {blogPost.readTime ? `${blogPost.readTime} min read` : ''}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {blogPost.title}
          </h1>
          
          <time className="text-gray-500 text-sm mb-8 block" dateTime={blogPost.createdAt || ''}>
            {blogPost.createdAt ? new Date(blogPost.createdAt).toLocaleDateString('en-IN', { 
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
            }) : 'Unknown date'}
          </time>
          
          {blogPost.content && (
            <div 
              className="prose max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          )}
          
          {!blogPost.content && blogPost.excerpt && (
            <p className="text-gray-600 leading-relaxed">
              {blogPost.excerpt}
            </p>
          )}
        </article>
      </div>
    </div>
  );
}