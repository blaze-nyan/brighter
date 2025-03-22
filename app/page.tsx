"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Brain, Clock, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/actions/dashboard";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Loading your productivity data...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
                <div className="h-2 w-full bg-muted rounded mt-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your productivity.
        </p>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Energy Level
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.averageEnergy || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average from recent logs
                </p>
                <Progress
                  value={dashboardData?.stats.averageEnergy || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Focus Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.pomodoroTime || "0h 0m"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.stats.pomodoroCount || 0} pomodoro sessions
                </p>
                <Progress
                  value={Math.min(
                    (dashboardData?.stats.pomodoroCount || 0) * 5,
                    100
                  )}
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Skills Progress
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.skills.length || 0} skills
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.skills
                    .reduce(
                      (total: number, skill: any) => total + skill.hoursSpent,
                      0
                    )
                    .toFixed(1) || 0}{" "}
                  hours of practice
                </p>
                <Progress
                  value={Math.min(
                    (dashboardData?.skills.length || 0) * 20,
                    100
                  )}
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Notes Created
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.notesCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total notes in your collection
                </p>
                <Progress
                  value={Math.min(
                    (dashboardData?.stats.notesCount || 0) * 10,
                    100
                  )}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Weekly Energy Levels</CardTitle>
                <CardDescription>
                  Your energy levels over the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-end justify-between">
                  {(dashboardData?.energyLogs || [])
                    .slice(0, 7)
                    .map((log: any, i: number) => (
                      <div
                        key={i}
                        className="relative flex flex-col items-center"
                      >
                        <div
                          className="w-12 bg-primary rounded-t-md"
                          style={{ height: `${log.energyLevel * 2}px` }}
                        ></div>
                        <span className="text-xs mt-2">
                          {new Date(log.date).toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </span>
                      </div>
                    ))}

                  {/* Fill with empty bars if we have less than 7 logs */}
                  {Array.from({
                    length: Math.max(
                      0,
                      7 - (dashboardData?.energyLogs || []).length
                    ),
                  }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="relative flex flex-col items-center"
                    >
                      <div className="w-12 bg-muted rounded-t-md h-0"></div>
                      <span className="text-xs mt-2 text-muted-foreground">
                        -
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
                <CardDescription>Your most practiced skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.skills || []).map((skill: any) => (
                    <div key={skill.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {skill.name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {skill.hoursSpent.toFixed(1)}h
                        </span>
                      </div>
                      <Progress value={skill.progress} />
                    </div>
                  ))}

                  {/* Show placeholder if no skills */}
                  {(dashboardData?.skills || []).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground">
                        No skills added yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Habit Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.habitCompletionRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average habit completion rate
                </p>
                <Progress
                  value={dashboardData?.stats.habitCompletionRate || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Journal Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.journalCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total journal entries
                </p>
                <Progress
                  value={Math.min(
                    (dashboardData?.stats.journalCount || 0) * 10,
                    100
                  )}
                  className="mt-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Task Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.stats.todoCompletionRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Tasks completed on time
                </p>
                <Progress
                  value={dashboardData?.stats.todoCompletionRate || 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>
                Your activity trends over the past month
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full flex items-end space-x-2">
                {(dashboardData?.activityData || []).map(
                  (data: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex justify-center space-x-1">
                        <div
                          className="w-3 bg-primary rounded-t-sm"
                          style={{ height: `${(data.energy / 100) * 200}px` }}
                          title={`Energy: ${data.energy}%`}
                        ></div>
                        <div
                          className="w-3 bg-blue-400 rounded-t-sm"
                          style={{ height: `${(data.focus / 100) * 200}px` }}
                          title={`Focus: ${data.focus}%`}
                        ></div>
                        <div
                          className="w-3 bg-green-400 rounded-t-sm"
                          style={{ height: `${(data.habits / 100) * 200}px` }}
                          title={`Habits: ${data.habits}%`}
                        ></div>
                      </div>
                      <span className="text-xs mt-2 rotate-45 origin-left translate-y-2">
                        {data.date}
                      </span>
                    </div>
                  )
                )}
                {(dashboardData?.activityData || []).length === 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No activity data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Goal Progress</CardTitle>
                <CardDescription>
                  Your active goals and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.goals || []).slice(0, 5).map((goal: any) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {goal.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {goal.progress}%
                        </span>
                      </div>
                      <Progress value={goal.progress} />
                      {goal.targetDate && (
                        <p className="text-xs text-muted-foreground">
                          Target:{" "}
                          {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                  {(dashboardData?.goals || []).length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No goals added yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Milestones</CardTitle>
                <CardDescription>Recently completed milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.recentMilestones || []).map(
                    (milestone: any) => (
                      <div
                        key={milestone.id}
                        className="flex items-start space-x-3 border-l-2 border-green-500 pl-3"
                      >
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {milestone.goalTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completed:{" "}
                            {new Date(
                              milestone.completedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                  {(dashboardData?.recentMilestones || []).length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No completed milestones yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
