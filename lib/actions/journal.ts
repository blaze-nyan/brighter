"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function getJournalEntries() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view journal entries");
  }

  const entries = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  return entries;
}

export async function createJournalEntry(data: {
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: Date | string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a journal entry");
  }

  // Ensure date is properly formatted
  let formattedDate;
  if (data.date instanceof Date) {
    formattedDate = data.date.toISOString();
  } else if (typeof data.date === "string") {
    // If it's already a string, check if it's an ISO string
    try {
      // Try to create a Date object and convert back to ISO
      formattedDate = new Date(data.date).toISOString();
    } catch (e) {
      // If that fails, use the current date
      formattedDate = new Date().toISOString();
    }
  } else {
    // Fallback to current date
    formattedDate = new Date().toISOString();
  }

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags,
      date: formattedDate,
    },
  });

  revalidatePath("/dashboard/journal");

  return entry;
}

export async function updateJournalEntry(data: {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  date: Date;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a journal entry");
  }

  const existingEntry = await prisma.journalEntry.findUnique({
    where: {
      id: data.id,
    },
  });

  if (!existingEntry || existingEntry.userId !== session.user.id) {
    throw new Error("Journal entry not found or you don't have permission");
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
  });

  revalidatePath("/dashboard/journal");

  return updatedEntry;
}

export async function deleteJournalEntry(entryId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a journal entry");
  }

  const entry = await prisma.journalEntry.findUnique({
    where: {
      id: entryId,
    },
  });

  if (!entry || entry.userId !== session.user.id) {
    throw new Error("Journal entry not found or you don't have permission");
  }

  await prisma.journalEntry.delete({
    where: {
      id: entryId,
    },
  });

  revalidatePath("/dashboard/journal");

  return { success: true };
}
