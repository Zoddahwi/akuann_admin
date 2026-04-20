const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.gown.count();
  console.log(`Gown count: ${count}`);
  const gowns = await prisma.gown.findMany({ take: 5 });
  console.log(JSON.stringify(gowns, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
