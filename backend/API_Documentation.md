# Justifi Legal AI - API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [AI Services](#ai-services)
3. [Blog Management](#blog-management)
4. [Case Management](#case-management)
5. [Document Management](#document-management)
6. [Lawyer Profiles](#lawyer-profiles)
7. [Lawyer Search](#lawyer-search)
8. [Messaging](#messaging)
9. [Proposals](#proposals)
10. [Error Handling](#error-handling)

## Authentication

### Sign Up
- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe",
    "role": "citizen"
  }
  ```
- **Success Response**: `201 Created`
- **Error Responses**:
  - `400 Bad Request`: Invalid input data
  - `409 Conflict`: Email already registered

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user and get access token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "token": "jwt.token.here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "citizen"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials

## AI Services

### Summarize Text
- **URL**: `/api/ai/summarize/text`
- **Method**: `POST`
- **Authentication**: Required (JWT Token)
- **Request Body**:
  ```json
  {
    "text": "Long legal document text...",
    "maxLength": 500
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "summary": "Summarized text...",
    "originalLength": 2500,
    "summaryLength": 450
  }
  ```

### Summarize PDF
- **URL**: `/api/ai/summarize/pdf`
- **Method**: `POST`
- **Authentication**: Required (JWT Token)
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: PDF file to summarize
  - `maxLength`: (optional) Maximum length of summary
- **Success Response**: `200 OK` (Same as text summarization)

### Ask Question about Text
- **URL**: `/api/ai/ask/text`
- **Method**: `POST`
- **Authentication**: Required (JWT Token)
- **Request Body**:
  ```json
  {
    "text": "Legal document text...",
    "question": "What are the key points?"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "answer": "The key points are...",
    "confidence": 0.95
  }
  ```

## Blog Management

### Get All Blog Posts
- **URL**: `/api/blog`
- **Method**: `GET`
- **Authentication**: Not required
- **Query Parameters**:
  - `limit`: Number of posts to return (default: 10)
  - `offset`: Number of posts to skip (default: 0)
  - `category`: Filter by category
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "post-id",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "excerpt": "Short excerpt...",
      "author": "Author Name",
      "publishedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
  ```

### Create Blog Post (Admin Only)
- **URL**: `/api/blog`
- **Method**: `POST`
- **Authentication**: Required (Admin role)
- **Request Body**:
  ```json
  {
    "title": "New Blog Post",
    "content": "Blog post content...",
    "excerpt": "Short excerpt...",
    "category": "Legal Tips",
    "isPublished": true
  }
  ```
- **Success Response**: `201 Created`

## Case Management

### Create Case
- **URL**: `/api/cases`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "title": "Case Title",
    "description": "Case description...",
    "category": "Family Law",
    "priority": "high"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "case-id",
    "status": "open",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

### Get Case by ID
- **URL**: `/api/cases/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Success Response**: `200 OK`
  ```json
  {
    "id": "case-id",
    "title": "Case Title",
    "description": "Case description...",
    "status": "open",
    "clientId": "user-id",
    "lawyerId": "lawyer-id",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

## Document Management

### Upload Document
- **URL**: `/api/documents/cases/:caseId/documents`
- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: Document file to upload
  - `description`: (optional) Document description
- **Success Response**: `201 Created`
  ```json
  {
    "id": "doc-id",
    "name": "document.pdf",
    "size": 1024,
    "url": "/uploads/documents/document.pdf"
  }
  ```

## Lawyer Profiles

### Get Lawyer Profiles
- **URL**: `/api/lawyer-profiles`
- **Method**: `GET`
- **Authentication**: Not required
- **Query Parameters**:
  - `specialization`: Filter by specialization
  - `location`: Filter by location
  - `rating`: Minimum rating (1-5)
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": "profile-id",
      "userId": "user-id",
      "name": "Lawyer Name",
      "specializations": ["Family Law", "Criminal Law"],
      "rating": 4.8,
      "verified": true
    }
  ]
  ```

## Messaging

### Send Message
- **URL**: `/api/messages/cases/:caseId/messages`
- **Method**: `POST`
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "content": "Hello, I have a question about my case.",
    "attachments": ["doc-id-1", "doc-id-2"]
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "message-id",
    "content": "Hello, I have a question about my case.",
    "senderId": "user-id",
    "caseId": "case-id",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

## Proposals

### Create Proposal
- **URL**: `/api/proposals/cases/:caseId/proposals`
- **Method**: `POST`
- **Authentication**: Required (Lawyer role)
- **Request Body**:
  ```json
  {
    "fee": 5000,
    "proposal": "I can help with your case...",
    "timeline": "2-3 weeks"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": "proposal-id",
    "status": "pending",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

## Error Handling

### Error Responses
All error responses follow the same format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_CREDENTIALS`: Invalid email or password
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

### Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `500 Internal Server Error`: Server error

## Rate Limiting
- All authenticated endpoints are rate limited to 100 requests per minute per IP address.
- Public endpoints are limited to 30 requests per minute per IP address.

## Authentication
- Include the JWT token in the `Authorization` header:
  ```
  Authorization: Bearer your.jwt.token.here
  ```
- Tokens expire after 24 hours. Use the refresh token to obtain a new access token.

## Versioning
- API versioning is handled through the URL path (e.g., `/api/v1/endpoint`).
- The current API version is `v1`.

## Support
For support, please contact support@justifilegalai.com
