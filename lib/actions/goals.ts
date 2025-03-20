"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function getGoals() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to view goals")
  }

  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      milestones: {
        include: {
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return goals
}

export async function createGoal(data: {
  title: string
  description?: string
  category: string
  targetDate?: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a goal")
  }

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      title: data.title,
      description: data.description,
      category: data.category,
      targetDate: data.targetDate,
      progress: 0,
    },
  })

  revalidatePath("/dashboard/goals")

  return goal
}

export async function createMilestone(data: {
  goalId: string
  title: string
  description?: string
  dueDate?: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a milestone")
  }

  const goal = await prisma.goal.findUnique({
    where: {
      id: data.goalId,
    },
  })

  if (!goal || goal.userId !== session.user.id) {
    throw new Error("Goal not found or you don't have permission")
  }

  const milestone = await prisma.milestone.create({
    data: {
      userId: session.user.id,
      goalId: data.goalId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
    },
  })

  revalidatePath("/dashboard/goals")

  return milestone
}

export async function createTask(data: {
  milestoneId: string
  title: string
  description?: string
  dueDate?: Date
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a task")
  }

  const milestone = await prisma.milestone.findUnique({
    where: {
      id: data.milestoneId,
    },
  })

  if (!milestone || milestone.userId !== session.user.id) {
    throw new Error("Milestone not found or you don't have permission")
  }

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      milestoneId: data.milestoneId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
    },
  })

  revalidatePath("/dashboard/goals")

  return task
}

export async function toggleTaskCompletion(taskId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a task")
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      milestone: {
        include: {
          tasks: true,
          goal: true,
        },
      },
    },
  })

  if (!task || task.userId !== session.user.id) {
    throw new Error("Task not found or you don't have permission")
  }

  // Update task completion status
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      completed: !task.completed,
    },
  })

  // Check if all tasks in milestone are completed
  const allTasksCompleted = !task.completed && task.milestone.tasks.every((t) => (t.id === taskId ? true : t.completed))

  if (allTasksCompleted) {
    // Update milestone completion status
    await prisma.milestone.update({
      where: {
        id: task.milestone.id,
      },
      data: {
        completed: true,
      },
    })

    // Update goal progress
    const goal = task.milestone.goal
    const milestones = await prisma.milestone.findMany({
      where: {
        goalId: goal.id,
      },
    })

    const completedMilestones = milestones.filter((m) => m.completed).length
    const totalMilestones = milestones.length
    const progress = Math.round((completedMilestones / totalMilestones) * 100)

    await prisma.goal.update({
      where: {
        id: goal.id,
      },
      data: {
        progress,
      },
    })
  } else if (task.completed && task.milestone.completed) {
    // If a task is being uncompleted and the milestone was completed, uncomplete it
    await prisma.milestone.update({
      where: {
        id: task.milestone.id,
      },
      data: {
        completed: false,
      },
    })

    // Update goal progress
    const goal = task.milestone.goal
    const milestones = await prisma.milestone.findMany({
      where: {
        goalId: goal.id,
      },
    })

    const completedMilestones = milestones.filter((m) => (m.id === task.milestone.id ? false : m.completed)).length
    const totalMilestones = milestones.length
    const progress = Math.round((completedMilestones / totalMilestones) * 100)

    await prisma.goal.update({
      where: {
        id: goal.id,
      },
      data: {
        progress,
      },
    })
  }

  revalidatePath("/dashboard/goals")

  return updatedTask
}

export async function deleteGoal(goalId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a goal")
  }

  const goal = await prisma.goal.findUnique({
    where: {
      id: goalId,
    },
  })

  if (!goal || goal.userId !== session.user.id) {
    throw new Error("Goal not found or you don't have permission")
  }

  // Delete all related tasks and milestones
  const milestones = await prisma.milestone.findMany({
    where: {
      goalId: goalId,
    },
  })

  for (const milestone of milestones) {
    await prisma.task.deleteMany({
      where: {
        milestoneId: milestone.id,
      },
    })
  }

  await prisma.milestone.deleteMany({
    where: {
      goalId: goalId,
    },
  })

  // Delete the goal
  await prisma.goal.delete({
    where: {
      id: goalId,
    },
  })

  revalidatePath("/dashboard/goals")

  return { success: true }
}

export async function deleteMilestone(milestoneId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a milestone")
  }

  const milestone = await prisma.milestone.findUnique({
    where: {
      id: milestoneId,
    },
    include: {
      goal: true,
    },
  })

  if (!milestone || milestone.userId !== session.user.id) {
    throw new Error("Milestone not found or you don't have permission")
  }

  // Delete all related tasks
  await prisma.task.deleteMany({
    where: {
      milestoneId: milestoneId,
    },
  })

  // Delete the milestone
  await prisma.milestone.delete({
    where: {
      id: milestoneId,
    },
  })

  // Update goal progress
  const goal = milestone.goal
  const milestones = await prisma.milestone.findMany({
    where: {
      goalId: goal.id,
      id: {
        not: milestoneId,
      },
    },
  })

  const completedMilestones = milestones.filter((m) => m.completed).length
  const totalMilestones = milestones.length
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  await prisma.goal.update({
    where: {
      id: goal.id,
    },
    data: {
      progress,
    },
  })

  revalidatePath("/dashboard/goals")

  return { success: true }
}

export async function deleteTask(taskId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a task")
  }

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      milestone: {
        include: {
          goal: true,
        },
      },
    },
  })

  if (!task || task.userId !== session.user.id) {
    throw new Error("Task not found or you don't have permission")
  }

  // Delete the task
  await prisma.task.delete({
    where: {
      id: taskId,
    },
  })

  // If the task was completed, we need to check if this affects milestone completion
  if (task.completed && task.milestone.completed) {
    // Check if all remaining tasks are still completed
    const remainingTasks = await prisma.task.findMany({
      where: {
        milestoneId: task.milestone.id,
        id: {
          not: taskId,
        },
      },
    })

    const allTasksCompleted = remainingTasks.length > 0 && remainingTasks.every((t) => t.completed)

    if (!allTasksCompleted) {
      // Update milestone completion status
      await prisma.milestone.update({
        where: {
          id: task.milestone.id,
        },
        data: {
          completed: false,
        },
      })

      // Update goal progress
      const goal = task.milestone.goal
      const milestones = await prisma.milestone.findMany({
        where: {
          goalId: goal.id,
        },
      })

      const completedMilestones = milestones.filter((m) => (m.id === task.milestone.id ? false : m.completed)).length
      const totalMilestones = milestones.length
      const progress = Math.round((completedMilestones / totalMilestones) * 100)

      await prisma.goal.update({
        where: {
          id: goal.id,
        },
        data: {
          progress,
        },
      })
    }
  }

  revalidatePath("/dashboard/goals")

  return { success: true }
}

