"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { format, subDays } from "date-fns"
import { Pause, Play, RotateCcw, Save, Volume2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Meditation session type
type MeditationSession = {
  id: string
  date: Date
  duration: number // in seconds
  type: string
  notes?: string
}

// Mock data for meditation sessions
const initialSessions: MeditationSession[] = [
  {
    id: "1",
    date: subDays(new Date(), 6),
    duration: 300, // 5 minutes
    type: "Mindfulness",
    notes: "Focused on breath",
  },
  {
    id: "2",
    date: subDays(new Date(), 5),
    duration: 600, // 10 minutes
    type: "Guided",
    notes: "Used the 'Calm Mind' guide",
  },
  {
    id: "3",
    date: subDays(new Date(), 3),
    duration: 900, // 15 minutes
    type: "Body Scan",
    notes: "Felt very relaxed afterward",
  },
  {
    id: "4",
    date: subDays(new Date(), 1),
    duration: 1200, // 20 minutes
    type: "Loving-Kindness",
    notes: "Focused on gratitude",
  },
]

// Meditation types
const meditationTypes = [
  "Mindfulness",
  "Guided",
  "Body Scan",
  "Loving-Kindness",
  "Zen",
  "Transcendental",
  "Yoga",
  "Other",
]

export default function MeditationPage() {
  const { toast } = useToast()
  const [sessions, setSessions] = useState<MeditationSession[]>(initialSessions)
  const [isRunning, setIsRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [targetDuration, setTargetDuration] = useState(600) // 10 minutes in seconds
  const [sessionType, setSessionType] = useState("Mindfulness")
  const [sessionNotes, setSessionNotes] = useState("")
  const [volume, setVolume] = useState(50)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/meditation-sound.mp3") // You would need to add this file
    audioRef.current.loop = true

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Start/pause timer
  const toggleTimer = () => {
    if (isRunning) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } else {
      if (audioRef.current) {
        audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
      }
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= targetDuration) {
            handleTimerComplete()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    setIsRunning(!isRunning)
  }

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  // Handle timer completion
  const handleTimerComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsRunning(false)

    // Play completion sound
    const completionSound = new Audio("/completion-sound.mp3") // You would need to add this file
    completionSound.play().catch((e) => console.error("Error playing completion sound:", e))

    toast({
      title: "Meditation completed!",
      description: `You've completed a ${formatTime(targetDuration)} meditation session.`,
    })
  }

  // Save session
  const saveSession = () => {
    if (timeElapsed < 30) {
      // Minimum 30 seconds
      toast({
        title: "Session too short",
        description: "Meditate for at least 30 seconds to save a session.",
        variant: "destructive",
      })
      return
    }

    const newSession: MeditationSession = {
      id: Date.now().toString(),
      date: new Date(),
      duration: timeElapsed,
      type: sessionType,
      notes: sessionNotes || undefined,
    }

    setSessions([newSession, ...sessions])
    resetTimer()
    setSessionNotes("")

    toast({
      title: "Session saved",
      description: `Your ${formatTime(timeElapsed)} meditation has been recorded.`,
    })
  }

  // Calculate total meditation time
  const totalMeditationTime = sessions.reduce((total, session) => total + session.duration, 0)
  const totalMeditationHours = Math.floor(totalMeditationTime / 3600)
  const totalMeditationMinutes = Math.floor((totalMeditationTime % 3600) / 60)

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const sessionsOnDay = sessions.filter(
      (session) => format(session.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
    )
    const minutesOnDay = sessionsOnDay.reduce((total, session) => total + Math.floor(session.duration / 60), 0)

    return {
      date: format(date, "EEE"),
      minutes: minutesOnDay,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meditation</h1>
        <p className="text-muted-foreground">Practice mindfulness and track your meditation sessions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meditation Timer</CardTitle>
            <CardDescription>Set your timer and start your practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-primary">
                <div className="text-4xl font-bold">{formatTime(timeElapsed)}</div>
                <div className="absolute inset-0">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="stroke-muted-foreground/20"
                      cx="50"
                      cy="50"
                      r="48"
                      fill="transparent"
                      strokeWidth="4"
                    />
                    <circle
                      className="stroke-primary"
                      cx="50"
                      cy="50"
                      r="48"
                      fill="transparent"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="301.59"
                      strokeDashoffset={301.59 - (301.59 * (timeElapsed / targetDuration) * 100) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <div className="flex justify-between">
                  <Label>Duration: {formatTime(targetDuration)}</Label>
                  <span className="text-sm text-muted-foreground">{Math.floor(targetDuration / 60)} minutes</span>
                </div>
                <Slider
                  value={[targetDuration / 60]}
                  min={1}
                  max={60}
                  step={1}
                  onValueChange={(value) => setTargetDuration(value[0] * 60)}
                />
              </div>

              <div className="space-y-2 w-full">
                <div className="flex justify-between">
                  <Label>Sound Volume</Label>
                  <span className="text-sm text-muted-foreground">{volume}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider value={[volume]} min={0} max={100} step={1} onValueChange={(value) => setVolume(value[0])} />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="meditation-type">Meditation Type</Label>
                <select
                  id="meditation-type"
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {meditationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex space-x-2">
              <Button size="lg" onClick={toggleTimer}>
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Start
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={resetTimer}>
                <RotateCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
            <Button size="lg" variant="secondary" onClick={saveSession} disabled={timeElapsed < 30}>
              <Save className="mr-2 h-4 w-4" /> Save Session
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Notes</CardTitle>
            <CardDescription>Record your thoughts and experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="How was your meditation experience? What did you notice?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your meditation minutes over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                minutes: {
                  label: "Minutes",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart accessibilityLayer data={last7Days}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="minutes" fill="var(--color-minutes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meditation Stats</CardTitle>
            <CardDescription>Your meditation journey at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">
                  {totalMeditationHours}h {totalMeditationMinutes}m
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg. Session</p>
                <p className="text-2xl font-bold">
                  {sessions.length > 0 ? Math.floor(totalMeditationTime / sessions.length / 60) : 0}m
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Longest Session</p>
                <p className="text-2xl font-bold">
                  {sessions.length > 0 ? Math.floor(Math.max(...sessions.map((s) => s.duration)) / 60) : 0}m
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Recent Sessions</p>
              <div className="space-y-2">
                {sessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.type}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(session.date, "MMM d, yyyy")} • {Math.floor(session.duration / 60)} minutes
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{format(session.date, "h:mm a")}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

