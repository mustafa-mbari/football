/**
 * Migration Script: Team → TeamLeague Junction Table
 *
 * This script migrates existing Team-League relationships to the new
 * TeamLeague junction table for many-to-many support.
 *
 * IMPORTANT: Run this BEFORE applying the schema migration that removes leagueId
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTeamLeagueRelationships() {
  console.log('🚀 Starting Team → TeamLeague migration...\n');

  try {
    // Step 1: Check if TeamLeague table exists
    console.log('📋 Step 1: Checking current database state...');

    // Get all teams with their current leagueId (before migration)
    const teams = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      code: string;
      leagueId: number | null;
    }>>`
      SELECT id, name, code, "leagueId"
      FROM "Team"
      WHERE "leagueId" IS NOT NULL
    `;

    console.log(`   Found ${teams.length} teams with league associations\n`);

    if (teams.length === 0) {
      console.log('✅ No teams to migrate');
      return;
    }

    // Step 2: Check if TeamLeague table exists
    const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'TeamLeague'
      ) as exists
    `;

    if (!tableExists[0].exists) {
      console.log('⚠️  TeamLeague table does not exist yet.');
      console.log('   Please run "npx prisma db push" first to create the table.\n');
      process.exit(1);
    }

    // Step 3: Check if leagueId column still exists in Team table
    const columnExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'Team'
        AND column_name = 'leagueId'
      ) as exists
    `;

    if (!columnExists[0].exists) {
      console.log('⚠️  leagueId column has already been removed from Team table.');
      console.log('   Migration may have already been run.\n');

      // Check if data exists in TeamLeague
      const existingRecords = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "TeamLeague"
      `;
      console.log(`   TeamLeague table has ${existingRecords[0].count} records.\n`);
      return;
    }

    console.log('✅ Database is ready for migration\n');

    // Step 4: Migrate data to TeamLeague table
    console.log('📋 Step 2: Migrating team-league relationships...');

    let migratedCount = 0;
    let skippedCount = 0;

    for (const team of teams) {
      try {
        // Check if relationship already exists
        const existing = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count
          FROM "TeamLeague"
          WHERE "teamId" = ${team.id} AND "leagueId" = ${team.leagueId}
        `;

        if (Number(existing[0].count) > 0) {
          console.log(`   ⏭️  Skipping ${team.name} - already exists in TeamLeague`);
          skippedCount++;
          continue;
        }

        // Insert into TeamLeague
        await prisma.$executeRaw`
          INSERT INTO "TeamLeague" ("teamId", "leagueId", "isActive", "createdAt", "updatedAt")
          VALUES (${team.id}, ${team.leagueId}, true, NOW(), NOW())
        `;

        migratedCount++;
        console.log(`   ✅ Migrated ${team.name} (Team ID: ${team.id}) → League ID: ${team.leagueId}`);
      } catch (error) {
        console.error(`   ❌ Failed to migrate team ${team.name}:`, error);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${migratedCount} teams`);
    console.log(`   ⏭️  Skipped (already existed): ${skippedCount} teams`);
    console.log(`   📋 Total processed: ${teams.length} teams\n`);

    console.log('✅ Migration completed successfully!\n');
    console.log('⚠️  NEXT STEPS:');
    console.log('   1. Verify the data in TeamLeague table');
    console.log('   2. Update your schema to remove leagueId from Team model');
    console.log('   3. Run "npx prisma db push" to apply the final schema changes');
    console.log('   4. Update application code to use TeamLeague relationships\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateTeamLeagueRelationships()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
