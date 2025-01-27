# Page Structure and Routes

## Overview

The Dental CPMS uses Next.js 13's App Router for routing and page organization. The application follows a hierarchical structure with protected routes and public access points.

## Directory Structure

```
src/app/
├── api/                 # API endpoints
├── protected/          # Protected routes (requires authentication)
│   ├── dashboard/      # Main dashboard
│   ├── calendar/       # Appointment calendar
│   ├── patient-management/  # Patient management
│   ├── xray-management/    # X-ray records
│   ├── backup-management/  # System backups
│   ├── users/             # User management
│   ├── profile/          # User profile
│   └── addpatient/       # Add new patient
├── login/             # Authentication pages
├── layout.tsx         # Root layout
├── page.tsx          # Home page
├── loading.tsx       # Loading states
├── not-found.tsx     # 404 page
└── globals.css       # Global styles
```

## Route Types

### 1. Public Routes
- `/` - Home page
- `/login` - Authentication page
- `/api/*` - API endpoints (some require authentication)

### 2. Protected Routes

#### Dashboard
- `/protected/dashboard`
  - Main application dashboard
  - Statistics and overview
  - Quick actions

#### Patient Management
- `/protected/patient-management`
  - Patient list and search
  - Patient details
  - Medical history
- `/protected/addpatient`
  - New patient registration
  - Patient information form

#### Calendar
- `/protected/calendar`
  - Appointment scheduling
  - Calendar views (day, week, month)
  - Event management

#### X-Ray Management
- `/protected/xray-management`
  - X-ray records
  - Image upload
  - Patient association

#### System Management
- `/protected/backup-management`
  - System backups
  - Restore points
  - Backup scheduling
- `/protected/users`
  - User management
  - Role assignment
  - Access control

#### User Profile
- `/protected/profile`
  - Personal information
  - Settings
  - Preferences

## Page Components

### 1. Layouts

```typescript
// Root layout (layout.tsx)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MainContent>{children}</MainContent>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Pages

```typescript
// Protected page example
export default function DashboardPage() {
  return (
    <div className="container">
      <DashboardHeader />
      <DashboardContent />
      <DashboardFooter />
    </div>
  );
}
```

## Navigation

### 1. Main Navigation
- Sidebar navigation for desktop
- Bottom navigation for mobile
- Breadcrumb navigation

### 2. Route Guards
```typescript
// Route protection example
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return <div>{children}</div>;
}
```

## Loading States

### 1. Page Loading
```typescript
// loading.tsx
export default function Loading() {
  return (
    <div className="loading-spinner">
      <Spinner />
    </div>
  );
}
```

### 2. Route Loading
- Suspense boundaries
- Loading skeletons
- Progress indicators

## Error Handling

### 1. Not Found
```typescript
// not-found.tsx
export default function NotFound() {
  return (
    <div className="error-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}
```

### 2. Error Boundaries
- Custom error pages
- Error recovery
- User feedback

## Middleware

### 1. Route Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/protected')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

### 2. Route Matching
```typescript
export const config = {
  matcher: [
    '/protected/:path*',
    '/api/:path*'
  ]
};
```

## Best Practices

### 1. Route Organization
- Logical grouping
- Clear naming conventions
- Consistent structure
- Modular components

### 2. Performance
- Dynamic imports
- Route prefetching
- Image optimization
- Caching strategies

### 3. SEO
- Meta tags
- Structured data
- Semantic HTML
- Sitemap generation

## Development Guidelines

### 1. Adding New Routes
1. Create page component
2. Add route protection
3. Update navigation
4. Add loading states
5. Implement error handling

### 2. Route Naming
- Use kebab-case for URLs
- Descriptive route names
- Consistent patterns
- Avoid deep nesting

### 3. Testing
- Route accessibility
- Navigation flow
- Loading states
- Error scenarios

## Future Improvements

1. **Route Optimization**
   - Route-based code splitting
   - Parallel route loading
   - Route prefetching
   - Cache optimization

2. **Enhanced Navigation**
   - Search functionality
   - Quick navigation
   - History management
   - Breadcrumb enhancement

3. **Mobile Experience**
   - Responsive routes
   - Touch navigation
   - Gesture support
   - Mobile-first design 