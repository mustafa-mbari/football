/**
 * Debug Script: Check Login Issues
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function debugLogin() {
  console.log('🔍 Debugging Login Issues\n');

  try {
    // 1. Check if User table exists and has data
    console.log('1. Checking User table...');
    const userCount = await prisma.user.count();
    console.log(`   Found ${userCount} users in database\n`);

    if (userCount === 0) {
      console.log('   ⚠️  No users found! Creating a test user...\n');

      const testUser = await prisma.user.create({
        data: {
          email: 'test@test.com',
          username: 'testuser',
          name: 'Test User',
          passwordHash: await bcrypt.hash('password123', 10),
          role: 'USER',
          isActive: true
        }
      });

      console.log('   ✅ Test user created:');
      console.log(`      Email: test@test.com`);
      console.log(`      Password: password123`);
      console.log(`      Username: testuser\n`);
    } else {
      // Show sample users
      const users = await prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true,
          role: true
        }
      });

      console.log('   Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.username}) - Active: ${user.isActive} - Role: ${user.role}`);
      });
      console.log();
    }

    // 2. Check Session table
    console.log('2. Checking Session table...');
    const sessionCount = await prisma.session.count();
    console.log(`   Found ${sessionCount} active sessions\n`);

    // 3. Check LoginHistory table
    console.log('3. Checking LoginHistory table...');
    const recentLogins = await prisma.loginHistory.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            username: true
          }
        }
      }
    });

    if (recentLogins.length > 0) {
      console.log('   Recent login attempts:');
      recentLogins.forEach(login => {
        const status = login.loginStatus ? '✅ Success' : '❌ Failed';
        const reason = login.failReason ? ` (${login.failReason})` : '';
        console.log(`   ${status} - ${login.user.email}${reason} - ${login.createdAt.toISOString()}`);
      });
    } else {
      console.log('   No login history found');
    }
    console.log();

    // 4. Test password hashing
    console.log('4. Testing password hashing...');
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`   Password hashing working: ${isValid ? '✅' : '❌'}\n`);

    // 5. Check database connection
    console.log('5. Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Database connection working\n');

    console.log('📊 Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Recent logins: ${recentLogins.length}`);
    console.log();

    if (userCount === 0) {
      console.log('💡 Next steps:');
      console.log('   1. Try logging in with:');
      console.log('      Email: test@test.com');
      console.log('      Password: password123');
      console.log('   2. Or create your own user via the register endpoint\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error);

    if (error.code === 'P2021') {
      console.error('\n⚠️  Table does not exist! Run: npx prisma db push\n');
    } else if (error.code === 'P1001') {
      console.error('\n⚠️  Cannot reach database! Check your DATABASE_URL in .env\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug script
debugLogin().catch(console.error);
