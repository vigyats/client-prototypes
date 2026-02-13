import { db } from "../server/db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

async function migrate() {
  console.log("Adding username column to users table...");
  
  try {
    // Add username column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS username VARCHAR UNIQUE;
    `);
    
    console.log("✓ Username column added successfully");
    console.log("\nRun 'npm run db:setup' to create the admin user with new credentials");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

migrate();
