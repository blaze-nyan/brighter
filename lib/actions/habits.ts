import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getHabits() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return prisma.habit.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      completions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createHabit({
  name,
  description,
  category,
  frequency,
  color,
}: {
  name: string;
  description: string;
  category: string;
  frequency: string;
  color: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return prisma.habit.create({
    data: {
      name,
      description,
      category,
      frequency,
      color,
      user: {
        connect: {
          id: session.user.id,
        },
      },
    },
    include: {
      completions: true,
    },
  });
}

export async function deleteHabit(habitId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // First, delete all completions related to this habit
  await prisma.habitCompletion.deleteMany({
    where: {
      habitId,
      userId: session.user.id,
    },
  });

  // Then delete the habit itself
  return prisma.habit.delete({
    where: {
      id: habitId,
      userId: session.user.id,
    },
  });
}

export async function toggleHabitCompletion(data: {
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}) {
  if (!data || !data.habitId) {
    throw new Error("Habit ID is required");
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if the habit exists and belongs to the user
    const habit = await prisma.habit.findUnique({
      where: {
        id: data.habitId,
        userId: session.user.id,
      },
    });

    if (!habit) {
      throw new Error("Habit not found or doesn't belong to user");
    }

    // Check if a completion record already exists for this date
    const existingCompletion = await prisma.habitCompletion.findFirst({
      where: {
        habitId: data.habitId,
        userId: session.user.id,
        date: data.date,
      },
    });

    let completion;

    if (existingCompletion) {
      // Update existing completion
      completion = await prisma.habitCompletion.update({
        where: {
          id: existingCompletion.id,
        },
        data: {
          completed: data.completed,
          notes: data.notes,
        },
      });
    } else {
      // Create new completion
      completion = await prisma.habitCompletion.create({
        data: {
          habitId: data.habitId,
          userId: session.user.id,
          date: data.date,
          completed: data.completed,
          notes: data.notes,
        },
      });
    }

    // Get the updated habit with its completions
    const updatedHabit = await prisma.habit.findUnique({
      where: {
        id: data.habitId,
      },
      include: {
        completions: true,
      },
    });

    return updatedHabit;
  } catch (error) {
    console.error("Error in toggleHabitCompletion:", error);
    throw error;
  }
}
