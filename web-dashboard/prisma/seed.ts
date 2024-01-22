import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.badge.upsert({
        where: { name: "Commit Climber" },
        update: {},
        create: {
            id: "cc-10", // cc = commit count, 10 = threshold
            name: "Commit Climber",
            description: "Earned by making 10 commits in total.",
            points: 1000,
            image: "",
            type: "commit",
            threshold: 10,
        },
    });
    console.log("Created badge Commit Climber");

    await prisma.badge.upsert({
        where: { name: "Commit Challenger" },
        update: {},
        create: {
            id: "cc-100",
            name: "Commit Challenger",
            description: "Earned by making 100 commits in total.",
            points: 2000,
            image: "",
            type: "commit",
            threshold: 100,
        },
    });
    console.log("Created badge Commit Challenger");
}

main()
    .then(() => { prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });