import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.badge.upsert({
        where: { name: "Commit Climber" },
        update: {},
        create: {
            name: "Commit Climber",
            description: "Earned by making 10 commits in total.",
            points: 1000,
            image: "",
            type: "commit",
            threshold: 10,
        },
    });
    console.log("Created badge Commit Climber");
}

main()
    .then(() => { prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
