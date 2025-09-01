# Lawyer Profile System

A complete lawyer profile management system for the Justifi Legal AI platform that allows lawyers to create detailed professional profiles and citizens to search and connect with legal experts.

## 🏗️ System Architecture

### Backend Components
- **Database Schema**: `lawyer_profiles` table with comprehensive fields
- **API Endpoints**: RESTful API for CRUD operations
- **Services**: Business logic for profile management
- **Controllers**: Request handling and validation
- **Middleware**: Authentication and authorization

### Frontend Components
- **LawyerProfileForm**: Create/edit profile form
- **LawyerCard**: Profile preview component
- **LawyerSearch**: Search and filter interface
- **LawyerDetail**: Detailed profile view page

## 📊 Database Schema

The `lawyer_profiles` table includes:

```sql
- id (serial primary key)
- user_id (references users.id, unique)
- specializations (text[] - practice areas)
- years_experience (integer)
- bio (text)
- office_address (varchar)
- service_areas (text[] - cities/regions served)
- languages (text[] - spoken languages)
- education (jsonb - degrees, universities, years)
- bar_admissions (jsonb - states/countries, years)
- hourly_rate (integer, nullable)
- consultation_fee (integer, nullable)
- availability_status (enum: 'available', 'limited', 'unavailable')
- rating (numeric(3,2) - average from reviews)
- cases_handled (integer - count of completed cases)
- success_rate (numeric(5,2) - percentage of favorable outcomes)
- verified (boolean - admin verification)
- created_at & updated_at timestamps
```

## 🚀 API Endpoints

### Public Endpoints
- `GET /api/lawyer-profiles` - List profiles with filtering
- `GET /api/lawyer-profiles/:id` - Get specific profile
- `GET /api/lawyer-profiles/specializations` - Get available specializations
- `GET /api/lawyer-profiles/service-areas` - Get available service areas
- `GET /api/lawyer-profiles/languages` - Get available languages

### Protected Endpoints (Lawyer Only)
- `POST /api/lawyer-profiles` - Create profile
- `PATCH /api/lawyer-profiles/:id` - Update profile
- `GET /api/lawyer-profiles/me/profile` - Get current user's profile

### Admin Endpoints
- `PATCH /api/lawyer-profiles/:id/verify` - Verify lawyer profile

## 🔍 Search & Filter Features

Citizens can search lawyers by:
- **Specialization**: Practice areas (Criminal Law, Family Law, etc.)
- **Location**: Service areas (cities/states)
- **Experience**: Years of practice
- **Languages**: Spoken languages
- **Pricing**: Hourly rate and consultation fee ranges
- **Availability**: Current availability status
- **Rating**: Minimum rating threshold
- **Text Search**: Name, bio, or specialization keywords

## 🎯 Key Features

### For Lawyers
- ✅ Create comprehensive professional profiles
- ✅ Manage specializations and service areas
- ✅ Set pricing and availability
- ✅ Add education and bar admissions
- ✅ Update profile information
- ✅ View profile statistics

### For Citizens
- ✅ Search and filter lawyers
- ✅ View detailed lawyer profiles
- ✅ See ratings and experience
- ✅ Check availability and pricing
- ✅ Contact lawyers (foundation for case system)

### For Admins
- ✅ Verify lawyer credentials
- ✅ Manage lawyer profiles

## 🛡️ Security Features

- **Authentication Required**: Lawyers must be logged in to create/edit profiles
- **Role-Based Access**: Only lawyers can manage their own profiles
- **Admin Verification**: Admins can verify lawyer credentials
- **Data Validation**: Comprehensive input validation
- **Rate Limiting**: API rate limiting (via middleware)

## 📱 User Interface

### Lawyer Profile Form
- Multi-step form with validation
- Rich text editor for bio
- Multi-select for specializations and service areas
- Dynamic education and bar admission entries
- Real-time validation feedback

### Lawyer Search Interface
- Advanced filtering options
- Real-time search results
- Responsive card layout
- Pagination support

### Profile Detail View
- Comprehensive profile display
- Contact information
- Statistics and ratings
- Professional credentials

## 🧪 Testing Instructions

### 1. Create a Lawyer Account
```bash
# Register as a lawyer
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "lawyer"
}
```

### 2. Create a Lawyer Profile
```bash
# Login and create profile
POST /api/lawyer-profiles
{
  "specializations": ["Criminal Law", "Family Law"],
  "yearsExperience": 10,
  "bio": "Experienced criminal defense attorney with 10 years of practice...",
  "officeAddress": "123 Main St, New York, NY 10001",
  "serviceAreas": ["New York, NY", "Brooklyn, NY"],
  "languages": ["English", "Spanish"],
  "education": [
    {
      "degree": "J.D.",
      "university": "Harvard Law School",
      "year": 2014,
      "field": "Law"
    }
  ],
  "barAdmissions": [
    {
      "state": "New York",
      "year": 2014,
      "barNumber": "123456"
    }
  ],
  "hourlyRate": 300,
  "consultationFee": 150,
  "availabilityStatus": "available"
}
```

### 3. Search for Lawyers
```bash
# Search with filters
GET /api/lawyer-profiles?specializations=Criminal Law&minExperience=5&search=John
```

### 4. View Profile Details
```bash
# Get specific profile
GET /api/lawyer-profiles/1
```

## 🔧 Development Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database Migration
```bash
cd backend
npx drizzle-kit push
```

## 📈 Future Enhancements

- **File Upload**: Support for credentials and documents
- **Review System**: Client reviews and ratings
- **Messaging**: Direct communication between lawyers and citizens
- **Case Matching**: Automatic case-lawyer matching
- **Analytics**: Profile performance metrics
- **Notifications**: Real-time updates and alerts

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and configured
2. **CORS Issues**: Check frontend URL in backend CORS configuration
3. **Authentication**: Verify JWT token is being sent correctly
4. **Validation Errors**: Check required fields and data types

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 📝 API Documentation

For detailed API documentation, see the individual controller files:
- `backend/src/controllers/lawyer-profile.controller.ts`
- `backend/src/services/lawyer-profile.service.ts`

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Write comprehensive tests
5. Update documentation

---

**Status**: ✅ Complete and Ready for Testing

The lawyer profile system is now fully implemented and ready for integration with the case management system.
