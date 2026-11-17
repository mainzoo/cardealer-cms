import { prisma } from "../../lib/prisma";
import { seedTaxonomy } from "./taxonomy.seed";

async function main() {
    console.log("Seeding database...");
    await seedTaxonomy(prisma);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });