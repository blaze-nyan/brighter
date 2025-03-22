"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getRelaxationSounds,
  getFavoriteSounds,
  toggleFavoriteSound,
  seedRelaxationSounds,
  type RelaxationSound,
} from "@/lib/actions/relaxation";

export default function RelaxationPage() {
  const { toast } = useToast();
  const [sounds, setSounds] = useState<RelaxationSound[]>([]);
  const [currentSound, setCurrentSound] = useState<RelaxationSound | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch sounds and favorites
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Seed sounds if needed
        await seedRelaxationSounds();

        // Get sounds and favorites
        const [soundsResult, favoritesResult] = await Promise.all([
          getRelaxationSounds(),
          getFavoriteSounds(),
        ]);

        if ("sounds" in soundsResult && soundsResult.sounds) {
          setSounds(soundsResult.sounds);
        }

        if ("favorites" in favoritesResult) {
          setFavorites(favoritesResult.favorites || []);
        }
      } catch (error) {
        console.error("Error fetching relaxation data:", error);
        toast({
          title: "Error",
          description: "Failed to load relaxation sounds",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Update audio when current sound changes
  useEffect(() => {
    if (audioRef.current && currentSound) {
      audioRef.current.src = currentSound.src;
      audioRef.current.volume = volume / 100;

      if (isPlaying) {
        audioRef.current.play().catch((e) => {
          console.error("Error playing audio:", e);
          setIsPlaying(false);
        });
      }

      // Set up time update interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || currentSound.duration);

          // Check if sound has ended
          if (audioRef.current.ended) {
            playNextSound();
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentSound]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Play/pause sound
  const togglePlay = () => {
    if (!currentSound) {
      // If no sound is selected, play the first one
      const firstSound = filteredSounds[0];
      if (firstSound) {
        setCurrentSound(firstSound);
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e) => {
          console.error("Error playing audio:", e);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Play next sound
  const playNextSound = () => {
    if (!currentSound) return;

    const currentIndex = filteredSounds.findIndex(
      (sound) => sound.id === currentSound.id
    );
    const nextIndex = (currentIndex + 1) % filteredSounds.length;
    setCurrentSound(filteredSounds[nextIndex]);
    setIsPlaying(true);
  };

  // Play previous sound
  const playPreviousSound = () => {
    if (!currentSound) return;

    const currentIndex = filteredSounds.findIndex(
      (sound) => sound.id === currentSound.id
    );
    const prevIndex =
      (currentIndex - 1 + filteredSounds.length) % filteredSounds.length;
    setCurrentSound(filteredSounds[prevIndex]);
    setIsPlaying(true);
  };

  // Toggle favorite
  const handleToggleFavorite = async (soundId: string) => {
    try {
      const result = await toggleFavoriteSound(soundId);

      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Update favorites
      if (result.isFavorite) {
        setFavorites([...favorites, soundId]);
      } else {
        setFavorites(favorites.filter((id) => id !== soundId));
      }

      toast({
        title: result.isFavorite
          ? "Added to favorites"
          : "Removed from favorites",
        description: `Sound has been ${
          result.isFavorite ? "added to" : "removed from"
        } your favorites.`,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  // Filter sounds by category
  const filteredSounds = sounds.filter((sound) =>
    activeCategory === "all"
      ? true
      : activeCategory === "favorites"
      ? favorites.includes(sound.id)
      : sound.category === activeCategory
  );

  // Get unique categories
  const categories = [
    "all",
    "favorites",
    ...Array.from(new Set(sounds.map((sound) => sound.category))),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relaxation Sounds</h1>
        <p className="text-muted-foreground">
          Calming sounds to help you relax, focus, or sleep
        </p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-48 w-48 overflow-hidden rounded-lg">
              <img
                src={
                  currentSound?.coverImage ||
                  "/placeholder.svg?height=200&width=200"
                }
                alt={currentSound?.title || "Select a sound"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold">
                {currentSound?.title || "Select a sound to play"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentSound?.category || ""}
              </p>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <Progress value={(currentTime / duration) * 100} />
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={playPreviousSound}
                disabled={!currentSound}
              >
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={playNextSound}
                disabled={!currentSound}
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex w-full items-center space-x-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0])}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Tabs defaultValue="all" onValueChange={setActiveCategory}>
          <TabsList className="flex w-full overflow-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded bg-muted"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-24 rounded bg-muted"></div>
                        <div className="h-3 w-16 rounded bg-muted"></div>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-muted"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredSounds.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                No sounds found in this category
              </p>
            </div>
          ) : (
            filteredSounds.map((sound) => (
              <Card
                key={sound.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  currentSound?.id === sound.id ? "border-primary" : ""
                }`}
                onClick={() => {
                  setCurrentSound(sound);
                  setIsPlaying(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded">
                        <img
                          src={
                            sound.coverImage ||
                            "/placeholder.svg?height=48&width=48"
                          }
                          alt={sound.title}
                          className="h-full w-full object-cover"
                        />
                        {currentSound?.id === sound.id && isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Pause className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{sound.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {sound.category} • {formatTime(sound.duration)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(sound.id);
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(sound.id)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
