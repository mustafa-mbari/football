import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface NotificationData {
  userIndex: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readHoursAgo?: number;
  hoursAgo?: number;
  minutesAgo?: number;
}

interface SeedData {
  notifications: NotificationData[];
}

export class NotificationSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/notifications.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  async seedNotifications(users: any[]) {
    console.log('\n🔔 Creating notifications...');

    const now = new Date();

    const notificationsData = this.data.notifications.map((notification) => {
      let createdAt: Date;

      if (notification.minutesAgo !== undefined) {
        createdAt = new Date(now.getTime() - notification.minutesAgo * 60 * 1000);
      } else if (notification.hoursAgo !== undefined) {
        createdAt = new Date(now.getTime() - notification.hoursAgo * 60 * 60 * 1000);
      } else {
        createdAt = now;
      }

      let readAt: Date | undefined;
      if (notification.isRead && notification.readHoursAgo !== undefined) {
        readAt = new Date(now.getTime() - notification.readHoursAgo * 60 * 60 * 1000);
      }

      return {
        userId: users[notification.userIndex].id,
        type: notification.type as any,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        readAt,
        createdAt,
      };
    });

    await prisma.notification.createMany({ data: notificationsData });
    console.log('✅ Created notifications');
  }
}
