import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await prisma.badge.upsert({
        where: { name: "Commit Climber" },
        update: {},
        create: {
            id: "cc-10", // cc = commits count, 10 = threshold
            name: "Commit Climber",
            description: "Earned by making 10 commits in total.",
            points: 1000,
            image: "/badges/Gold_Medal_Badge.svg", // Image is in public/badges
            type: "commits_count",
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
            image: "/badges/Gold_Medal_Badge.svg",
            type: "commits_count",
            threshold: 100,
        },
    });

    await prisma.badge.upsert({
        where: { name: "Commit Champion" },
        update: {},
        create: {
            id: "cc-1000",
            name: "Commit Champion",
            description: "Earned by making 1000 commits in total.",
            points: 5000,
            image: "/badges/Gold_Medal_Badge.svg",
            type: "commits_count",
            threshold: 1000,
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