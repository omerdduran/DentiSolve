# API Documentation

## Overview

The Dental CPMS API is built using Next.js API Routes, providing a RESTful interface for managing dental clinic operations. All routes are prefixed with `/api`.

## Authentication Endpoints

### `/api/auth/*`
NextAuth.js authentication endpoints
- Handles OAuth providers
- Session management
- Token validation

### `/api/login`
- **POST** `/api/login`
  - User authentication
  - Returns JWT token

### `/api/register`
- **POST** `/api/register`
  - New user registration
  - Password hashing
  - User role assignment

### `/api/validateToken`
- **POST** `/api/validateToken`
  - Validates JWT tokens
  - Session verification

## Patient Management

### `/api/patients`
- **GET** `/api/patients`
  - List all patients
  - Supports pagination and filtering
- **POST** `/api/patients`
  - Create new patient
- **GET** `/api/patients/:id`
  - Get patient details
- **PUT** `/api/patients/:id`
  - Update patient information
- **DELETE** `/api/patients/:id`
  - Delete patient record

## Appointment Management

### `/api/events`
- **GET** `/api/events`
  - List all appointments
  - Supports date range filtering
- **POST** `/api/events`
  - Create new appointment
- **PUT** `/api/events/:id`
  - Update appointment details
- **DELETE** `/api/events/:id`
  - Cancel/delete appointment

## X-Ray Management

### `/api/xrays`
- **GET** `/api/xrays`
  - List all X-rays
  - Filter by patient
- **POST** `/api/xrays`
  - Upload new X-ray record
- **GET** `/api/xrays/:id`
  - Get X-ray details
- **PUT** `/api/xrays/:id`
  - Update X-ray information
- **DELETE** `/api/xrays/:id`
  - Delete X-ray record

## User Management

### `/api/users`
- **GET** `/api/users`
  - List all users
  - Role-based access control
- **POST** `/api/users`
  - Create new user
- **PUT** `/api/users/:id`
  - Update user details
- **DELETE** `/api/users/:id`
  - Delete user account

## File Management

### `/api/upload`
- **POST** `/api/upload`
  - File upload endpoint
  - Supports X-ray images
  - File validation

### `/api/backups`
- **GET** `/api/backups`
  - List system backups
- **POST** `/api/backups`
  - Create new backup
- **GET** `/api/backups/:id`
  - Download backup
- **DELETE** `/api/backups/:id`
  - Delete backup

## Response Format

All API endpoints follow a consistent response format:

```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  }
}
```

## Error Handling

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Authentication

- All API routes (except `/api/login` and `/api/register`) require authentication
- JWT tokens must be included in the Authorization header
- Format: `Authorization: Bearer {token}`

## Rate Limiting

- API requests are rate-limited to prevent abuse
- Default: 100 requests per minute per IP
- Authenticated users have higher limits

## Security

1. **Input Validation**
   - All request data is validated
   - Uses Zod for schema validation

2. **CORS**
   - Configured for specific origins
   - Handles preflight requests

3. **Security Headers**
   - CSRF protection
   - XSS prevention
   - Content Security Policy

## API Versioning

Current version: v1
- All routes are currently unversioned
- Future versions will be prefixed with `/api/v2/`

## Development Guidelines

1. **New Endpoints**
   - Follow RESTful conventions
   - Include request/response validation
   - Add appropriate error handling

2. **Testing**
   - Write unit tests for each endpoint
   - Include integration tests
   - Test error scenarios

3. **Documentation**
   - Update API documentation
   - Include request/response examples
   - Document breaking changes 