"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isToday, subDays } from "date-fns"
import { Calendar, Check, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createHabit, deleteHabit, getHabits, toggleHabitCompletion } from "@/lib/actions/habits"

const categories = [
  { value: "health", label: "Health" },
  { value: "productivity", label: "Productivity" },
  { value: "learning", label: "Learning" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const colors = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
]

export default function HabitsPage() {
  const { toast } = useToast()
  const [habits, setHabits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newHabit, setNewHabit] = useState<any>({
    name: "",
    description: "",
    category: "",
    frequency: "daily",
    color: "blue",
  })

  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const fetchedHabits = await getHabits()
        setHabits(fetchedHabits)
      } catch (error) {
        console.error("Error fetching habits:", error)
        toast({
          title: "Error",
          description: "Failed to load habits",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHabits()
  }, [toast])

  const handleAddHabit = async () => {
    if (!newHabit.name) {
      toast({
        title: "Error",
        description: "Habit name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const habit = await createHabit({
        name: newHabit.name,
        description: newHabit.description || "",
        category: newHabit.category || "other",
        frequency: newHabit.frequency || "daily",
        color: newHabit.color || "blue",
      })

      setHabits((prev) => [...prev, habit])
      setNewHabit({
        name: "",
        description: "",
        category: "",
        frequency: "daily",
        color: "blue",
      })
      setIsAddingHabit(false)

      toast({
        title: "Habit created",
        description: `${habit.name} has been added to your habits`,
      })
    } catch (error) {
      console.error("Error adding habit:", error)
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleHabitCompletion = async (habitId: string, date: Date) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd")
      const updatedHabit = await toggleHabitCompletion({
        habitId,
        date: dateStr,
      })

      setHabits((prev) =>
        prev.map((habit) => {
          if (habit.id === habitId) {
            return updatedHabit
          }
          return habit
        }),
      )
    } catch (error) {
      console.error("Error toggling habit completion:", error)
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId)
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId))

      toast({
        title: "Habit deleted",
        description: "The habit has been removed",
      })
    } catch (error) {
      console.error("Error deleting habit:", error)
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive",
      })
    }
  }

  const getCompletionStatus = (habit: any, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return habit.completions.some((c: any) => c.date === dateStr && c.completed)
  }

  const getStreakCount = (habit: any) => {
    let streak = 0
    let currentDate = new Date()

    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd")
      const completion = habit.completions.find((c: any) => c.date === dateStr)

      if (completion && completion.completed) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else {
        break
      }
    }

    return streak
  }

  const getCompletionRate = (habit: any) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"))

    const completions = last7Days.map((date) => habit.completions.find((c: any) => c.date === date)).filter(Boolean)

    if (completions.length === 0) return 0

    const completedCount = completions.filter((c: any) => c.completed).length
    return Math.round((completedCount / completions.length) * 100)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      productivity: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      learning: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      mindfulness: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      social: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    }
    return colors[category] || colors.other
  }

  const getHabitColor = (color: string) => {
    return colors.find((c) => c.value === color)?.class || "bg-blue-500"
  }

  const previousWeek = () => {
    setWeekStart((prev) => addDays(prev, -7))
  }

  const nextWeek = () => {
    setWeekStart((prev) => addDays(prev, 7))
  }

  const resetToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">Build consistent habits and track your progress</p>
        </div>
        <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
              <DialogDescription>Define a new habit you want to build consistently.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Habit Name
                </label>
                <Input
                  id="name"
                  placeholder="What habit do you want to build?"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe your habit in detail..."
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={newHabit.category}
                    onValueChange={(value) => setNewHabit({ ...newHabit, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="frequency" className="text-sm font-medium">
                    Frequency
                  </label>
                  <Select
                    value={newHabit.frequency}
                    onValueChange={(value) => setNewHabit({ ...newHabit, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((frequency) => (
                        <SelectItem key={frequency.value} value={frequency.value}>
                          {frequency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="color" className="text-sm font-medium">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`h-6 w-6 rounded-full ${color.class} ${
                        newHabit.color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      onClick={() => setNewHabit({ ...newHabit, color: color.value })}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingHabit(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddHabit} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Habit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Habits</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center justify-between mt-6 mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={resetToCurrentWeek}>
              Current Week
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm font-medium">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </div>
        </div>

        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-sm font-medium text-muted-foreground">Habit</div>
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`text-center text-sm font-medium ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}
            >
              <div>{format(day, "EEE")}</div>
              <div className={`text-xs ${isToday(day) ? "bg-primary/10 rounded-full px-2" : ""}`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading habits...</p>
            </div>
          </div>
        ) : (
          <TabsContent value="all" className="space-y-4">
            {habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No habits yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">Create your first habit to start tracking</p>
                <Button onClick={() => setIsAddingHabit(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Habit
                </Button>
              </div>
            ) : (
              habits.map((habit) => (
                <Card key={habit.id} className="overflow-hidden">
                  <div className="grid grid-cols-8 items-center">
                    <div className="p-4 flex items-center space-x-3">
                      <div className={`h-4 w-4 rounded-full ${getHabitColor(habit.color)}`} />
                      <div>
                        <h3 className="font-medium text-sm">{habit.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getCategoryColor(habit.category)}>
                            {categories.find((c) => c.value === habit.category)?.label || habit.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getStreakCount(habit) > 0 ? `${getStreakCount(habit)} day streak` : "No streak"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {weekDays.map((day, i) => (
                      <div key={i} className="flex justify-center p-4">
                        <button
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            getCompletionStatus(habit, day)
                              ? `${getHabitColor(habit.color)} text-white`
                              : "bg-muted hover:bg-muted/80"
                          }`}
                          onClick={() => handleToggleHabitCompletion(habit.id, day)}
                        >
                          {getCompletionStatus(habit, day) ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <X className="h-5 w-5 opacity-50" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <CardFooter className="flex justify-between bg-muted/50 px-4 py-2">
                    <div className="text-xs text-muted-foreground">
                      {getCompletionRate(habit)}% completion rate (last 7 days)
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteHabit(habit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value} className="space-y-4">
            {!isLoading && habits.filter((habit) => habit.category === category.value).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="text-lg font-medium">No {category.label.toLowerCase()} habits yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Create your first {category.label.toLowerCase()} habit to start tracking
                </p>
                <Button
                  onClick={() => {
                    setNewHabit({ ...newHabit, category: category.value })
                    setIsAddingHabit(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add {category.label} Habit
                </Button>
              </div>
            ) : (
              !isLoading &&
              habits
                .filter((habit) => habit.category === category.value)
                .map((habit) => (
                  <Card key={habit.id} className="overflow-hidden">
                    <div className="grid grid-cols-8 items-center">
                      <div className="p-4 flex items-center space-x-3">
                        <div className={`h-4 w-4 rounded-full ${getHabitColor(habit.color)}`} />
                        <div>
                          <h3 className="font-medium text-sm">{habit.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getCategoryColor(habit.category)}>
                              {categories.find((c) => c.value === habit.category)?.label || habit.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getStreakCount(habit) > 0 ? `${getStreakCount(habit)} day streak` : "No streak"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {weekDays.map((day, i) => (
                        <div key={i} className="flex justify-center p-4">
                          <button
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              getCompletionStatus(habit, day)
                                ? `${getHabitColor(habit.color)} text-white`
                                : "bg-muted hover:bg-muted/80"
                            }`}
                            onClick={() => handleToggleHabitCompletion(habit.id, day)}
                          >
                            {getCompletionStatus(habit, day) ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <X className="h-5 w-5 opacity-50" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                    <CardFooter className="flex justify-between bg-muted/50 px-4 py-2">
                      <div className="text-xs text-muted-foreground">
                        {getCompletionRate(habit)}% completion rate (last 7 days)
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteHabit(habit.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

