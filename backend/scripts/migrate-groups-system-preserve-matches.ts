import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateGroupsSystem() {
  console.log('🔄 Starting Groups & Leagues System Migration...\n');
  console.log('⚠️  This will DELETE: Users, Predictions, Groups, Leaderboard data');
  console.log('✅ This will PRESERVE: Matches, Teams, Leagues, GameWeeks, Tables\n');

  try {
    // Step 1: Delete dependent data first
    console.log('🗑️  Step 1: Deleting existing data...');

    await prisma.userAchievement.deleteMany({});
    console.log('   ✓ Deleted user achievements');

    await prisma.notification.deleteMany({});
    console.log('   ✓ Deleted notifications');

    await prisma.session.deleteMany({});
    console.log('   ✓ Deleted sessions');

    await prisma.loginHistory.deleteMany({});
    console.log('   ✓ Deleted login history');

    await prisma.userFavoriteTeam.deleteMany({});
    console.log('   ✓ Deleted favorite teams');

    await prisma.prediction.deleteMany({});
    console.log('   ✓ Deleted predictions');

    await prisma.groupMember.deleteMany({});
    console.log('   ✓ Deleted group members');

    await prisma.group.deleteMany({});
    console.log('   ✓ Deleted groups');

    await prisma.user.deleteMany({});
    console.log('   ✓ Deleted users\n');

    // Step 2: Alter Group table (add new columns if not exist)
    console.log('🔧 Step 2: Updating Group table schema...');

    // Add isPublic column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Group"
      ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('   ✓ Added isPublic column');

    // Add leagueId column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Group"
      ADD COLUMN IF NOT EXISTS "leagueId" INTEGER;
    `);
    console.log('   ✓ Added leagueId column');

    // Add allowedTeamIds column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Group"
      ADD COLUMN IF NOT EXISTS "allowedTeamIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
    `);
    console.log('   ✓ Added allowedTeamIds column');

    // Add foreign key constraint for leagueId
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'Group_leagueId_fkey'
        ) THEN
          ALTER TABLE "Group"
          ADD CONSTRAINT "Group_leagueId_fkey"
          FOREIGN KEY ("leagueId") REFERENCES "League"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('   ✓ Added foreign key constraint');

    // Add indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Group_leagueId_idx" ON "Group"("leagueId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Group_isPublic_idx" ON "Group"("isPublic");
    `);
    console.log('   ✓ Added indexes\n');

    // Step 3: Alter GroupMember table
    console.log('🔧 Step 3: Updating GroupMember table schema...');

    // Remove old columns if they exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupMember"
      DROP COLUMN IF EXISTS "collectedPoints";
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupMember"
      DROP COLUMN IF EXISTS "lastPointDate";
    `);
    console.log('   ✓ Removed old columns');

    // Add new columns
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupMember"
      ADD COLUMN IF NOT EXISTS "pointsByLeague" JSONB NOT NULL DEFAULT '{}'::jsonb;
    `);
    console.log('   ✓ Added pointsByLeague column');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupMember"
      ADD COLUMN IF NOT EXISTS "totalPoints" INTEGER NOT NULL DEFAULT 0;
    `);
    console.log('   ✓ Added totalPoints column');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "GroupMember"
      ADD COLUMN IF NOT EXISTS "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('   ✓ Added lastUpdated column\n');

    // Step 4: Drop GroupLeaderboard table if exists
    console.log('🔧 Step 4: Dropping GroupLeaderboard table...');
    await prisma.$executeRawUnsafe(`
      DROP TABLE IF EXISTS "GroupLeaderboard" CASCADE;
    `);
    console.log('   ✓ Dropped GroupLeaderboard table\n');

    // Step 5: Get all leagues and create public groups
    console.log('👥 Step 5: Creating public groups for each league...');

    const leagues = await prisma.league.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    });

    console.log(`   Found ${leagues.length} active leagues\n`);

    // Create a system user for owning public groups
    console.log('👤 Creating system user for public groups...');
    const systemUser = await prisma.user.create({
      data: {
        name: 'System',
        email: 'system@footballpredictions.com',
        username: 'system',
        passwordHash: 'N/A', // System user cannot login
        role: 'SUPER_ADMIN',
        isActive: true,
        isEmailVerified: true
      }
    });
    console.log('   ✓ System user created\n');

    // Create public groups
    const publicGroups = [];
    for (const league of leagues) {
      const group = await prisma.group.create({
        data: {
          name: `${league.name} - Public Group`,
          description: `Official public group for ${league.name}. All players are automatically joined when they make their first prediction in this league.`,
          isPrivate: false,
          isPublic: true,
          ownerId: systemUser.id,
          leagueId: league.id,
          allowedTeamIds: [], // Empty = all teams allowed
          logoUrl: league.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(league.name)}&background=random`
        }
      });
      publicGroups.push(group);
      console.log(`   ✓ Created public group: ${group.name}`);
    }

    console.log(`\n✅ Migration completed successfully!\n`);
    console.log('📊 Summary:');
    console.log(`   - Leagues preserved: ${leagues.length}`);
    console.log(`   - Public groups created: ${publicGroups.length}`);
    console.log(`   - Users reset: Ready for new data`);
    console.log(`   - Predictions reset: Ready for new data`);
    console.log(`   - Matches preserved: ${await prisma.match.count()}`);
    console.log(`   - Teams preserved: ${await prisma.team.count()}`);
    console.log(`   - GameWeeks preserved: ${await prisma.gameWeek.count()}\n`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateGroupsSystem()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
