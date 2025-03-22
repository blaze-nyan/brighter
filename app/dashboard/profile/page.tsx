"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BarChart,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  ListTodo,
  Target,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getUserProfile, getUserStats } from "@/lib/actions/user";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    async function loadProfile() {
      try {
        setLoading(true);
        const [profileData, statsData] = await Promise.all([
          getUserProfile(),
          getUserStats(),
        ]);

        setProfile(profileData);
        setStats(statsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      loadProfile();
    }
  }, [status, router, toast]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p>Failed to load profile data. Please try again later.</p>
            <Button onClick={() => router.refresh()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src={profile.image || ""}
                alt={profile.name || "User"}
              />
              <AvatarFallback className="text-xl">
                {getInitials(profile.name || "")}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile.name || "User"}</h2>
            <p className="text-muted-foreground">{profile.email}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => router.push("/dashboard/settings")}
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Your productivity at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                <ListTodo className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{stats.todoCount}</span>
                <span className="text-xs text-muted-foreground">Tasks</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{stats.noteCount}</span>
                <span className="text-xs text-muted-foreground">Notes</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{stats.habitCount}</span>
                <span className="text-xs text-muted-foreground">Habits</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                <Target className="h-8 w-8 text-primary mb-2" />
                <span className="text-2xl font-bold">{stats.goalCount}</span>
                <span className="text-xs text-muted-foreground">Goals</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stats" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion</CardTitle>
                <CardDescription>Your task completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <span className="font-medium">
                      {stats.completedTodoCount} of {stats.todoCount}
                    </span>
                  </div>
                  <Progress value={stats.todoCompletionRate} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    You've completed {stats.todoCompletionRate.toFixed(1)}% of
                    your tasks.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>Your goal completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <span className="font-medium">
                      {stats.completedGoalCount} of {stats.goalCount}
                    </span>
                  </div>
                  <Progress value={stats.goalCompletionRate} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    You've completed {stats.goalCompletionRate.toFixed(1)}% of
                    your goals.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.totalPomodoroMinutes} min
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across {stats.pomodoroCount} sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Journal Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.journalCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.journalsPerWeek.toFixed(1)} entries per week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{stats.bookCount}</div>
                    <p className="text-xs text-muted-foreground">
                      In your collection
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions in the app</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* This would be populated with real activity data */}
                <div className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Completed a task
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You marked "Finish project proposal" as complete
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Today at 10:30 AM
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Created a goal
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You created "Learn TypeScript" goal
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Yesterday at 2:15 PM
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4 flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Added a journal entry
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You wrote a new journal entry
                    </p>
                    <p className="text-xs text-muted-foreground">
                      2 days ago at 9:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your productivity milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Productivity Streak</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed tasks for 7 consecutive days
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Goal Achiever</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed 5 goals
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Focus Master</h3>
                    <p className="text-sm text-muted-foreground">
                      Accumulated 10 hours of focus time
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Bookworm</h3>
                    <p className="text-sm text-muted-foreground">
                      Added 10 books to your collection
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
