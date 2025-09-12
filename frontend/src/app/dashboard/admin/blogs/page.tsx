'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../../../components/Card';
import BlogForm from '../../../../components/BlogForm';
import Button from '../../../../components/Button';
import { listBlogs, createBlogPost, updateBlogPost, deleteBlogPost, type BlogPostDTO, type CreateBlogPostInput } from '../../../../lib/blogs';

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPostDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const blogsData = await listBlogs();
      setBlogs(blogsData);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = () => {
    setShowCreateForm(true);
    setEditingBlog(null);
  };

  const handleEditBlog = (blog: BlogPostDTO) => {
    setEditingBlog(blog);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingBlog(null);
  };

  const handleFormSubmit = async (data: CreateBlogPostInput) => {
    try {
      setSubmitting(true);
      if (editingBlog) {
        await updateBlogPost(editingBlog.id, data);
        console.log('Blog updated successfully');
      } else {
        await createBlogPost(data);
        console.log('Blog created successfully');
      }
      
      handleFormClose();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlog = async (blogId: number) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlogPost(blogId);
        console.log('Blog deleted successfully');
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create and manage platform blogs and legal content
          </p>
        </div>
        <Button onClick={handleCreateBlog} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <span className="sm:hidden">Create Blog</span>
          <span className="hidden sm:inline">Create New Blog</span>
        </Button>
      </div>

      {/* Blog Form Modal */}
      {showCreateForm && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingBlog ? 'Edit Blog' : 'Create New Blog'}
            </h3>
            <p className="text-gray-600">
              {editingBlog ? 'Update the blog post details below.' : 'Fill in the details for your new blog post.'}
            </p>
          </div>
          
          <BlogForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            initialData={editingBlog || undefined}
            mode={editingBlog ? 'edit' : 'create'}
            isSubmitting={submitting}
          />
        </Card>
      )}

      {/* Blogs List */}
      <Card className="p-6">
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first blog post.
            </p>
            <div className="mt-6">
              <Button onClick={handleCreateBlog} className="bg-blue-600 hover:bg-blue-700">
                Create Blog
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-4">
              {blogs.map((blog: BlogPostDTO) => (
                <div key={blog.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{blog.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>
                    </div>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      blog.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">By {blog.author}</span>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleEditBlog(blog)}
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteBlog(blog.id)}
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog: BlogPostDTO) => (
                    <tr key={blog.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{blog.excerpt}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {blog.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          blog.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditBlog(blog)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteBlog(blog.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
