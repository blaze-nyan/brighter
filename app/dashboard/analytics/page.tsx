"use client";

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Activity, Clock, Target, Repeat } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAnalyticsData } from "@/lib/actions/analytics";
import { useToast } from "@/hooks/use-toast";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to get days in current month
  const getDaysInMonth = () => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  };

  const daysInMonth = getDaysInMonth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getAnalyticsData(timeRange);
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, toast]);

  // Calculate habit streak
  const getStreakCount = (habit: { streak: number }) => {
    return habit.streak;
  };

  // Calculate habit completion rate
  const getCompletionRate = (habit: { completionRate: number }) => {
    return habit.completionRate;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Loading your analytics data...
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-4 w-4 bg-muted rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-2"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your progress and insights across all areas
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Energy Level
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.stats.averageEnergyLevel}%
            </div>
            <p className="text-xs text-muted-foreground">
              Based on your energy logs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pomodoro Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.stats.totalPomodoroSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              Total sessions in selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Habit Completion Rate
            </CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.stats.averageHabitCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all habits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.stats.averageGoalProgress}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all goals
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="productivity">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Energy Levels</CardTitle>
                <CardDescription>Your energy levels over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full">
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full items-end space-x-2">
                    {analyticsData.energyData
                      .slice(-14)
                      .map((day: any, i: number) => (
                        <div
                          key={i}
                          className="relative flex h-full w-full flex-col items-center justify-end"
                        >
                          <div
                            className="w-full bg-primary rounded-t"
                            style={{ height: `${day.value}%` }}
                          />
                          <span className="mt-1 text-xs text-muted-foreground">
                            {format(new Date(day.date), "dd")}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pomodoro Sessions</CardTitle>
                <CardDescription>Your focus sessions over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full">
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm">This Week</span>
                        <span className="ml-auto font-bold">
                          {analyticsData.pomodoroData
                            .slice(-7)
                            .reduce(
                              (acc: number, curr: any) => acc + curr.count,
                              0
                            )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-muted" />
                        <span className="text-sm">Last Week</span>
                        <span className="ml-auto font-bold">
                          {analyticsData.pomodoroData
                            .slice(-14, -7)
                            .reduce(
                              (acc: number, curr: any) => acc + curr.count,
                              0
                            )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary/50" />
                        <span className="text-sm">Average Daily</span>
                        <span className="ml-auto font-bold">
                          {(
                            analyticsData.pomodoroData.reduce(
                              (acc: number, curr: any) => acc + curr.count,
                              0
                            ) / analyticsData.pomodoroData.length
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-[200px] items-end space-x-2">
                      {analyticsData.pomodoroData
                        .slice(-7)
                        .map((day: any, i: number) => (
                          <div
                            key={i}
                            className="relative flex h-full w-full flex-col items-center justify-end"
                          >
                            <div
                              className="w-full bg-primary rounded-t"
                              style={{
                                height: `${(day.count / 8) * 100}%`,
                              }}
                            />
                            <span className="mt-1 text-xs text-muted-foreground">
                              {format(new Date(day.date), "EEE")}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Habit Completion</CardTitle>
                <CardDescription>
                  Your habit consistency over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {analyticsData.habitCompletionRates.map((habit: any) => (
                    <div key={habit.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {habit.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getCompletionRate(habit)}% completion rate
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">
                            {getStreakCount(habit)} day streak
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${getCompletionRate(habit)}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {analyticsData.habitCompletionRates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground">
                        No habits added yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Habit Insights</CardTitle>
                <CardDescription>Key metrics about your habits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.habitCompletionRates.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Best Performing Habit
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">
                            {analyticsData.habitCompletionRates.sort(
                              (a: any, b: any) =>
                                getCompletionRate(b) - getCompletionRate(a)
                            )[0]?.name || "N/A"}
                          </p>
                          <p className="text-sm font-bold">
                            {getCompletionRate(
                              analyticsData.habitCompletionRates.sort(
                                (a: any, b: any) =>
                                  getCompletionRate(b) - getCompletionRate(a)
                              )[0]
                            )}
                            %
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Longest Streak</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">
                            {analyticsData.habitCompletionRates.sort(
                              (a: any, b: any) =>
                                getStreakCount(b) - getStreakCount(a)
                            )[0]?.name || "N/A"}
                          </p>
                          <p className="text-sm font-bold">
                            {getStreakCount(
                              analyticsData.habitCompletionRates.sort(
                                (a: any, b: any) =>
                                  getStreakCount(b) - getStreakCount(a)
                              )[0]
                            )}{" "}
                            days
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Needs Improvement</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">
                            {analyticsData.habitCompletionRates.sort(
                              (a: any, b: any) =>
                                getCompletionRate(a) - getCompletionRate(b)
                            )[0]?.name || "N/A"}
                          </p>
                          <p className="text-sm font-bold">
                            {getCompletionRate(
                              analyticsData.habitCompletionRates.sort(
                                (a: any, b: any) =>
                                  getCompletionRate(a) - getCompletionRate(b)
                              )[0]
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {analyticsData.habitCompletionRates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground">
                        No habits added yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Skills Progress</CardTitle>
                <CardDescription>
                  Your skill development over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {analyticsData.skills.map((skill: any) => (
                    <div key={skill.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {skill.name}
                        </p>
                        <p className="text-sm font-medium">{skill.progress}%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {analyticsData.skills.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground">
                        No skills added yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
                <CardDescription>
                  Your learning sessions over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="mr-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Total Learning Hours
                      </p>
                      <p className="text-3xl font-bold">
                        {analyticsData.skills
                          .reduce(
                            (sum: number, skill: any) =>
                              sum + (skill.hoursSpent || 0),
                            0
                          )
                          .toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {analyticsData.skills
                      .slice(0, 5)
                      .map((skill: any, index: number) => (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div
                              className={`mr-2 h-4 w-4 rounded-full ${
                                index === 0
                                  ? "bg-primary"
                                  : index === 1
                                  ? "bg-blue-500"
                                  : index === 2
                                  ? "bg-green-500"
                                  : index === 3
                                  ? "bg-purple-500"
                                  : "bg-yellow-500"
                              }`}
                            />
                            <p className="text-sm">{skill.name}</p>
                          </div>
                          <p className="text-sm font-medium">
                            {skill.hoursSpent?.toFixed(1) || "0"} hrs
                          </p>
                        </div>
                      ))}

                    {analyticsData.skills.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-muted-foreground">
                          No skills added yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Mood Tracking</CardTitle>
                <CardDescription>
                  Your emotional patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full">
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full items-center justify-center">
                    <div className="grid grid-cols-3 gap-4">
                      {analyticsData.moodData.map((mood: any) => (
                        <div
                          key={mood.name}
                          className="flex flex-col items-center"
                        >
                          <div className="mb-2 h-32 w-8 bg-primary/20 rounded-full relative overflow-hidden">
                            <div
                              className="absolute bottom-0 w-full bg-primary rounded-full"
                              style={{ height: `${mood.value}%` }}
                            />
                          </div>
                          <span className="text-sm">{mood.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {mood.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Journal Activity</CardTitle>
                <CardDescription>Your journaling patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Most Common Moods</p>
                    <div className="space-y-1">
                      {analyticsData.moodData
                        .sort((a: any, b: any) => b.value - a.value)
                        .slice(0, 3)
                        .map((mood: any) => (
                          <div
                            key={mood.name}
                            className="flex items-center justify-between"
                          >
                            <p className="text-sm">{mood.name}</p>
                            <p className="text-sm font-bold">{mood.value}%</p>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Most Used Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(
                          analyticsData.journalEntries?.flatMap(
                            (entry: any) => entry.tags || []
                          ) || []
                        )
                      )
                        .slice(0, 5)
                        .map((tag: any) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}

                      {(!analyticsData.journalEntries ||
                        analyticsData.journalEntries.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No journal entries yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>
                  Your financial balance over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full">
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full items-end space-x-6">
                    {analyticsData.monthlyFinancialData.map(
                      (month: any, i: number) => (
                        <div
                          key={i}
                          className="flex w-full flex-col items-center space-y-2"
                        >
                          <div className="flex w-full flex-col items-center">
                            <div
                              className="w-full bg-green-500 rounded-t"
                              style={{
                                height: `${(month.income / 5000) * 200}px`,
                              }}
                            />
                            <div
                              className="w-full bg-red-500 rounded-b"
                              style={{
                                height: `${(month.expenses / 5000) * 200}px`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {month.month}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.expenseCategories.map((category: any) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-sm font-bold">{category.value}%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${category.value}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {analyticsData.expenseCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground">
                        No transactions added yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Goal Progress</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {analyticsData.goals.map((goal: any) => (
            <Card key={goal.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    <CardDescription>
                      {goal.category || "General"}
                    </CardDescription>
                  </div>
                  <Badge>{goal.progress}%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {analyticsData.goals.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-muted-foreground">No goals added yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
