// app/api/habits/toggle/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, date, completed } = await request.json();

    if (!habitId) {
      return NextResponse.json(
        { error: "Habit ID is required" },
        { status: 400 }
      );
    }

    // Convert string date to DateTime object
    const dateObj = new Date(date);

    // Check if the habit exists and belongs to the user
    const habit = await prisma.habit.findUnique({
      where: {
        id: habitId,
        userId: session.user.id,
      },
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Habit not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if a completion record already exists for this date
    const existingCompletion = await prisma.habitCompletion.findFirst({
      where: {
        habitId,
        userId: session.user.id,
        date: dateObj,
      },
    });

    let completion;
    if (existingCompletion) {
      // Update existing completion
      completion = await prisma.habitCompletion.update({
        where: {
          id: existingCompletion.id,
        },
        data: {
          completed,
        },
      });
    } else {
      // Create new completion
      completion = await prisma.habitCompletion.create({
        data: {
          date: dateObj,
          completed,
          notes: "",
          habit: {
            connect: {
              id: habitId,
            },
          },
          user: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
    }

    // Get the updated habit with its completions
    const updatedHabit = await prisma.habit.findUnique({
      where: {
        id: habitId,
      },
      include: {
        completions: true,
      },
    });

    return NextResponse.json(updatedHabit);
  } catch (error) {
    console.error("Error in toggle API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
