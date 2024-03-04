import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface BadgeConfig {
  type: string;
  prefix: string;
  badges: {
    name: string;
    description: string;
    points: number;
    threshold: number;
    image: string;
  }[];
}

const badgeConfigs: BadgeConfig[] = [
  {
    type: "commits_count",
    prefix: "cc",
    badges: [
      {
        name: "Commit Climber",
        description: "Earned by making 10 commits in total.",
        points: 1000,
        threshold: 10,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Commit Challenger",
        description: "Earned by making 100 commits in total.",
        points: 2000,
        threshold: 100,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Commit Champion",
        description: "Earned by making 1000 commits in total.",
        points: 5000,
        threshold: 1000,
        image: "/badges/Gold_Medal_Badge.svg",
      },
    ],
  },
];

async function createBadges(badgeConfigs: BadgeConfig[]) {
  const badgePromises = badgeConfigs.flatMap((config) =>
    config.badges.map(async (badge) => {
      await prisma.badgeDefinition.upsert({
        where: { name: badge.name },
        update: {},
        create: {
          id: `${config.prefix}-${badge.threshold}`,
          name: badge.name,
          description: badge.description,
          points: badge.points,
          image: badge.image,
          type: config.type,
          threshold: badge.threshold,
        },
      });
      console.log(`Created badge ${badge.name}`);
    })
  );

  await Promise.all(badgePromises);
  console.log("All badges created successfully.");
}

async function main() {
  try {
    await createBadges(badgeConfigs);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
