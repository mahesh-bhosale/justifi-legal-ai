# Blog API Documentation

This document describes all the available blog API endpoints for the Justifi Legal AI backend.

## Base URL
```
http://localhost:3001/api/blogs
```

## Authentication
- **Public endpoints**: No authentication required
- **Protected endpoints**: Require JWT token in Authorization header
  ```
  Authorization: Bearer <your-jwt-token>
  ```

## Endpoints Overview

### Public Endpoints (No Auth Required)
- `GET /api/blogs` - Get all blog posts with filtering
- `GET /api/blogs/recent` - Get recent blog posts
- `GET /api/blogs/slug/:slug` - Get blog post by slug
- `GET /api/blogs/author/:author` - Get blog posts by author
- `GET /api/blogs/:id` - Get blog post by ID

### Protected Endpoints (Admin Only)
- `POST /api/blogs` - Create new blog post
- `PUT /api/blogs/:id` - Update blog post
- `DELETE /api/blogs/:id` - Delete blog post

---

## Public Endpoints

### 1. Get All Blog Posts
**GET** `/api/blogs`

Get all blog posts with optional filtering and pagination.

#### Query Parameters
- `search` (optional): Search in blog post titles
- `author` (optional): Filter by author name
- `limit` (optional): Number of posts per page (default: 10)
- `offset` (optional): Number of posts to skip (default: 0)

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/blogs?search=legal&limit=5&offset=0"
```

#### Example Response
```json
{
  "success": true,
  "message": "Blog posts retrieved successfully",
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Understanding Legal Rights in Digital Age",
        "slug": "understanding-legal-rights-digital-age",
        "excerpt": "A comprehensive guide to digital rights...",
        "content": "Full blog post content...",
        "author": "John Doe",
        "readTime": 5,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1,
    "limit": 5,
    "offset": 0
  }
}
```

---

### 2. Get Recent Blog Posts
**GET** `/api/blogs/recent`

Get the most recent blog posts.

#### Query Parameters
- `limit` (optional): Number of recent posts to return (default: 5)

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/blogs/recent?limit=3"
```

#### Example Response
```json
{
  "success": true,
  "message": "Recent blog posts retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Understanding Legal Rights in Digital Age",
      "slug": "understanding-legal-rights-digital-age",
      "excerpt": "A comprehensive guide to digital rights...",
      "content": "Full blog post content...",
      "author": "John Doe",
      "readTime": 5,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Blog Post by Slug
**GET** `/api/blogs/slug/:slug`

Get a specific blog post by its URL slug.

#### Path Parameters
- `slug`: The URL-friendly slug of the blog post

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/blogs/slug/understanding-legal-rights-digital-age"
```

#### Example Response
```json
{
  "success": true,
  "message": "Blog post retrieved successfully",
  "data": {
    "id": 1,
    "title": "Understanding Legal Rights in Digital Age",
    "slug": "understanding-legal-rights-digital-age",
    "excerpt": "A comprehensive guide to digital rights...",
    "content": "Full blog post content...",
    "author": "John Doe",
    "readTime": 5,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 4. Get Blog Posts by Author
**GET** `/api/blogs/author/:author`

Get all blog posts by a specific author.

#### Path Parameters
- `author`: The author's name

#### Query Parameters
- `limit` (optional): Number of posts per page (default: 10)
- `offset` (optional): Number of posts to skip (default: 0)

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/blogs/author/John%20Doe?limit=5"
```

#### Example Response
```json
{
  "success": true,
  "message": "Blog posts by author retrieved successfully",
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Understanding Legal Rights in Digital Age",
        "slug": "understanding-legal-rights-digital-age",
        "excerpt": "A comprehensive guide to digital rights...",
        "content": "Full blog post content...",
        "author": "John Doe",
        "readTime": 5,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1,
    "author": "John Doe"
  }
}
```

---

### 5. Get Blog Post by ID
**GET** `/api/blogs/:id`

Get a specific blog post by its ID.

#### Path Parameters
- `id`: The numeric ID of the blog post

#### Example Request
```bash
curl -X GET "http://localhost:3001/api/blogs/1"
```

