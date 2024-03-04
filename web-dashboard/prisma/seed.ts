import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.badgeDefinition.upsert({
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

  await prisma.badgeDefinition.upsert({
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

  console.log("Created badge Commit Challenger");

  await prisma.badgeDefinition.upsert({
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

  console.log("Created badge Commit Champion");

  await prisma.badgeDefinition.upsert({
    where: { name: "Pull Request Novice" },
    update: {},
    create: {
      id: "pr-o-5",
      name: "Pull Request Novice",
      description: "Earned by opening 5 pull requests.",
      points: 1000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_opened_count",
      threshold: 5,
    },
  });

  console.log("Created badge Pull Request Novice");

  await prisma.badgeDefinition.upsert({
    where: { name: "Pull Request Trooper" },
    update: {},
    create: {
      id: "pr-o-10",
      name: "Pull Request Trooper",
      description: "Earned by opening 10 pull requests.",
      points: 2000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_opened_count",
      threshold: 10,
    },
  });

  console.log("Created badge Pull Request Trooper");

  await prisma.badgeDefinition.upsert({
    where: { name: "Pull Request Expert" },
    update: {},
    create: {
      id: "pr-o-30",
      name: "Pull Request Expert",
      description: "Earned by opening 30 pull requests.",
      points: 3000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_opened_count",
      threshold: 30,
    },
  });

  console.log("Created badge Pull Request Expert");

  await prisma.badgeDefinition.upsert({
    where: { name: "Pull Request Master" },
    update: {},
    create: {
      id: "pr-o-50",
      name: "Pull Request Master",
      description: "Earned by opening 50 pull requests.",
      points: 4000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_opened_count",
      threshold: 50,
    },
  });

  console.log("Created badge Pull Request Master");

  await prisma.badgeDefinition.upsert({
    where: { name: "Pull Request Legend" },
    update: {},
    create: {
      id: "pr-o-100",
      name: "Pull Request Legend",
      description: "Earned by opening 100 pull requests.",
      points: 5000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_opened_count",
      threshold: 100,
    },
  });

  console.log("Created badge Pull Request Legend");

  await prisma.badgeDefinition.upsert({
    where: { name: "Collaborator Novice" },
    update: {},
    create: {
      id: "pr-m-5",
      name: "Collaborator Novice",
      description: "Earned by getting 5 of your pull request merged.",
      points: 1000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_merged_count",
      threshold: 5,
    },
  });

  console.log("Created badge Collaborator Novice");

  await prisma.badgeDefinition.upsert({
    where: { name: "Collaborator Maverick" },
    update: {},
    create: {
      id: "pr-m-10",
      name: "Collaborator Maverick",
      description: "Earned by getting 10 of your pull requests merged.",
      points: 2000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_merged_count",
      threshold: 10,
    },
  });

  console.log("Created badge Collaborator Maverick");

  await prisma.badgeDefinition.upsert({
    where: { name: "Collaborator Picasso" },
    update: {},
    create: {
      id: "pr-m-30",
      name: "Collaborator Picasso",
      description: "Earned by getting 30 of your pull requests merged.",
      points: 3000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_merged_count",
      threshold: 30,
    },
  });

  console.log("Created badge Collaborator Picasso");

  await prisma.badgeDefinition.upsert({
    where: { name: "Collaborator Magician" },
    update: {},
    create: {
      id: "pr-m-50",
      name: "Collaborator Magician",
      description: "Earned by getting 50 of your pull requests merged.",
      points: 4000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_merged_count",
      threshold: 50,
    },
  });

  console.log("Created badge Collaborator Magician");

  await prisma.badgeDefinition.upsert({
    where: { name: "Collaborator Maestro" },
    update: {},
    create: {
      id: "pr-m-100",
      name: "Collaborator Maestro",
      description: "Earned by getting 100 of your pull requests merged.",
      points: 5000,
      image: "/badges/Gold_Medal_Badge.svg",
      type: "prs_merged_count",
      threshold: 100,
    },
  });

  console.log("Created badge Collaborator Powerhouse");
}

main()
  .then(() => {
    prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
