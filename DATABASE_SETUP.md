# Database Setup Instructions

## Step 1: Get Your Database Password

1. Go to [Neon.tech Dashboard](https://console.neon.tech)
2. Select your project
3. Go to the "Connection Details" section
4. Copy the full connection string with the actual password

## Step 2: Update .env File

Replace the `PASSWORD` placeholder in your `.env` file with your actual database password:

```
DATABASE_URL=postgresql://neondb_owner:YOUR_ACTUAL_PASSWORD@ep-still-smoke-aixm1870-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Step 3: Push Database Schema

Run this command to create all database tables:

```bash
npm run db:push
```

## Step 4: Create Super Admin User

Run this command to create your admin account:

```bash
npm run db:setup
```

This will create:
- Email: admin@prayasyavatmal.org
- Role: super_admin
- Status: active

## Step 5: Start the Application

```bash
npm run dev
```

## Step 6: Login as Admin

1. Open your application in the browser
2. Click "Admin Login"
3. Use any authentication method (Google, etc.)
4. The system will automatically link your login to the super_admin account

## Troubleshooting

If you get "password authentication failed":
- Double-check your DATABASE_URL has the correct password
- Make sure there are no extra spaces in the .env file
- Verify the connection string is on a single line

If tables already exist:
- The `db:push` command is safe to run multiple times
- It will only create missing tables

If admin already exists:
- The `db:setup` script is safe to run multiple times
- It will skip if the admin user already exists
