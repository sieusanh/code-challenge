import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
      role: Role.USER,
      isActive: true,
    },
  });

  // Create sample resources
  await prisma.resource.createMany({
    data: [
      {
        title: 'Getting Started Guide',
        description: 'A comprehensive guide to get started with the API',
        status: Status.ACTIVE,
        category: 'Documentation',
        tags: ['guide', 'tutorial', 'beginner'],
        metadata: { views: 1500, difficulty: 'easy' },
        ownerId: admin.id,
      },
      {
        title: 'Advanced Security Patterns',
        description: 'Deep dive into security implementation patterns',
        status: Status.ACTIVE,
        category: 'Security',
        tags: ['security', 'advanced', 'patterns'],
        metadata: { views: 850, difficulty: 'advanced' },
        ownerId: admin.id,
      },
      {
        title: 'API Reference',
        description: 'Complete API endpoint reference documentation',
        status: Status.ACTIVE,
        category: 'Documentation',
        tags: ['api', 'reference', 'endpoints'],
        metadata: { views: 2000, difficulty: 'intermediate' },
        ownerId: user.id,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@example.com / Password123!');
  console.log('User: user@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
