"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getJournalEntries() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view journal entries")
  }

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  })

  return entries
}

export async function createJournalEntry(data: {
  title: string
  content: string
  mood: string
  tags: string[]
  date: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a journal entry")
  }

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags,
      date: data.date,
    },
  })

  revalidatePath("/dashboard/journal")

  return entry
}

export async function updateJournalEntry(data: {
  id: string
  title: string
  content: string
  mood: string
  tags: string[]
  date: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a journal entry")
  }

  const existingEntry = await prisma.journalEntry.findUnique({
    where: {
      id: data.id,
    },
  })

  if (!existingEntry || existingEntry.userId !== session.user.id) {
    throw new Error("Journal entry not found or you don't have permission")
  }

  const updatedEntry = await prisma.journalEntry.update({
    where: {
      id: data.id,
    },
    data: {
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags,
      date: data.date,
    },
  })

  revalidatePath("/dashboard/journal")

  return updatedEntry
}

export async function deleteJournalEntry(entryId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a journal entry")
  }

  const entry = await prisma.journalEntry.findUnique({
    where: {
      id: entryId,
    },
  })

  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Journal entry not found or you don't have permission")
  }

  await prisma.journalEntry.delete({
    where: {
      id: entryId,
    },
  })

  revalidatePath("/dashboard/journal")

  return { success: true }
}

