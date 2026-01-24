"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentBlogs, BlogPostDTO } from '../../lib/blogs';

export default function BlogPreviewSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecentBlogs();
        setBlogPosts(data);
      } catch (err) {
        setError('Failed to load recent blog posts');
        console.error('Error loading blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadBlogs();
  }, []);

  const handleRetry = () => {
    const loadBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecentBlogs();
        setBlogPosts(data);
      } catch (err) {
        setError('Failed to load recent blog posts');
      } finally {
        setLoading(false);
      }
    };
    
    loadBlogs();
  };

  return (
    <section id="blog" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Legal Insights & AI Trends
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest developments in legal technology and AI-powered document analysis
          </p>
        </div>
        
        {error && (
          <div className="text-center mb-8 p-4 bg-red-50 rounded-lg max-w-2xl mx-auto">
            <p className="text-red-600 mb-3">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="animate-pulse">
                  <div className="h-6 w-24 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {blogPosts.slice(0, 3).map((post, index) => (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 flex justify-between items-center">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    {post.author || 'Blog'}
                  </span>
                  <div className="text-xs text-gray-500">
                    {post.readTime ? `${post.readTime} min read` : ''}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  <time dateTime={post.createdAt || ''}>
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    }) : '-'}
                  </time>
                  <Link 
                    href={`/blog/${post.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
                  >
                    Read more
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
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