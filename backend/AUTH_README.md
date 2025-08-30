# JWT Authentication & Role-based Access Control

This backend implements a complete JWT authentication system with role-based access control using Node.js, TypeScript, Express, and Drizzle ORM.

## 🚀 Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with 12 salt rounds
- **Role-based Access Control**: Citizen and Lawyer roles
- **Input Validation**: Zod schema validation
- **Error Handling**: Comprehensive HTTP error responses
- **TypeScript**: Full type safety throughout the system

## 📁 Project Structure

```
src/
├── models/
│   └── schema.ts          # Database schema and types
├── services/
│   └── auth.service.ts    # Business logic for authentication
├── controllers/
│   └── auth.controller.ts # HTTP request handlers
├── routes/
│   ├── auth.routes.ts     # Authentication endpoints
│   └── protected.routes.ts # Protected route examples
├── middleware/
│   ├── auth.middleware.ts # JWT verification
│   └── role.middleware.ts # Role-based access control
├── utils/
│   ├── jwt.ts            # JWT utilities
│   └── validation.ts     # Input validation schemas
├── db/
│   └── index.ts          # Database connection
├── app.ts                # Express app configuration
└── server.ts             # Server startup
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
```

## 🗄️ Database Setup

Run the SQL script to create the users table:

```bash
# Execute the SQL script in your database
psql -d your_database -f scripts/create-users-table.sql
```

Or use Drizzle migrations if configured.

## 🚀 API Endpoints

### Authentication Endpoints

#### POST /auth/signup
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "citizen"  // Optional, defaults to "citizen"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "citizen",
      "verified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "citizen",
      "verified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Protected Endpoints

All protected endpoints require the `Authorization: Bearer <token>` header.

#### GET /api/profile
Access user profile (any authenticated user).

#### GET /api/lawyer-dashboard
Lawyer-specific dashboard (lawyer role required).

#### GET /api/citizen-dashboard
Citizen-specific dashboard (citizen role required).

#### GET /api/admin-panel
Admin panel (lawyer role required).

## 🛡️ Middleware Usage

### Authentication Middleware

```typescript
import { verifyToken } from '../middleware/auth.middleware.js';

// Protect a route
router.get('/protected', verifyToken, (req, res) => {
  // req.user contains the decoded JWT payload
  res.json({ user: req.user });
});
```

### Role-based Access Control

```typescript
import { requireLawyer, requireCitizen, requireRole } from '../middleware/role.middleware.js';

// Require specific role
router.get('/lawyer-only', verifyToken, requireLawyer, (req, res) => {
  res.json({ message: 'Lawyer access granted' });
});

// Require multiple roles
router.get('/admin', verifyToken, requireRole(['lawyer']), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Expiration**: Configurable token expiration
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error messages
- **Role Verification**: Database-level role validation

## 🧪 Testing

### Test User Signup
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "citizen"
  }'
```

### Test User Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Route
```bash
# Replace <token> with the JWT from login/signup
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer <token>"
```

## 🚀 Running the Project

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📝 Error Codes

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **409**: Conflict (duplicate email)
- **500**: Internal Server Error

## 🔧 Customization

### Adding New Roles
1. Update `userRoles` array in `src/models/schema.ts`
2. Add new role-specific middleware functions
3. Update validation schemas if needed

### Changing Password Requirements
Modify the password validation in `src/utils/validation.ts`:

```typescript
password: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
```

### JWT Configuration
Adjust JWT settings in `src/utils/jwt.ts` and environment variables.

## 🚨 Security Notes

- Keep `JWT_SECRET` secure and unique
- Use HTTPS in production
- Implement rate limiting for auth endpoints
- Consider adding refresh tokens for long sessions
- Regularly rotate JWT secrets
- Validate all inputs thoroughly
