"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getNotes() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view notes")
  }

  const notes = await prisma.note.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return notes
}

export async function createNote(data: {
  title: string
  content: string
  category?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a note")
  }

  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: data.title,
      content: data.content,
      category: data.category,
    },
  })

  revalidatePath("/dashboard/notes")

  return note
}

export async function updateNote(data: {
  id: string
  title: string
  content: string
  category?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a note")
  }

  const note = await prisma.note.findUnique({
    where: {
      id: data.id,
    },
  })

  if (!note || note.userId !== session.user.id) {
    throw new Error("Note not found or you don't have permission")
  }

  const updatedNote = await prisma.note.update({
    where: {
      id: data.id,
    },
    data: {
      title: data.title,
      content: data.content,
      category: data.category,
    },
  })

  revalidatePath("/dashboard/notes")

  return updatedNote
}

export async function deleteNote(noteId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a note")
  }

  const note = await prisma.note.findUnique({
    where: {
      id: noteId,
    },
  })

  if (!note || note.userId !== session.user.id) {
    throw new Error("Note not found or you don't have permission")
  }

  await prisma.note.delete({
    where: {
      id: noteId,
    },
  })

  revalidatePath("/dashboard/notes")

  return { success: true }
}

