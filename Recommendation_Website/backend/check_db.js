const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const users = await prisma.user.findMany({ include: { conditions: true, symptoms: true, recommendations: true } });
    console.log(JSON.stringify(users.slice(-1), null, 2));
}
run().finally(() => prisma.$disconnect());
