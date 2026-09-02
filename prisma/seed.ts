import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: 'Alice Johnson', email: 'alice@ajaia.com', password: 'password123' },
    { name: 'Bob Smith',     email: 'bob@ajaia.com',   password: 'password123' },
    { name: 'Carol White',   email: 'carol@ajaia.com', password: 'password123' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
      },
    });
  }
  console.log('Seeded 3 demo users: alice@ajaia.com, bob@ajaia.com, carol@ajaia.com (password: password123)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
