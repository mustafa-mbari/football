/**
 * Script: Reset User Password
 *
 * Usage: npx ts-node scripts/reset-user-password.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  console.log('🔐 Reset User Password\n');

  try {
    // Show all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      },
      orderBy: { email: 'asc' }
    });

    console.log('Available users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username}) - ${user.role}`);
    });
    console.log();

    const choice = await question('Enter the number of the user to reset password: ');
    const userIndex = parseInt(choice) - 1;

    if (userIndex < 0 || userIndex >= users.length) {
      console.log('Invalid choice');
      process.exit(1);
    }

    const selectedUser = users[userIndex];
    const newPassword = await question(`Enter new password for ${selectedUser.email}: `);

    if (newPassword.length < 6) {
      console.log('Password must be at least 6 characters');
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user
    await prisma.user.update({
      where: { id: selectedUser.id },
      data: { passwordHash: hashedPassword }
    });

    console.log('\n✅ Password updated successfully!');
    console.log(`\nYou can now login with:`);
    console.log(`   Email: ${selectedUser.email}`);
    console.log(`   Password: ${newPassword}\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

resetPassword().catch(console.error);
