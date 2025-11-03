/**
 * Export Local Database Script
 *
 * This script exports your local PostgreSQL database to a SQL file
 * that can be imported into Supabase.
 *
 * Usage:
 *   npm run export-db
 *
 * Requirements:
 *   - pg_dump command must be available in your PATH
 *   - Local database must be running
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Parse DATABASE_URL to extract connection details
// Format: postgresql://username:password@host:port/database
const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, username, password, host, port, database] = urlMatch;

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const outputFile = path.join(exportsDir, `database-export-${timestamp}.sql`);

console.log('📦 Starting database export...');
console.log(`   Database: ${database}`);
console.log(`   Host: ${host}:${port}`);
console.log(`   Output: ${outputFile}`);
console.log('');

try {
  // Set password as environment variable for pg_dump
  process.env.PGPASSWORD = password;

  // Run pg_dump command
  const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --clean --if-exists --no-owner --no-acl -f "${outputFile}"`;

  console.log('⏳ Exporting database (this may take a moment)...');
  execSync(command, { stdio: 'inherit' });

  // Check if file was created and get its size
  if (fs.existsSync(outputFile)) {
    const stats = fs.statSync(outputFile);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('');
    console.log('✅ Database exported successfully!');
    console.log(`   File: ${outputFile}`);
    console.log(`   Size: ${fileSizeMB} MB`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Create a Supabase project at https://supabase.com');
    console.log('   2. Get your database connection strings from Project Settings > Database');
    console.log('   3. Import this SQL file to Supabase using:');
    console.log(`      psql -h [supabase-host] -p 5432 -U postgres -d postgres -f "${outputFile}"`);
    console.log('   4. Or use the Supabase SQL Editor to paste and run the SQL');
  } else {
    console.error('❌ Export file was not created');
    process.exit(1);
  }
} catch (error: any) {
  console.error('❌ Error exporting database:', error.message);
  console.error('');
  console.error('💡 Troubleshooting:');
  console.error('   - Make sure pg_dump is installed and in your PATH');
  console.error('   - Check that your local database is running');
  console.error('   - Verify DATABASE_URL in .env is correct');
  process.exit(1);
} finally {
  // Clean up password from environment
  delete process.env.PGPASSWORD;
}
