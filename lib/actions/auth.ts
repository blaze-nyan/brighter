"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import prisma from "@/lib/db";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  revalidatePath("/login");

  return { success: true };
}
