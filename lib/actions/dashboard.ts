"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function getDashboardData() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view dashboard data");
  }

  const userId = session.user.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Get recent energy logs
  const energyLogs = await prisma.energyLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 7,
  });

  // Get pomodoro sessions
  const pomodoroSessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 30,
  });

  // Get skills
  const skills = await prisma.skill.findMany({
    where: {
      userId,
    },
    orderBy: {
      hoursSpent: "desc",
    },
    take: 5,
  });

  // Get recent notes
  const notes = await prisma.note.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  // Get habits and completions
  const habits = await prisma.habit.findMany({
    where: {
      userId,
    },
    include: {
      completions: {
        where: {
          date: {
            gte: thirtyDaysAgo,
          },
        },
      },
    },
  });

  // Get journal entries
  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Get todos
  const todos = await prisma.todo.findMany({
    where: {
      userId,
    },
  });

  // Get goals and milestones
  const goals = await prisma.goal.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      milestones: true,
    },
  });

  // Get completed milestones
  const recentMilestones = await prisma.milestone
    .findMany({
      where: {
        userId,
        completed: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: {
        goal: true,
      },
    })
    .then((milestones) =>
      milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        goalTitle: milestone.goal.title,
        completedAt: milestone.updatedAt,
      }))
    );

  // Calculate activity data for the past 7 days
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];

    // Find energy log for this date
    const energyLog = energyLogs.find(
      (log) => new Date(log.date).toISOString().split("T")[0] === dateStr
    );

    // Calculate habit completion rate for this date
    const dayHabitCompletions = habits.flatMap((habit) =>
      habit.completions.filter(
        (completion) =>
          new Date(completion.date).toISOString().split("T")[0] === dateStr
      )
    );

    const habitCompletionRate =
      habits.length > 0 && dayHabitCompletions.length > 0
        ? (dayHabitCompletions.filter((c) => c.completed).length /
            habits.length) *
          100
        : 0;

    return {
      date: date.toLocaleDateString(undefined, { weekday: "short" }),
      energy: energyLog?.energyLevel || 0,
      focus: energyLog?.focusLevel || 0,
      habits: Math.round(habitCompletionRate),
    };
  });

  // Calculate stats
  const averageEnergy =
    energyLogs.length > 0
      ? Math.round(
          energyLogs.reduce((sum, log) => sum + log.energyLevel, 0) /
            energyLogs.length
        )
      : 0;

  const totalPomodoroTime = pomodoroSessions.reduce(
    (sum, session) => sum + session.duration,
    0
  );
  const pomodoroHours = Math.floor(totalPomodoroTime / 3600);
  const pomodoroMinutes = Math.floor((totalPomodoroTime % 3600) / 60);

  // Calculate habit completion rate
  const habitCompletions = habits.flatMap((habit) => habit.completions);
  const habitCompletionRate =
    habits.length > 0 && habitCompletions.length > 0
      ? Math.round(
          (habitCompletions.filter((c) => c.completed).length /
            habitCompletions.length) *
            100
        )
      : 0;

  // Calculate todo completion rate
  const todoCompletionRate =
    todos.length > 0
      ? Math.round(
          (todos.filter((t) => t.completed).length / todos.length) * 100
        )
      : 0;

  return {
    energyLogs,
    pomodoroSessions,
    skills,
    notes,
    goals,
    recentMilestones,
    activityData,
    stats: {
      averageEnergy,
      pomodoroCount: pomodoroSessions.length,
      pomodoroTime: `${pomodoroHours}h ${pomodoroMinutes}m`,
      skillsCount: skills.length,
      notesCount: notes.length,
      habitCompletionRate,
      journalCount: journalEntries.length,
      todoCompletionRate,
    },
  };
}
