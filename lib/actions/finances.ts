"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getTransactions() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view transactions")
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  })

  return transactions
}

export async function getBudgets() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view budgets")
  }

  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
    },
  })

  return budgets
}

export async function createTransaction(data: {
  amount: number
  type: string
  category: string
  description?: string
  date: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a transaction")
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      date: data.date,
    },
  })

  // If it's an expense, update the corresponding budget if it exists
  if (data.type === "expense") {
    const budget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        category: data.category,
      },
    })

    if (budget) {
      await prisma.budget.update({
        where: {
          id: budget.id,
        },
        data: {
          spent: budget.spent + data.amount,
        },
      })
    }
  }

  revalidatePath("/dashboard/finances")

  return transaction
}

export async function createBudget(data: {
  category: string
  amount: number
  period: string
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a budget")
  }

  // Check if budget for this category already exists
  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId: session.user.id,
      category: data.category,
    },
  })

  if (existingBudget) {
    throw new Error(`A budget for ${data.category} already exists`)
  }

  const budget = await prisma.budget.create({
    data: {
      userId: session.user.id,
      category: data.category,
      amount: data.amount,
      spent: 0,
      period: data.period,
    },
  })

  revalidatePath("/dashboard/finances")

  return budget
}

export async function deleteTransaction(transactionId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a transaction")
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: transactionId,
    },
  })

  if (!transaction || transaction.userId !== session.user.id) {
    throw new Error("Transaction not found or you don't have permission")
  }

  // If it's an expense, update the corresponding budget
  if (transaction.type === "expense") {
    const budget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        category: transaction.category,
      },
    })

    if (budget) {
      await prisma.budget.update({
        where: {
          id: budget.id,
        },
        data: {
          spent: Math.max(0, budget.spent - transaction.amount),
        },
      })
    }
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  })

  revalidatePath("/dashboard/finances")

  return { success: true }
}

export async function deleteBudget(budgetId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a budget")
  }

  const budget = await prisma.budget.findUnique({
    where: {
      id: budgetId,
    },
  })

  if (!budget || budget.userId !== session.user.id) {
    throw new Error("Budget not found or you don't have permission")
  }

  await prisma.budget.delete({
    where: {
      id: budgetId,
    },
  })

  revalidatePath("/dashboard/finances")

  return { success: true }
}

