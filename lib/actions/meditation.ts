"use server";

import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { format, subDays } from "date-fns";

// Types
export type MeditationSession = {
  id: string;
  date: Date;
  duration: number; // in seconds
  type: string;
  notes?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Get meditation sessions for the current user
export async function getMeditationSessions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const sessions = await prisma.meditationSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { sessions };
  } catch (error) {
    console.error("Error fetching meditation sessions:", error);
    return { error: "Failed to fetch meditation sessions" };
  }
}

// Save a new meditation session
export async function saveMeditationSession(
  duration: number,
  type: string,
  notes?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  if (duration < 30) {
    return { error: "Session too short" };
  }

  try {
    const meditationSession = await prisma.meditationSession.create({
      data: {
        date: new Date(),
        duration,
        type,
        notes: notes || null,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/meditation");
    return { success: true, session: meditationSession };
  } catch (error) {
    console.error("Error saving meditation session:", error);
    return { error: "Failed to save meditation session" };
  }
}

// Get meditation stats
export async function getMeditationStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const sessions = await prisma.meditationSession.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Calculate total meditation time
    const totalMeditationTime = sessions.reduce(
      (total, session) => total + session.duration,
      0
    );

    // Calculate average session duration
    const averageSessionDuration =
      sessions.length > 0 ? totalMeditationTime / sessions.length : 0;

    // Find longest session
    const longestSession =
      sessions.length > 0 ? Math.max(...sessions.map((s) => s.duration)) : 0;

    // Get last 7 days data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const formattedDate = format(date, "yyyy-MM-dd");

      const sessionsOnDay = sessions.filter(
        (s) => format(s.date, "yyyy-MM-dd") === formattedDate
      );

      const minutesOnDay = sessionsOnDay.reduce(
        (total, s) => total + Math.floor(s.duration / 60),
        0
      );

      return {
        date: format(date, "EEE"),
        minutes: minutesOnDay,
      };
    });

    return {
      totalSessions: sessions.length,
      totalTime: totalMeditationTime,
      averageSessionDuration,
      longestSession,
      last7Days,
      recentSessions: sessions.slice(0, 3),
    };
  } catch (error) {
    console.error("Error fetching meditation stats:", error);
    return { error: "Failed to fetch meditation stats" };
  }
}
