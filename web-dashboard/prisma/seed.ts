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
  {
    type: "prs_opened_count",
    prefix: "prs-opened",
    badges: [
      {
        name: "Pull Request Novice",
        description: "Earned by opening 5 pull requests.",
        points: 1000,
        threshold: 5,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Pull Request Trooper",
        description: "Earned by opening 10 pull requests.",
        points: 2000,
        threshold: 10,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Pull Request Expert",
        description: "Earned by opening 30 pull requests.",
        points: 3000,
        threshold: 30,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Pull Request Master",
        description: "Earned by opening 50 pull requests.",
        points: 4000,
        threshold: 50,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Pull Request Legend",
        description: "Earned by opening 100 pull requests.",
        points: 5000,
        threshold: 100,
        image: "/badges/Gold_Medal_Badge.svg",
      },
    ],
  },
  {
    type: "prs_merged_count",
    prefix: "prs-merged",
    badges: [
      {
        name: "Collaborator Novice",
        description: "Earned by getting 5 of your pull request merged.",
        points: 1000,
        threshold: 5,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Collaborator Maverick",
        description: "Earned by getting 10 of your pull requests merged.",
        points: 2000,
        threshold: 10,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Collaborator Picasso",
        description: "Earned by getting 30 of your pull requests merged.",
        points: 3000,
        threshold: 30,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Collaborator Magician",
        description: "Earned by getting 50 of your pull requests merged.",
        points: 4000,
        threshold: 50,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Collaborator Maestro",
        description: "Earned by getting 100 of your pull requests merged.",
        points: 5000,
        threshold: 100,
        image: "/badges/Gold_Medal_Badge.svg",
      },
    ],
  },
  {
    type: "issues_opened_count",
    prefix: "issues-opened",
    badges: [
      {
        name: "Junior Assignee",
        description: "Earned by being assigned to 10 issues.",
        points: 1000,
        threshold: 10,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Intermediate Assignee",
        description: "Earned by being assigned to 50 issues.",
        points: 2000,
        threshold: 50,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Expert Assignee",
        description: "Earned by being assigned to 100 issues.",
        points: 3000,
        threshold: 100,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Elite Assignee",
        description: "Earned by being assigned to 150 issues.",
        points: 4000,
        threshold: 150,
        image: "/badges/Gold_Medal_Badge.svg",
      },
    ],
  },
  {
    type: "issues_closed_count",
    prefix: "issues-closed",
    badges: [
      {
        name: "Problem Solver",
        description: "Earned by being assigned to 10 closed issues.",
        points: 1000,
        threshold: 10,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Issue Crusher",
        description: "Earned by being assigned to 50 closed issues.",
        points: 2000,
        threshold: 50,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Solution Master",
        description: "Earned by being assigned to 100 closed issues.",
        points: 3000,
        threshold: 100,
        image: "/badges/Gold_Medal_Badge.svg",
      },
      {
        name: "Issue Terminator",
        description: "Earned by being assigned to 150 closed issues.",
        points: 4000,
        threshold: 150,
        image: "/badges/Gold_Medal_Badge.svg",
      },
    ],
  },
];

const levelConfig: Level[] = [
  { id: 1, name: "Aspiring Beginner", threshold: 1000 },
  { id: 2, name: "Budding Learner", threshold: 2500 },
  { id: 3, name: "Eager Explorer", threshold: 5000 },
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
