"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getHabits() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view habits")
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      completions: {
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return habits
}

export async function createHabit(data: {
  name: string
  description?: string
  category: string
  frequency: string
  color: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a habit")
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: data.name,
      description: data.description,
      category: data.category,
      frequency: data.frequency,
      color: data.color,
    },
  })

  revalidatePath("/dashboard/habits")

  return habit
}

export async function toggleHabitCompletion(data: {
  habitId: string
  date: Date
  completed: boolean
  notes?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a habit")
  }

  const habit = await prisma.habit.findUnique({
    where: {
      id: data.habitId,
    },
  })

  if (!habit || habit.userId !== session.user.id) {
    throw new Error("Habit not found or you don't have permission")
  }

  // Format date to remove time component for uniqueness constraint
  const dateOnly = new Date(data.date)
  dateOnly.setHours(0, 0, 0, 0)

  // Check if completion record exists
  const existingCompletion = await prisma.habitCompletion.findFirst({
    where: {
      habitId: data.habitId,
      userId: session.user.id,
      date: {
        gte: new Date(dateOnly.setHours(0, 0, 0, 0)),
        lt: new Date(dateOnly.setHours(23, 59, 59, 999)),
      },
    },
  })

  if (existingCompletion) {
    // Update existing completion
    await prisma.habitCompletion.update({
      where: {
        id: existingCompletion.id,
      },
      data: {
        completed: data.completed,
        notes: data.notes,
      },
    })
  } else {
    // Create new completion
    await prisma.habitCompletion.create({
      data: {
        habitId: data.habitId,
        userId: session.user.id,
        date: dateOnly,
        completed: data.completed,
        notes: data.notes,
      },
    })
  }

  revalidatePath("/dashboard/habits")

  return { success: true }
}

export async function deleteHabit(habitId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a habit")
  }

  const habit = await prisma.habit.findUnique({
    where: {
      id: habitId,
    },
  })

  if (!habit || habit.userId !== session.user.id) {
    throw new Error("Habit not found or you don't have permission")
  }

  // Delete all completions first
  await prisma.habitCompletion.deleteMany({
    where: {
      habitId: habitId,
    },
  })

  // Then delete the habit
  await prisma.habit.delete({
    where: {
      id: habitId,
    },
  })

  revalidatePath("/dashboard/habits")

  return { success: true }
}

