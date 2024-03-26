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
        image: "/badges/bronze_medal_badge_1.svg",
      },
      {
        name: "Commit Challenger",
        description: "Earned by making 100 commits in total.",
        points: 2000,
        threshold: 100,
        image: "/badges/bronze_medal_badge_2.svg",
      },
      {
        name: "Commit Conqueror",
        description: "Earned by making 500 commits in total.",
        points: 3000,
        threshold: 500,
        image: "/badges/silver_medal_badge_1.svg",
      },
      {
        name: "Commit Champion",
        description: "Earned by making 1000 commits in total.",
        points: 4000,
        threshold: 1000,
        image: "/badges/silver_medal_badge_2.svg",
      },
      {
        name: "Commit Star",
        description: "Earned by making 1500 commits in total.",
        points: 5000,
        threshold: 1500,
        image: "/badges/gold_medal_badge_1.svg",
      },
      {
        name: "The Greatest Committer",
        description: "Earned by making 2000 commits in total.",
        points: 6000,
        threshold: 2000,
        image: "/badges/gold_medal_badge_2.svg",
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
        image: "/badges/gold_medal_badge_1.svg",
      },
      {
        name: "Pull Request Trooper",
        description: "Earned by opening 10 pull requests.",
        points: 2000,
        threshold: 10,
        image: "/badges/gold_medal_badge_2.svg",
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
  {
    type: "languages_count",
    prefix: "languages",
    badges: [
      {
        name: "Monolingual Master",
        description: "Achieved by using one programming language.",
        points: 1000,
        threshold: 1,
        image: "/badges/language_1.svg",
      },
      {
        name: "Multilingual Coder",
        description: "Achieved by using 5 programming languages.",
        points: 2000,
        threshold: 5,
        image: "/badges/language_2.svg",
      },
      {
        name: "Language Explorer",
        description: "Achieved by using 10 programming languages.",
        points: 3000,
        threshold: 10,
        image: "/badges/language_3.svg",
      },
      {
        name: "Linguist Legend",
        description: "Achieved by using 20 programming languages.",
        points: 4000,
        threshold: 20,
        image: "/badges/language_4.svg",
      },
      {
        name: "Master Polyglot",
        description: "Achieved by using 30 programming languages.",
        points: 5000,
        threshold: 30,
        image: "/badges/language_5.svg",
      },
    ],
  },
];

const levelConfig: Level[] = [
  { id: 1, name: "Aspiring Beginner", threshold: 1000 },
  { id: 2, name: "Budding Learner", threshold: 2500 },
  { id: 3, name: "Eager Explorer", threshold: 5000 },
  { id: 4, name: "Proficient Apprentice", threshold: 7500 },
  { id: 5, name: "Curious Crusader", threshold: 10000 },
  { id: 6, name: "Knowledge Climber", threshold: 12500 },
  { id: 7, name: "Leaping Learner ", threshold: 15000 },
  { id: 8, name: "Passionate Pathfinder", threshold: 17500 },
  { id: 9, name: "Steady Strider", threshold: 20000 },
  { id: 10, name: "Strategic Scholar", threshold: 25000 },
  { id: 11, name: "Mastery Marathoner", threshold: 30000 },
  { id: 12, name: "Adept Achiever", threshold: 35000 },
  { id: 13, name: "Cosmic Compendium", threshold: 40000 },
  { id: 14, name: "Visionary Virtuoso", threshold: 45000 },
  { id: 15, name: "Masterful Maker", threshold: 50000 },
  { id: 16, name: "Sagacious Sage", threshold: 60000 },
  { id: 17, name: "Everlasting Learner", threshold: 70000 },
  { id: 18, name: "Boundless Builder", threshold: 80000 },
  { id: 19, name: "Empowered Expert", threshold: 90000 },
  { id: 20, name: "Coding Champion", threshold: 100000 },
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
