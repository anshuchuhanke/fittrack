const prisma = require("../lib/prisma");
const foods = require("./indianFoods.json");

async function main() {
  console.log(`Seeding ${foods.length} foods...`);
  for (const food of foods) {
    await prisma.food.upsert({
      where: { name: food.name },
      update: food,
      create: food,
    });
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
