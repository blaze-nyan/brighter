"use server";

import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function getUserProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          todos: true,
          notes: true,
          habits: true,
          goals: true,
          journalEntries: true,
          books: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
  image?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  // Check if email is being changed and if it's already in use
  if (data.email && data.email !== session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error("Email already in use");
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      email: session.user.email,
    },
    data: {
      name: data.name,
      email: data.email,
      image: data.image,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/settings");

  return updatedUser;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      password: true,
    },
  });

  if (!user?.password) {
    throw new Error("No password set for this account");
  }

  // Verify current password
  const passwordMatch = await compare(data.currentPassword, user.password);

  if (!passwordMatch) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await hash(data.newPassword, 10);

  await prisma.user.update({
    where: {
      email: session.user.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  revalidatePath("/settings");

  return { success: true };
}

export async function getUserStats() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get counts of various entities
  const [
    todoCount,
    completedTodoCount,
    noteCount,
    habitCount,
    goalCount,
    completedGoalCount,
    journalCount,
    bookCount,
    pomodoroCount,
    totalPomodoroMinutes,
  ] = await Promise.all([
    prisma.todo.count({ where: { userId: user.id } }),
    prisma.todo.count({ where: { userId: user.id, completed: true } }),
    prisma.note.count({ where: { userId: user.id } }),
    prisma.habit.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id, completed: true } }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.book.count({ where: { userId: user.id } }),
    prisma.pomodoroSession.count({ where: { userId: user.id } }),
    prisma.pomodoroSession.aggregate({
      where: { userId: user.id },
      _sum: { duration: true },
    }),
  ]);

  // Get the date the user joined
  const userJoinDate = await prisma.user.findUnique({
    where: { id: user.id },
    select: { createdAt: true },
  });

  // Calculate days since joining
  const daysSinceJoining = Math.floor(
    (new Date().getTime() -
      new Date(userJoinDate?.createdAt || new Date()).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    todoCount,
    completedTodoCount,
    todoCompletionRate:
      todoCount > 0 ? (completedTodoCount / todoCount) * 100 : 0,
    noteCount,
    habitCount,
    goalCount,
    completedGoalCount,
    goalCompletionRate:
      goalCount > 0 ? (completedGoalCount / goalCount) * 100 : 0,
    journalCount,
    bookCount,
    pomodoroCount,
    totalPomodoroMinutes: totalPomodoroMinutes?._sum?.duration || 0,
    daysSinceJoining,
    journalsPerWeek:
      daysSinceJoining > 0 ? journalCount / (daysSinceJoining / 7) : 0,
  };
}

// Store notification preferences in local storage until Prisma is updated
const notificationPreferences = new Map<string, any>();

export async function getNotificationPreferences() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Return stored preferences if they exist
  if (notificationPreferences.has(user.id)) {
    return notificationPreferences.get(user.id);
  }

  // Return default preferences
  return {
    emailNotifications: true,
    pushNotifications: false,
    reminderEmails: true,
    weeklyDigest: true,
    goalReminders: true,
    habitReminders: true,
  };
}

export async function updateNotificationPreferences(preferences: {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  reminderEmails?: boolean;
  weeklyDigest?: boolean;
  goalReminders?: boolean;
  habitReminders?: boolean;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Store preferences in memory
  notificationPreferences.set(user.id, preferences);

  revalidatePath("/settings");

  return preferences;
}

// Store appearance preferences in local storage until Prisma is updated
const appearancePreferences = new Map<string, any>();

export async function getAppearancePreferences() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Return stored preferences if they exist
  if (appearancePreferences.has(user.id)) {
    return appearancePreferences.get(user.id);
  }

  // Return default preferences
  return {
    theme: "system",
    fontSize: "medium",
    reducedMotion: false,
    highContrast: false,
  };
}

export async function updateAppearancePreferences(preferences: {
  theme?: string;
  fontSize?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Store preferences in memory
  appearancePreferences.set(user.id, preferences);

  revalidatePath("/settings");

  return preferences;
}
