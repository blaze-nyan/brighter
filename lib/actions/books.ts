"use server";

import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Book, BookFormData } from "@/types/book";

export async function getBooks(): Promise<Book[]> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view books");
  }

  console.log("Current User ID:", session.user.id); // ✅ Check the logged-in user

  const books = await prisma.book.findMany({
    where: {
      userId: session.user.id, // ✅ Ensure this matches your database records
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  console.log("Fetched Books:", books); // ✅ Check if books exist
  console.log("userID", session.user.id);

  return books as Book[];
}

export async function getBook(id: string): Promise<Book | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view a book");
  }

  const book = await prisma.book.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
  });

  return book as Book | null;
}

export async function createBook(data: BookFormData): Promise<Book> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a book");
  }

  const book = await prisma.book.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/bookshelf");
  return book as unknown as Book;
}

export async function updateBook(
  id: string,
  data: BookFormData
): Promise<Book> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a book");
  }

  const book = await prisma.book.update({
    where: {
      id,
      userId: session.user.id,
    },
    data,
  });

  revalidatePath("/dashboard/bookshelf");
  return book as unknown as Book;
}

export async function deleteBook(id: string): Promise<Book> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a book");
  }

  const book = await prisma.book.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/bookshelf");
  return book as unknown as Book;
}
