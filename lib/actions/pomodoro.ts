"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getPomodoroSessions() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view pomodoro sessions")
  }

  const sessions = await prisma.pomodoroSession.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  })

  return sessions
}

export async function createPomodoroSession(data: {
  duration: number
  date: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a pomodoro session")
  }

  const pomodoroSession = await prisma.pomodoroSession.create({
    data: {
      userId: session.user.id,
      duration: data.duration,
      date: data.date,
    },
  })

  revalidatePath("/dashboard/pomodoro")

  return pomodoroSession
}

