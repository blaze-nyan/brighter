-- CreateTable
CREATE TABLE "MeditationSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeditationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelaxationSound" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "src" TEXT NOT NULL,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelaxationSound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteRelaxationSound" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "soundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavoriteRelaxationSound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteRelaxationSound_userId_soundId_key" ON "FavoriteRelaxationSound"("userId", "soundId");

-- AddForeignKey
ALTER TABLE "MeditationSession" ADD CONSTRAINT "MeditationSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteRelaxationSound" ADD CONSTRAINT "FavoriteRelaxationSound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteRelaxationSound" ADD CONSTRAINT "FavoriteRelaxationSound_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "RelaxationSound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
