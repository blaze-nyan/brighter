"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getSkills() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view skills")
  }

  const skills = await prisma.skill.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return skills
}

export async function createSkill(data: {
  name: string
  category: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a skill")
  }

  const skill = await prisma.skill.create({
    data: {
      userId: session.user.id,
      name: data.name,
      category: data.category,
      progress: 0,
      hoursSpent: 0,
    },
  })

  revalidatePath("/dashboard/skills")

  return skill
}

export async function updateSkillProgress(data: {
  skillId: string
  hoursSpent: number
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a skill")
  }

  const skill = await prisma.skill.findUnique({
    where: {
      id: data.skillId,
    },
  })

  if (!skill || skill.userId !== session.user.id) {
    throw new Error("Skill not found or you don't have permission")
  }

  const updatedSkill = await prisma.skill.update({
    where: {
      id: data.skillId,
    },
    data: {
      hoursSpent: skill.hoursSpent + data.hoursSpent,
      lastPracticed: new Date(),
      // Simple progress calculation - can be made more sophisticated
      progress: Math.min(Math.floor((skill.hoursSpent + data.hoursSpent) / 2), 100),
    },
  })

  revalidatePath("/dashboard/skills")

  return updatedSkill
}

export async function deleteSkill(skillId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a skill")
  }

  const skill = await prisma.skill.findUnique({
    where: {
      id: skillId,
    },
  })

  if (!skill || skill.userId !== session.user.id) {
    throw new Error("Skill not found or you don't have permission")
  }

  await prisma.skill.delete({
    where: {
      id: skillId,
    },
  })

  revalidatePath("/dashboard/skills")

  return { success: true }
}

export async function logSkillSession(data: {
  skillId: string
  hours: number
  notes?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to log a skill session")
  }

  const skill = await prisma.skill.findUnique({
    where: {
      id: data.skillId,
    },
  })

  if (!skill || skill.userId !== session.user.id) {
    throw new Error("Skill not found or you don't have permission")
  }

  const updatedSkill = await prisma.skill.update({
    where: {
      id: data.skillId,
    },
    data: {
      hoursSpent: skill.hoursSpent + data.hours,
      lastPracticed: new Date(),
      progress: Math.min(Math.floor((skill.hoursSpent + data.hours) / 2), 100),
      notes: data.notes,
    },
  })

  revalidatePath("/dashboard/skills")

  return updatedSkill
}

