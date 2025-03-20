"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format, isSameDay } from "date-fns"
import { CalendarIcon, Clock, Plus, Tag, X, FileText, Target } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Event type definition
type Event = {
  id: string
  title: string
  date: Date
  startTime?: string
  endTime?: string
  description?: string
  type: "event" | "note" | "task"
  category?: string
}

// Mock data for events
const initialEvents: Event[] = [
  {
    id: "1",
    title: "Team Meeting",
    date: new Date(2023, 2, 15),
    startTime: "10:00",
    endTime: "11:00",
    description: "Weekly team sync",
    type: "event",
    category: "work",
  },
  {
    id: "2",
    title: "Doctor Appointment",
    date: new Date(2023, 2, 18),
    startTime: "14:30",
    endTime: "15:30",
    description: "Annual checkup",
    type: "event",
    category: "personal",
  },
  {
    id: "3",
    title: "Project Ideas",
    date: new Date(2023, 2, 20),
    description: "Brainstorm new project ideas for Q2",
    type: "note",
    category: "work",
  },
  {
    id: "4",
    title: "Submit Report",
    date: new Date(2023, 2, 25),
    description: "Deadline for quarterly report",
    type: "task",
    category: "work",
  },
]

// Event categories with colors
const eventCategories = [
  { name: "work", color: "bg-blue-500" },
  { name: "personal", color: "bg-green-500" },
  { name: "health", color: "bg-red-500" },
  { name: "learning", color: "bg-purple-500" },
  { name: "social", color: "bg-yellow-500" },
  { name: "other", color: "bg-gray-500" },
]

export default function CalendarPage() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [newEventOpen, setNewEventOpen] = useState(false)

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventType, setNewEventType] = useState<"event" | "note" | "task">("event")
  const [newEventStartTime, setNewEventStartTime] = useState("")
  const [newEventEndTime, setNewEventEndTime] = useState("")
  const [newEventDescription, setNewEventDescription] = useState("")
  const [newEventCategory, setNewEventCategory] = useState("work")

  // Get events for selected date
  const selectedDateEvents = events.filter((event) => isSameDay(event.date, selectedDate))

  // Function to get category color
  const getCategoryColor = (categoryName: string) => {
    const category = eventCategories.find((cat) => cat.name === categoryName)
    return category ? category.color : "bg-gray-500"
  }

  // Function to add event
  const handleAddEvent = () => {
    if (!newEventTitle.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      })
      return
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: selectedDate,
      type: newEventType,
      category: newEventCategory,
      description: newEventDescription,
    }

    if (newEventType === "event") {
      newEvent.startTime = newEventStartTime
      newEvent.endTime = newEventEndTime
    }

    setEvents([...events, newEvent])
    resetNewEventForm()
    setNewEventOpen(false)

    toast({
      title: `${newEventType.charAt(0).toUpperCase() + newEventType.slice(1)} added`,
      description: `"${newEventTitle}" has been added to your calendar`,
    })
  }

  // Function to delete event
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))

    toast({
      title: "Item deleted",
      description: "The item has been removed from your calendar",
    })
  }

  // Reset new event form
  const resetNewEventForm = () => {
    setNewEventTitle("")
    setNewEventType("event")
    setNewEventStartTime("")
    setNewEventEndTime("")
    setNewEventDescription("")
    setNewEventCategory("work")
  }

  // Function to render calendar day with event indicators
  const renderCalendarDay = (day: Date) => {
    const dayEvents = events.filter((event) => isSameDay(event.date, day))

    if (dayEvents.length === 0) return null

    // Group by category to show colored dots
    const categories = Array.from(new Set(dayEvents.map((event) => event.category)))

    return (
      <div className="flex gap-0.5 flex-wrap mt-1 justify-center">
        {categories.map((category, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(category || "other")}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">Manage your schedule, events, and notes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View and manage your schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              components={{
                DayContent: (props) => (
                  <div className="relative">
                    {props.day.toString()}
                    {renderCalendarDay(props.date)}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Selected Day</CardTitle>
                <CardDescription>{format(selectedDate, "MMMM d, yyyy")}</CardDescription>
              </div>
              <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add to Calendar</DialogTitle>
                    <DialogDescription>Add an event, note, or task to your calendar</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Tabs defaultValue="event" onValueChange={(value) => setNewEventType(value as any)}>
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="event">Event</TabsTrigger>
                        <TabsTrigger value="note">Note</TabsTrigger>
                        <TabsTrigger value="task">Task</TabsTrigger>
                      </TabsList>
                      <TabsContent value="event" className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Event Title</Label>
                          <Input
                            id="title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="Meeting, appointment, etc."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="start-time">Start Time</Label>
                            <Input
                              id="start-time"
                              type="time"
                              value={newEventStartTime}
                              onChange={(e) => setNewEventStartTime(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="end-time">End Time</Label>
                            <Input
                              id="end-time"
                              type="time"
                              value={newEventEndTime}
                              onChange={(e) => setNewEventEndTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="note" className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="note-title">Note Title</Label>
                          <Input
                            id="note-title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="Ideas, thoughts, etc."
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="task" className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="task-title">Task Title</Label>
                          <Input
                            id="task-title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="Submit report, call client, etc."
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={newEventCategory} onValueChange={setNewEventCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventCategories.map((category) => (
                            <SelectItem key={category.name} value={category.name}>
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${category.color}`} />
                                <span className="capitalize">{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        placeholder="Add details about this item..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEvent}>Add to Calendar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                  <div className="flex flex-col items-center text-center">
                    <CalendarIcon className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No items</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Add an event, note, or task to this day</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div key={event.id} className="flex items-start justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {event.type === "event" && <Clock className="h-4 w-4 text-blue-500" />}
                          {event.type === "note" && <FileText className="h-4 w-4 text-green-500" />}
                          {event.type === "task" && <Target className="h-4 w-4 text-red-500" />}
                          <span className="font-medium">{event.title}</span>
                        </div>
                        {event.startTime && (
                          <div className="text-sm text-muted-foreground">
                            {event.startTime} - {event.endTime}
                          </div>
                        )}
                        {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                        <div className="flex items-center gap-2 pt-1">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground capitalize">{event.category}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
              <CardDescription>Your upcoming events and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter((event) => event.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 3)
                  .map((event) => (
                    <div key={event.id} className="flex items-start justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {event.type}
                          </Badge>
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{format(event.date, "MMM d, yyyy")}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

