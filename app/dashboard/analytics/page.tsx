"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { Activity, Clock, Target, Repeat } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for charts
const generateMockData = () => {
  // Energy levels for the past 30 days
  const energyData = Array.from({ length: 30 }, (_, i) => ({
    date: subDays(new Date(), 29 - i),
    value: Math.floor(Math.random() * 50) + 50, // Random value between 50-100
  }))

  // Pomodoro sessions for the past 30 days
  const pomodoroData = Array.from({ length: 30 }, (_, i) => ({
    date: subDays(new Date(), 29 - i),
    count: Math.floor(Math.random() * 8), // Random count between 0-8
  }))

  // Skill progress
  const skillsData = [
    { name: "JavaScript", progress: 75 },
    { name: "React", progress: 65 },
    { name: "Node.js", progress: 45 },
    { name: "CSS", progress: 80 },
    { name: "Python", progress: 30 },
  ]

  // Habit completion for the past 30 days
  const habitsData = [
    {
      name: "Morning Meditation",
      completions: Array.from({ length: 30 }, (_, i) => ({
        date: subDays(new Date(), 29 - i),
        completed: Math.random() > 0.3, // 70% chance of completion
      })),
    },
    {
      name: "Exercise",
      completions: Array.from({ length: 30 }, (_, i) => ({
        date: subDays(new Date(), 29 - i),
        completed: Math.random() > 0.4, // 60% chance of completion
      })),
    },
    {
      name: "Reading",
      completions: Array.from({ length: 30 }, (_, i) => ({
        date: subDays(new Date(), 29 - i),
        completed: Math.random() > 0.5, // 50% chance of completion
      })),
    },
  ]

  // Mood data from journal entries
  const moodData = [
    { name: "Happy", value: 35 },
    { name: "Calm", value: 25 },
    { name: "Productive", value: 20 },
    { name: "Tired", value: 10 },
    { name: "Anxious", value: 5 },
    { name: "Sad", value: 5 },
  ]

  // Financial data
  const financialData = {
    income: Array.from({ length: 6 }, (_, i) => ({
      month: format(subDays(new Date(), (5 - i) * 30), "MMM"),
      amount: Math.floor(Math.random() * 2000) + 3000, // Random amount between 3000-5000
    })),
    expenses: Array.from({ length: 6 }, (_, i) => ({
      month: format(subDays(new Date(), (5 - i) * 30), "MMM"),
      amount: Math.floor(Math.random() * 1500) + 1500, // Random amount between 1500-3000
    })),
    categories: [
      { name: "Housing", value: 35 },
      { name: "Food", value: 20 },
      { name: "Transportation", value: 15 },
      { name: "Entertainment", value: 10 },
      { name: "Utilities", value: 10 },
      { name: "Other", value: 10 },
    ],
  }

  // Goal progress
  const goalsData = [
    { name: "Learn JavaScript", progress: 75, category: "Learning" },
    { name: "Run a Half Marathon", progress: 40, category: "Health" },
    { name: "Read 20 Books", progress: 60, category: "Personal" },
    { name: "Save $10,000", progress: 30, category: "Finance" },
  ]

  return {
    energyData,
    pomodoroData,
    skillsData,
    habitsData,
    moodData,
    financialData,
    goalsData,
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days")
  const [mockData] = useState(generateMockData())

  // Helper function to get days in current month
  const getDaysInMonth = () => {
    const start = startOfMonth(new Date())
    const end = endOfMonth(new Date())
    return eachDayOfInterval({ start, end })
  }

  const daysInMonth = getDaysInMonth()

  // Calculate habit streak
  const getStreakCount = (habit: { name: string; completions: { date: Date; completed: boolean }[] }) => {
    let streak = 0
    let currentDate = new Date()

    while (true) {
      const completion = habit.completions.find((c) => isSameDay(c.date, currentDate))

      if (completion && completion.completed) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else {
        break
      }
    }

    return streak
  }

  // Calculate habit completion rate
  const getCompletionRate = (habit: { name: string; completions: { date: Date; completed: boolean }[] }) => {
    const completions = habit.completions.filter(Boolean)

    if (completions.length === 0) return 0

    const completedCount = completions.filter((c) => c.completed).length
    return Math.round((completedCount / completions.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and insights across all areas</p>
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
            <CardTitle className="text-sm font-medium">Average Energy Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockData.energyData.reduce((acc, curr) => acc + curr.value, 0) / mockData.energyData.length)}%
            </div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pomodoro Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.pomodoroData.reduce((acc, curr) => acc + curr.count, 0)}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habit Completion Rate</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                mockData.habitsData.reduce((acc, habit) => acc + getCompletionRate(habit), 0) /
                  mockData.habitsData.length,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockData.goalsData.reduce((acc, goal) => acc + goal.progress, 0) / mockData.goalsData.length)}
              %
            </div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
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
                <CardDescription>Your energy levels over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full">
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full items-end space-x-2">
                    {mockData.energyData.slice(-14).map((day, i) => (
                      <div key={i} className="relative flex h-full w-full flex-col items-center justify-end">
                        <div className="w-full bg-primary rounded-t" style={{ height: `${day.value}%` }} />
                        <span className="mt-1 text-xs text-muted-foreground">{format(day.date, "dd")}</span>
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
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary" />
                        <span className="text-sm">This Week</span>
                        <span className="ml-auto font-bold">
                          {mockData.pomodoroData.slice(-7).reduce((acc, curr) => acc + curr.count, 0)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-muted" />
                        <span className="text-sm">Last Week</span>
                        <span className="ml-auto font-bold">
                          {mockData.pomodoroData.slice(-14, -7).reduce((acc, curr) => acc + curr.count, 0)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary/50" />
                        <span className="text-sm">Average Daily</span>
                        <span className="ml-auto font-bold">
                          {(
                            mockData.pomodoroData.reduce((acc, curr) => acc + curr.count, 0) /
                            mockData.pomodoroData.length
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-[200px] items-end space-x-2">
                      {mockData.pomodoroData.slice(-7).map((day, i) => (
                        <div key={i} className="relative flex h-full w-full flex-col items-center justify-end">
                          <div
                            className="w-full bg-primary rounded-t"
                            style={{
                              height: `${(day.count / 8) * 100}%`,
                            }}
                          />
                          <span className="mt-1 text-xs text-muted-foreground">{format(day.date, "EEE")}</span>
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
                <CardDescription>Your habit consistency over the past month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {mockData.habitsData.map((habit) => (
                    <div key={habit.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{habit.name}</p>
                          <p className="text-sm text-muted-foreground">{getCompletionRate(habit)}% completion rate</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">{getStreakCount(habit)} day streak</div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {daysInMonth.map((day, i) => {
                          const completion = habit.completions.find((c) => isSameDay(c.date, day))
                          return (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-sm ${
                                completion?.completed ? "bg-primary" : completion ? "bg-destructive/50" : "bg-muted"
                              }`}
                              title={format(day, "MMM d")}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
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
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Best Performing Habit</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        {mockData.habitsData.sort((a, b) => getCompletionRate(b) - getCompletionRate(a))[0].name}
                      </p>
                      <p className="text-sm font-bold">
                        {getCompletionRate(
                          mockData.habitsData.sort((a, b) => getCompletionRate(b) - getCompletionRate(a))[0],
                        )}
                        %
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Longest Streak</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        {mockData.habitsData.sort((a, b) => getStreakCount(b) - getStreakCount(a))[0].name}
                      </p>
                      <p className="text-sm font-bold">
                        {getStreakCount(mockData.habitsData.sort((a, b) => getStreakCount(b) - getStreakCount(a))[0])}{" "}
                        days
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Needs Improvement</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        {mockData.habitsData.sort((a, b) => getCompletionRate(a) - getCompletionRate(b))[0].name}
                      </p>
                      <p className="text-sm font-bold">
                        {getCompletionRate(
                          mockData.habitsData.sort((a, b) => getCompletionRate(a) - getCompletionRate(b))[0],
                        )}
                        %
                      </p>
                    </div>
                  </div>
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
                <CardDescription>Your skill development over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {mockData.skillsData.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{skill.name}</p>
                        <p className="text-sm font-medium">{skill.progress}%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${skill.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
                <CardDescription>Your learning sessions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="mr-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Total Learning Hours</p>
                      <p className="text-3xl font-bold">42.5</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">+12.5 hrs from last month</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary" />
                        <p className="text-sm">JavaScript</p>
                      </div>
                      <p className="text-sm font-medium">15.2 hrs</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
                        <p className="text-sm">React</p>
                      </div>
                      <p className="text-sm font-medium">10.8 hrs</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                        <p className="text-sm">Node.js</p>
                      </div>
                      <p className="text-sm font-medium">8.5 hrs</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-purple-500" />
                        <p className="text-sm">CSS</p>
                      </div>
                      <p className="text-sm font-medium">5.0 hrs</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-yellow-500" />
                        <p className="text-sm">Python</p>
                      </div>
                      <p className="text-sm font-medium">3.0 hrs</p>
                    </div>
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
                <CardDescription>Your emotional patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full">
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full items-center justify-center">
                    <div className="grid grid-cols-3 gap-4">
                      {mockData.moodData.map((mood) => (
                        <div key={mood.name} className="flex flex-col items-center">
                          <div className="mb-2 h-32 w-8 bg-primary/20 rounded-full relative overflow-hidden">
                            <div
                              className="absolute bottom-0 w-full bg-primary rounded-full"
                              style={{ height: `${mood.value}%` }}
                            />
                          </div>
                          <span className="text-sm">{mood.name}</span>
                          <span className="text-xs text-muted-foreground">{mood.value}%</span>
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
                    <p className="text-sm font-medium">Journal Entries</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">This Month</p>
                      <p className="text-sm font-bold">12</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Last Month</p>
                      <p className="text-sm font-bold">8</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Average Per Week</p>
                      <p className="text-sm font-bold">2.8</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Most Common Moods</p>
                    <div className="space-y-1">
                      {mockData.moodData
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 3)
                        .map((mood) => (
                          <div key={mood.name} className="flex items-center justify-between">
                            <p className="text-sm">{mood.name}</p>
                            <p className="text-sm font-bold">{mood.value}%</p>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Most Used Tags</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>work</Badge>
                      <Badge>gratitude</Badge>
                      <Badge>learning</Badge>
                      <Badge>family</Badge>
                      <Badge>goals</Badge>
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
                <CardDescription>Your financial balance over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full">
                  {/* This would be a real chart component in a production app */}
                  <div className="flex h-full items-end space-x-6">
                    {mockData.financialData.income.map((month, i) => (
                      <div key={i} className="flex w-full flex-col items-center space-y-2">
                        <div className="flex w-full flex-col items-center">
                          <div
                            className="w-full bg-green-500 rounded-t"
                            style={{ height: `${(month.amount / 5000) * 200}px` }}
                          />
                          <div
                            className="w-full bg-red-500 rounded-b"
                            style={{
                              height: `${(mockData.financialData.expenses[i].amount / 5000) * 200}px`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{month.month}</span>
                      </div>
                    ))}
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
                  {mockData.financialData.categories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-sm font-bold">{category.value}%</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${category.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Goal Progress</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mockData.goalsData.map((goal) => (
            <Card key={goal.name}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{goal.name}</CardTitle>
                    <CardDescription>{goal.category}</CardDescription>
                  </div>
                  <Badge>{goal.progress}%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${goal.progress}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

