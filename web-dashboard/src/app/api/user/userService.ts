import prisma from "@/utils/prisma";

export async function deleteUser(userId: string) {
  try {
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`User ${userId} has been deleted:`, user);

    return user;
  } catch (error) {
    console.error(`An error occurred while deleting user ${userId} from the database:`, error);
    throw error;
  }
}
