"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Book, BookFormData } from "@/types/book";

export async function getBooks(): Promise<Book[]> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to view books");
  }

  const books = await db.book.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return books;
}

export async function getBook(id: string): Promise<Book | null> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to view a book");
  }

  const book = await db.book.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  return book;
}

export async function createBook(data: BookFormData): Promise<Book> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to create a book");
  }

  const book = await db.book.create({
    data: {
      ...data,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard/bookshelf");
  return book;
}

export async function updateBook(
  id: string,
  data: BookFormData
): Promise<Book> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to update a book");
  }

  const book = await db.book.update({
    where: {
      id,
      userId: user.id,
    },
    data,
  });

  revalidatePath("/dashboard/bookshelf");
  return book;
}

export async function deleteBook(id: string): Promise<Book> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in to delete a book");
  }

  const book = await db.book.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard/bookshelf");
  return book;
}
