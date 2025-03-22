"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
  subDays,
  format,
} from "date-fns";

export async function getAnalyticsData(timeRange = "30days") {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view analytics");
  }

  const userId = session.user.id;
  const now = new Date();

  // Calculate date range based on selected timeRange
  let startDate: Date;
  switch (timeRange) {
    case "7days":
      startDate = subDays(now, 7);
      break;
    case "90days":
      startDate = subDays(now, 90);
      break;
    case "year":
      startDate = subDays(now, 365);
      break;
    case "30days":
    default:
      startDate = subDays(now, 30);
      break;
  }

  // Get energy logs for the selected time range
  const energyLogs = await prisma.energyLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Get pomodoro sessions for the selected time range
  const pomodoroSessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Get habits and their completions
  const habits = await prisma.habit.findMany({
    where: {
      userId,
    },
    include: {
      completions: {
        where: {
          date: {
            gte: startDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  // Get journal entries and mood data
  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Get financial data for the past 6 months
  const sixMonthsAgo = subMonths(now, 6);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Get goals data
  const goals = await prisma.goal.findMany({
    where: {
      userId,
    },
    include: {
      milestones: {
        include: {
          tasks: true,
        },
      },
    },
  });

  // Get skills data
  const skills = await prisma.skill.findMany({
    where: {
      userId,
    },
  });

  // Process data for analytics

  // Monthly financial data
  const monthlyFinancialData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(now, 5 - i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthTransactions = transactions.filter(
      (t) => t.date >= monthStart && t.date <= monthEnd
    );

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(monthDate, "MMM"),
      income,
      expenses,
      savings: income - expenses,
    };
  });

  // Expense categories breakdown
  const expenseCategories = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  // Convert to array format for easier consumption in the UI
  const expenseCategoriesArray = Object.entries(expenseCategories).map(
    ([name, value]) => ({
      name,
      value: Math.round(
        (value / Object.values(expenseCategories).reduce((a, b) => a + b, 0)) *
          100
      ),
    })
  );

  // Mood data
  const moodData = journalEntries.reduce((acc, entry) => {
    const mood = entry.mood || "Neutral";
    if (!acc[mood]) {
      acc[mood] = 0;
    }
    acc[mood]++;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array format for easier consumption in the UI
  const moodDataArray = Object.entries(moodData).map(([name, value]) => ({
    name,
    value: Math.round(
      (value / Object.values(moodData).reduce((a, b) => a + b, 0)) * 100
    ),
  }));

  // Calculate habit completion rates
  const habitCompletionRates = habits.map((habit) => {
    const completions = habit.completions;
    const completionRate =
      completions.length > 0
        ? (completions.filter((c) => c.completed).length / completions.length) *
          100
        : 0;

    // Calculate current streak
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const completion = completions.find(
        (c) =>
          c.date.toISOString().split("T")[0] ===
          currentDate.toISOString().split("T")[0]
      );

      if (completion && completion.completed) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    return {
      id: habit.id,
      name: habit.name,
      completionRate: Math.round(completionRate),
      streak,
    };
  });

  // Format energy data for chart
  const energyData = energyLogs.map((log) => ({
    date: log.date,
    value: log.energyLevel,
  }));

  // Format pomodoro data for chart
  const pomodoroData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i);
    const dateStr = date.toISOString().split("T")[0];

    const sessions = pomodoroSessions.filter(
      (session) => session.date.toISOString().split("T")[0] === dateStr
    );

    return {
      date,
      count: sessions.length,
    };
  });

  // Calculate average stats
  const averageEnergyLevel =
    energyLogs.length > 0
      ? Math.round(
          energyLogs.reduce((sum, log) => sum + log.energyLevel, 0) /
            energyLogs.length
        )
      : 0;

  const totalPomodoroSessions = pomodoroSessions.length;

  const averageHabitCompletionRate =
    habitCompletionRates.length > 0
      ? Math.round(
          habitCompletionRates.reduce(
            (sum, habit) => sum + habit.completionRate,
            0
          ) / habitCompletionRates.length
        )
      : 0;

  const averageGoalProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
        )
      : 0;

  return {
    energyData,
    pomodoroData,
    habitCompletionRates,
    monthlyFinancialData,
    expenseCategories: expenseCategoriesArray,
    moodData: moodDataArray,
    goals,
    skills,
    stats: {
      averageEnergyLevel,
      totalPomodoroSessions,
      averageHabitCompletionRate,
      averageGoalProgress,
    },
  };
}

export async function getDailyStats() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view stats");
  }

  const userId = session.user.id;
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // Get today's energy log
  const energyLog = await prisma.energyLog.findFirst({
    where: {
      userId,
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Get today's pomodoro sessions
  const pomodoroSessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  // Get today's habit completions
  const habitCompletions = await prisma.habitCompletion.findMany({
    where: {
      userId,
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: {
      habit: true,
    },
  });

  // Get today's journal entry
  const journalEntry = await prisma.journalEntry.findFirst({
    where: {
      userId,
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  // Get today's todos
  const todos = await prisma.todo.findMany({
    where: {
      userId,
      dueDate: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  // Calculate stats
  const totalPomodoroMinutes = pomodoroSessions.reduce(
    (sum, session) => sum + session.duration / 60,
    0
  );
  const completedHabits = habitCompletions.filter((c) => c.completed).length;
  const totalHabits = await prisma.habit.count({ where: { userId } });
  const completedTodos = todos.filter((t) => t.completed).length;

  return {
    date: today.toISOString(),
    energyLevel: energyLog?.energyLevel || 0,
    focusLevel: energyLog?.focusLevel || 0,
    pomodoroSessions: pomodoroSessions.length,
    pomodoroMinutes: Math.round(totalPomodoroMinutes),
    habitCompletionRate:
      totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
    journalWritten: !!journalEntry,
    todoCompletionRate:
      todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0,
  };
}
