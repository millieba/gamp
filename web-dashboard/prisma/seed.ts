import { Level, PrismaClient } from "@prisma/client";
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

const levelConfig: Level[] = [
  { id: 1, name: "Aspiring Beginner", threshold: 1000 },
  { id: 2, name: "Budding Learner", threshold: 10000 },
  { id: 3, name: "Eager Explorer", threshold: 100000 },
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

async function createLevels(levelConfig: Level[]) {
  const levelPromises = levelConfig.map(async (level) => {
    await prisma.level.upsert({
      where: { name: level.name },
      update: {},
      create: {
        id: level.id,
        name: level.name,
        threshold: level.threshold,
      },
    });
    console.log(`Created level ${level.name}`);
  });

  await Promise.all(levelPromises);
  console.log("All levels created successfully.");
}

async function main() {
  try {
    await createBadges(badgeConfigs);
    await createLevels(levelConfig);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
