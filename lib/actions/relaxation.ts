"use server";

import prisma from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";

// Types
export type RelaxationSound = {
  id: string;
  title: string;
  category: string;
  duration: number; // in seconds
  src: string;
  coverImage?: string | null;
};

export type FavoriteSound = {
  id: string;
  userId: string;
  soundId: string;
};

// Get all relaxation sounds
export async function getRelaxationSounds() {
  try {
    const sounds = await prisma.relaxationSound.findMany({
      orderBy: {
        title: "asc",
      },
    });

    return { sounds };
  } catch (error) {
    console.error("Error fetching relaxation sounds:", error);
    return { error: "Failed to fetch relaxation sounds" };
  }
}

// Get favorite sounds for the current user
export async function getFavoriteSounds() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const favorites = await prisma.favoriteRelaxationSound.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        sound: true,
      },
    });

    return {
      favorites: favorites.map((fav) => fav.soundId),
      favoriteSounds: favorites.map((fav) => fav.sound),
    };
  } catch (error) {
    console.error("Error fetching favorite sounds:", error);
    return { error: "Failed to fetch favorite sounds" };
  }
}

// Toggle favorite status for a sound
export async function toggleFavoriteSound(soundId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    // Check if the sound is already a favorite
    const existingFavorite = await prisma.favoriteRelaxationSound.findFirst({
      where: {
        userId: session.user.id,
        soundId,
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoriteRelaxationSound.delete({
        where: {
          id: existingFavorite.id,
        },
      });
    } else {
      // Add to favorites
      await prisma.favoriteRelaxationSound.create({
        data: {
          userId: session.user.id,
          soundId,
        },
      });
    }

    revalidatePath("/dashboard/relaxation");
    return { success: true, isFavorite: !existingFavorite };
  } catch (error) {
    console.error("Error toggling favorite sound:", error);
    return { error: "Failed to update favorite status" };
  }
}

// Seed initial relaxation sounds if none exist
export async function seedRelaxationSounds() {
  try {
    const existingSounds = await prisma.relaxationSound.count();

    if (existingSounds === 0) {
      const soundsData = [
        {
          title: "Gentle Rain",
          category: "Nature",
          duration: 180, // 3 minutes
          src: "/sounds/rain.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Ocean Waves",
          category: "Nature",
          duration: 240, // 4 minutes
          src: "/sounds/ocean.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Forest Birds",
          category: "Nature",
          duration: 210, // 3.5 minutes
          src: "/sounds/forest.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Meditation Bells",
          category: "Meditation",
          duration: 300, // 5 minutes
          src: "/sounds/bells.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Deep Relaxation",
          category: "Meditation",
          duration: 360, // 6 minutes
          src: "/sounds/relaxation.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Calm Piano",
          category: "Music",
          duration: 270, // 4.5 minutes
          src: "/sounds/piano.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "Ambient Melody",
          category: "Music",
          duration: 330, // 5.5 minutes
          src: "/sounds/ambient.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
        {
          title: "White Noise",
          category: "Noise",
          duration: 240, // 4 minutes
          src: "/sounds/white-noise.mp3",
          coverImage: "/placeholder.svg?height=200&width=200",
        },
      ];

      await prisma.relaxationSound.createMany({
        data: soundsData,
      });

      return {
        success: true,
        message: "Relaxation sounds seeded successfully",
      };
    }

    return { success: true, message: "Relaxation sounds already exist" };
  } catch (error) {
    console.error("Error seeding relaxation sounds:", error);
    return { error: "Failed to seed relaxation sounds" };
  }
}
