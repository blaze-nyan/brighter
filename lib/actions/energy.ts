"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getEnergyLogs() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view energy logs")
  }

  const logs = await prisma.energyLog.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  })

  return logs
}

export async function createEnergyLog(data: {
  energyLevel: number
  focusLevel: number
  notes?: string
  date: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create an energy log")
  }

  const log = await prisma.energyLog.create({
    data: {
      userId: session.user.id,
      energyLevel: data.energyLevel,
      focusLevel: data.focusLevel,
      notes: data.notes,
      date: data.date,
    },
  })

  revalidatePath("/dashboard/energy")

  return log
}