#### Example Response
```json
{
  "success": true,
  "message": "Blog post retrieved successfully",
  "data": {
    "id": 1,
    "title": "Understanding Legal Rights in Digital Age",
    "slug": "understanding-legal-rights-digital-age",
    "excerpt": "A comprehensive guide to digital rights...",
    "content": "Full blog post content...",
    "author": "John Doe",
    "readTime": 5,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Protected Endpoints (Admin Only)

### 6. Create New Blog Post
**POST** `/api/blogs`

Create a new blog post. Requires admin authentication.

#### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "New Blog Post Title",
  "excerpt": "Brief description of the blog post",
  "content": "Full content of the blog post...",
  "author": "Author Name",
  "readTime": 5
}
```

#### Required Fields
- `title`: Blog post title (string, max 255 characters)

#### Optional Fields
- `excerpt`: Brief description (string)
- `content`: Full blog content (string)
- `author`: Author name (string, max 100 characters)
- `readTime`: Estimated reading time in minutes (number)

#### Example Request
```bash
curl -X POST "http://localhost:3001/api/blogs" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI in Legal Practice: Opportunities and Challenges",
    "excerpt": "Exploring the impact of artificial intelligence on legal practice",
    "content": "Full blog post content here...",
    "author": "Jane Smith",
    "readTime": 8
  }'
```

#### Example Response
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "data": {
    "id": 2,
    "title": "AI in Legal Practice: Opportunities and Challenges",
    "slug": "ai-in-legal-practice-opportunities-and-challenges",
    "excerpt": "Exploring the impact of artificial intelligence on legal practice",
    "content": "Full blog post content here...",
    "author": "Jane Smith",
    "readTime": 8,
    "createdAt": "2024-01-16T14:20:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

---

### 7. Update Blog Post
**PUT** `/api/blogs/:id`

Update an existing blog post. Requires admin authentication.

#### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

#### Path Parameters
- `id`: The numeric ID of the blog post to update

#### Request Body
```json
{
  "title": "Updated Blog Post Title",
  "excerpt": "Updated excerpt",
  "content": "Updated content...",
  "author": "Updated Author",
  "readTime": 10
}
```

#### All Fields Optional
- `title`: Blog post title (string, max 255 characters)
- `excerpt`: Brief description (string)
- `content`: Full blog content (string)
- `author`: Author name (string, max 100 characters)
- `readTime`: Estimated reading time in minutes (number)

#### Example Request
```bash
curl -X PUT "http://localhost:3001/api/blogs/1" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Legal Rights Guide",
    "readTime": 7
  }'
```

#### Example Response
```json
{
  "success": true,
  "message": "Blog post updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Legal Rights Guide",
    "slug": "updated-legal-rights-guide",
    "excerpt": "A comprehensive guide to digital rights...",
    "content": "Full blog post content...",
    "author": "John Doe",
    "readTime": 7,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T15:45:00Z"
  }
}
```

---

### 8. Delete Blog Post
**DELETE** `/api/blogs/:id`

Delete a blog post. Requires admin authentication.

#### Headers
```
Authorization: Bearer <your-jwt-token>
```

#### Path Parameters
- `id`: The numeric ID of the blog post to delete

#### Example Request
```bash
curl -X DELETE "http://localhost:3001/api/blogs/1" \
  -H "Authorization: Bearer your-jwt-token"
```

#### Example Response
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title is required and must be a string"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is missing or invalid"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Blog post not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Features

### Automatic Slug Generation
- Slugs are automatically generated from the title
- Special characters are removed and spaces are replaced with hyphens
- Duplicate slugs are handled by appending a number (e.g., `title-1`, `title-2`)

### Validation
- Title is required and must be less than 255 characters
- Author name is limited to 100 characters
- Read time must be a positive number

### Pagination
- All list endpoints support pagination with `limit` and `offset` parameters
- Default limit is 10 items per page

### Search and Filtering
- Search functionality on blog post titles
- Filter by author name
- Get recent posts with customizable limit

### Timestamps
- `createdAt` and `updatedAt` are automatically managed
- `updatedAt` is automatically updated when a post is modified

---

## Testing the API

You can test these endpoints using tools like:
- **Postman**
- **cURL** (examples provided above)
- **Insomnia**
- **Thunder Client** (VS Code extension)

### Getting an Admin Token
To test protected endpoints, you'll need to:
1. Register/login as an admin user
2. Get the JWT token from the auth response
3. Include the token in the Authorization header

### Sample Test Data
```json
{
  "title": "Test Blog Post",
  "excerpt": "This is a test blog post excerpt",
  "content": "This is the full content of the test blog post.",
  "author": "Test Author",
  "readTime": 3
}
```
