"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getDashboardData() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view dashboard data")
  }

  const userId = session.user.id

  // Get recent energy logs
  const energyLogs = await prisma.energyLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 7,
  })

  // Get pomodoro sessions
  const pomodoroSessions = await prisma.pomodoroSession.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 30,
  })

  // Get skills
  const skills = await prisma.skill.findMany({
    where: {
      userId,
    },
    orderBy: {
      hoursSpent: "desc",
    },
    take: 5,
  })

  // Get recent notes
  const notes = await prisma.note.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  })

  // Calculate stats
  const averageEnergy =
    energyLogs.length > 0
      ? Math.round(energyLogs.reduce((sum, log) => sum + log.energyLevel, 0) / energyLogs.length)
      : 0

  const totalPomodoroTime = pomodoroSessions.reduce((sum, session) => sum + session.duration, 0)
  const pomodoroHours = Math.floor(totalPomodoroTime / 3600)
  const pomodoroMinutes = Math.floor((totalPomodoroTime % 3600) / 60)

  return {
    energyLogs,
    pomodoroSessions,
    skills,
    notes,
    stats: {
      averageEnergy,
      pomodoroCount: pomodoroSessions.length,
      pomodoroTime: `${pomodoroHours}h ${pomodoroMinutes}m`,
      skillsCount: skills.length,
      notesCount: notes.length,
    },
  }
}

