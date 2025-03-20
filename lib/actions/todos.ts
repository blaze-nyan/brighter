"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getTodos() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view todos")
  }

  const todos = await prisma.todo.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  })

  return todos
}

export async function createTodo(data: {
  title: string
  description?: string
  dueDate?: Date
  priority: string
  category?: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a todo")
  }

  const todo = await prisma.todo.create({
    data: {
      userId: session.user.id,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      category: data.category,
    },
  })

  revalidatePath("/dashboard/todos")

  return todo
}

export async function updateTodo(data: {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: string
  category?: string
  completed?: boolean
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a todo")
  }

  const todo = await prisma.todo.findUnique({
    where: {
      id: data.id,
    },
  })

  if (!todo || todo.userId !== session.user.id) {
    throw new Error("Todo not found or you don't have permission")
  }

  const updatedTodo = await prisma.todo.update({
    where: {
      id: data.id,
    },
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      category: data.category,
      completed: data.completed !== undefined ? data.completed : todo.completed,
    },
  })

  revalidatePath("/dashboard/todos")

  return updatedTodo
}

export async function toggleTodoCompletion(todoId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a todo")
  }

  const todo = await prisma.todo.findUnique({
    where: {
      id: todoId,
    },
  })

  if (!todo || todo.userId !== session.user.id) {
    throw new Error("Todo not found or you don't have permission")
  }

  const updatedTodo = await prisma.todo.update({
    where: {
      id: todoId,
    },
    data: {
      completed: !todo.completed,
    },
  })

  revalidatePath("/dashboard/todos")

  return updatedTodo
}

export async function deleteTodo(todoId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a todo")
  }

  const todo = await prisma.todo.findUnique({
    where: {
      id: todoId,
    },
  })

  if (!todo || todo.userId !== session.user.id) {
    throw new Error("Todo not found or you don't have permission")
  }

  await prisma.todo.delete({
    where: {
      id: todoId,
    },
  })

  revalidatePath("/dashboard/todos")

  return { success: true }
}

