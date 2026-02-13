# Admin Authentication System - Changes Summary

## Overview
Updated the admin authentication system to support username, email, and password-based login instead of Replit OIDC.

## Key Changes

### 1. Database Schema (`shared/schema.ts`)
- Added `username` field to users table (unique, varchar)
- Username is optional but recommended for admin accounts

### 2. Admin Login Page (`client/src/pages/admin/AdminLoginPage.tsx`)
- New beautiful login UI with tricolor theme
- Username/Email input field (accepts either)
- Password input field (required)
- Loading states and error handling
- Toast notifications

### 3. Admin Registration (`client/src/pages/admin/SuperAdminAdminsPage.tsx`)
- Updated "Add Admin" form with three fields:
  - Username (required)
  - Email (required)
  - Password (required, min 6 characters)
- Removed old Replit userId field

### 4. API Routes (`shared/routes.ts`)
- Updated admin creation endpoint to accept:
  ```typescript
  {
    username: string,
    email: string,
    password: string,
    role: "admin" | "super_admin"
  }
  ```

### 5. Server Routes (`server/routes.ts`)
- **Login endpoint** (`POST /api/auth/login`):
  - Accepts `identifier` (username or email) and `password`
  - Searches users by both username and email
  - Validates password (plain text for now, should use bcrypt in production)
  - Sets user session on success

- **User endpoint** (`GET /api/auth/user`):
  - Returns actual user data from database
  - Checks session for authenticated user

- **Admin creation** (`POST /api/admins`):
  - Creates user with username, email, and password
  - Checks for duplicate username/email
  - Creates admin record linked to user
  - Only super_admins can create new admins

### 6. Database Setup (`script/setup-db.ts`)
- Creates initial super admin with credentials:
  - Username: `vigyat`
  - Email: `vigyat@blackai.in`
  - Password: `vigyat@123`

### 7. Admin Guard (`client/src/pages/admin/AdminGuard.tsx`)
- Redirects to `/admin/login` instead of `/api/login`
- Uses wouter navigation instead of window.location

### 8. App Routes (`client/src/App.tsx`)
- Added `/admin/login` route for the login page

## Migration Steps

1. Run database schema update:
   ```bash
   npm run db:push
   ```

2. Setup admin user:
   ```bash
   npm run db:setup
   ```

## Login Instructions

1. Navigate to `/admin/login`
2. Enter either:
   - Username: `vigyat` OR
   - Email: `vigyat@blackai.in`
3. Enter password: `vigyat@123`
4. Click "Login"

## Adding New Admins

1. Login as super admin
2. Go to "Manage Admins" page
3. Click "Add Admin"
4. Fill in:
   - Username (unique)
   - Email (unique)
   - Password (min 6 chars)
   - Role (admin or super_admin)
5. New admin can login with username or email

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**
- Currently using plain text password comparison
- Should implement bcrypt for password hashing:
  ```javascript
  // On registration:
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // On login:
  const isValid = await bcrypt.compare(password, user.password);
  ```
- Add rate limiting to login endpoint
- Implement session management with secure cookies
- Add CSRF protection
- Use HTTPS in production

## Files Modified

1. `shared/schema.ts` - Added username field
2. `shared/routes.ts` - Updated admin creation API
3. `client/src/pages/admin/AdminLoginPage.tsx` - NEW FILE
4. `client/src/pages/admin/SuperAdminAdminsPage.tsx` - Updated form
5. `client/src/pages/admin/AdminGuard.tsx` - Updated redirect
6. `client/src/App.tsx` - Added login route
7. `server/routes.ts` - Updated auth and admin endpoints
8. `script/setup-db.ts` - Updated initial admin creation
9. `script/add-username-column.ts` - NEW FILE (migration)
10. `MIGRATION_GUIDE.md` - NEW FILE (documentation)
