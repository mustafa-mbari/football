/**
 * Script: Check if password is correct
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkPassword() {
  const email = 'mustafa@example.com';
  const testPassword = 'asd123';

  console.log(`🔍 Checking password for ${email}\n`);

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Found user: ${user.username}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Role: ${user.role}\n`);

    // Test the password
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);

    if (isValid) {
      console.log('✅ Password "asd123" is CORRECT!\n');
      console.log('The password should work. If login is failing:');
      console.log('1. Make sure backend is running: npm run dev');
      console.log('2. Check frontend is connecting to correct URL');
      console.log('3. Check browser console for errors');
    } else {
      console.log('❌ Password "asd123" is INCORRECT\n');
      console.log('Resetting password to "asd123"...\n');

      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { email },
        data: { passwordHash: hashedPassword }
      });

      console.log('✅ Password reset successfully!');
      console.log('\nYou can now login with:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: asd123\n`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword().catch(console.error);
