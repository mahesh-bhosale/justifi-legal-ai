"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentBlogs, BlogPostDTO } from '../../lib/blogs';

export default function BlogPreviewSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecentBlogs();
        setBlogPosts(data);
      } catch {
        setError('Failed to load recent blog posts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="blog" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Legal Insights & AI Trends
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest developments in legal technology and AI-powered document analysis
          </p>
        </div>
        
        {error && (
          <div className="text-center text-red-600 mb-6">{error}</div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {post.author || 'Blog'}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <time dateTime={post.createdAt || ''}>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    }) : '-'}
                  </time>
                  <span>{post.readTime ? `${post.readTime} min read` : ''}</span>
                </div>
              </article>
            ))}
          </div>
        )}
        
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View All Articles
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
