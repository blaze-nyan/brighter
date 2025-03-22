"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function getPomodoroSessions() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view pomodoro sessions");
  }

  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  return sessions;
}

export async function createPomodoroSession(data: {
  duration: number;
  date: Date;
  task?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a pomodoro session");
  }

  const pomodoroSession = await prisma.pomodoroSession.create({
    data: {
      userId: session.user.id,
      duration: data.duration,
      date: data.date,
      task: data.task || null,
    },
  });

  revalidatePath("/dashboard/pomodoro");
  return pomodoroSession;
}

export async function getPomodoroStats() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view pomodoro stats");
  }

  // Get total sessions
  const totalSessions = await prisma.pomodoroSession.count({
    where: {
      userId: session.user.id,
    },
  });

  // Get total focus time (in minutes)
  const totalFocusTime = await prisma.pomodoroSession.aggregate({
    where: {
      userId: session.user.id,
    },
    _sum: {
      duration: true,
    },
  });

  // Get sessions from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSessions = await prisma.pomodoroSession.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Calculate daily stats for the last 7 days
  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const sessionsForDay = recentSessions.filter(
      (s) => new Date(s.date) >= date && new Date(s.date) < nextDate
    );

    const totalDuration = sessionsForDay.reduce(
      (sum, session) => sum + session.duration,
      0
    );

    return {
      date: date.toISOString().split("T")[0],
      count: sessionsForDay.length,
      duration: totalDuration,
    };
  });

  return {
    totalSessions,
    totalFocusTime: totalFocusTime._sum.duration || 0,
    recentSessions,
    dailyStats,
  };
}

export async function getUserSettings() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view settings");
  }

  // In a real app, you would fetch user settings from the database
  // For now, we'll return default settings
  return {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
  };
}

export async function saveUserSettings(settings: {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to save settings");
  }

  // In a real app, you would save these settings to the database
  // For now, we'll just return the settings
  return settings;
}
