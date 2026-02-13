# Database Migration Guide

## Adding Username Support

This migration adds username support to the authentication system.

### Steps to migrate:

1. **Push schema changes to database:**
   ```bash
   npm run db:push
   ```

2. **Setup admin user with new credentials:**
   ```bash
   npm run db:setup
   ```

### New Admin Credentials:
- **Username:** vigyat
- **Email:** vigyat@blackai.in
- **Password:** vigyat@123

### Login Options:
You can now login using either:
- Username: `vigyat`
- Email: `vigyat@blackai.in`

Password is required for both methods.

### Adding New Admins:
Super admins can now add new admins with:
- Username (required)
- Email (required)
- Password (required, minimum 6 characters)
- Role (admin or super_admin)

New admins can login with either their username or email.
