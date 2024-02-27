import prisma from "@/utils/prisma";

export async function getBadgesFromDB() {
  try {
    const badges = await prisma.badgeDefinition.findMany();
    return badges;
  } catch (error) {
    console.error(`An error occurred while getting all available badges from the database`, error);
    throw error;
  }
}
