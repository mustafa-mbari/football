import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface GroupData {
  name: string;
  description: string;
  ownerIndex: number;
  isPrivate: boolean;
  joinCode?: string;
  logoUrl: string;
}

interface GroupMemberData {
  groupIndex: number;
  userIndex: number;
  role: string;
}

interface SeedData {
  groups: GroupData[];
  groupMembers: GroupMemberData[];
}

export class GroupSeeder {
  private data: SeedData;

  constructor() {
    const dataPath = path.join(__dirname, '../data/groups.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.data = JSON.parse(rawData);
  }

  async seedGroups(users: any[]) {
    console.log('\n👥 Creating groups...');

    const groups = await Promise.all(
      this.data.groups.map((groupData) =>
        prisma.group.create({
          data: {
            name: groupData.name,
            description: groupData.description,
            ownerId: users[groupData.ownerIndex].id,
            isPrivate: groupData.isPrivate,
            joinCode: groupData.joinCode,
            logoUrl: groupData.logoUrl,
          },
        })
      )
    );

    console.log(`✅ Created ${groups.length} groups`);
    return groups;
  }

  async seedGroupMembers(groups: any[], users: any[]) {
    console.log('\n👤 Adding group members...');

    const groupMembersData = this.data.groupMembers.map((member) => ({
      groupId: groups[member.groupIndex].id,
      userId: users[member.userIndex].id,
      role: member.role as any,
    }));

    await prisma.groupMember.createMany({ data: groupMembersData });
    console.log('✅ Added group members');
  }
}
