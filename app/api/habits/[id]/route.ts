import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habitId = params.id;

  // Delete completions first
  await prisma.habitCompletion.deleteMany({
    where: {
      habitId,
      userId: session.user.id,
    },
  });

  // Delete habit
  await prisma.habit.delete({
    where: {
      id: habitId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
