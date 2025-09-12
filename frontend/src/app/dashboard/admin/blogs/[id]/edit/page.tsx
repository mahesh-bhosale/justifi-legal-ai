'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BlogForm from '../../../../../../components/BlogForm';
import { getBlogById, updateBlogPost } from '../../../../../../lib/blogs';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: number;
}

// Removed dummy data; will fetch from API

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blogData, setBlogData] = useState<BlogFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const blogId = parseInt(params.id as string);

  useEffect(() => {
    const fetchBlogData = async () => {
      setIsLoading(true);
      try {
        const data = await getBlogById(blogId);
        if (data) {
          const mapped: BlogFormData = {
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt || '',
            content: data.content || '',
            author: data.author || '',
            readTime: data.readTime || 0,
          };
          setBlogData(mapped);
        } else {
          // Blog not found
          router.push('/dashboard/admin/blogs');
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
        router.push('/dashboard/admin/blogs');
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlogData();
    }
  }, [blogId, router]);

  const handleSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    
    try {
      await updateBlogPost(blogId, data);
      router.push('/dashboard/admin/blogs');
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert('Failed to update blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/admin/blogs');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-full md:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-full md:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Blog post not found</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={handleCancel}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
            >
              Back to Blog List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full md:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleCancel}
              className="self-start p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Blog Post</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Update your blog post content and settings</p>
            </div>
          </div>
        </div>

        <BlogForm
          mode="edit"
          initialData={blogData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
