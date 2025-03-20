"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Pause, Play, RotateCcw, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

type TimerMode = "work" | "shortBreak" | "longBreak"

export default function PomodoroPage() {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  // Settings
  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(4)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate progress percentage
  const getTotalTime = () => {
    switch (mode) {
      case "work":
        return workDuration * 60
      case "shortBreak":
        return shortBreakDuration * 60
      case "longBreak":
        return longBreakDuration * 60
    }
  }

  const progress = 100 - (timeLeft / getTotalTime()) * 100

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle timer completion
  const handleTimerComplete = () => {
    const sound = new Audio("/notification.mp3") // You would need to add this file
    sound.play().catch((e) => console.error("Error playing sound:", e))

    if (mode === "work") {
      const newCompletedPomodoros = completedPomodoros + 1
      setCompletedPomodoros(newCompletedPomodoros)

      toast({
        title: "Pomodoro completed!",
        description: "Time for a break.",
      })

      // Determine if it's time for a long break
      if (newCompletedPomodoros % pomodorosUntilLongBreak === 0) {
        setMode("longBreak")
        setTimeLeft(longBreakDuration * 60)
      } else {
        setMode("shortBreak")
        setTimeLeft(shortBreakDuration * 60)
      }
    } else {
      // Break is over, back to work
      setMode("work")
      setTimeLeft(workDuration * 60)

      toast({
        title: "Break completed!",
        description: "Time to focus.",
      })
    }

    setIsRunning(false)
  }

  // Start/pause timer
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    switch (mode) {
      case "work":
        setTimeLeft(workDuration * 60)
        break
      case "shortBreak":
        setTimeLeft(shortBreakDuration * 60)
        break
      case "longBreak":
        setTimeLeft(longBreakDuration * 60)
        break
    }
  }

  // Change timer mode
  const changeMode = (newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)

    switch (newMode) {
      case "work":
        setTimeLeft(workDuration * 60)
        break
      case "shortBreak":
        setTimeLeft(shortBreakDuration * 60)
        break
      case "longBreak":
        setTimeLeft(longBreakDuration * 60)
        break
    }
  }

  // Apply settings
  const applySettings = () => {
    resetTimer()
    setSettingsOpen(false)

    // Update current timer based on new settings
    switch (mode) {
      case "work":
        setTimeLeft(workDuration * 60)
        break
      case "shortBreak":
        setTimeLeft(shortBreakDuration * 60)
        break
      case "longBreak":
        setTimeLeft(longBreakDuration * 60)
        break
    }
  }

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
        <p className="text-muted-foreground">Stay focused with the Pomodoro technique</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timer</CardTitle>
            <CardDescription>Focus for 25 minutes, then take a 5-minute break</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="flex space-x-2">
              <Button variant={mode === "work" ? "default" : "outline"} onClick={() => changeMode("work")}>
                Work
              </Button>
              <Button variant={mode === "shortBreak" ? "default" : "outline"} onClick={() => changeMode("shortBreak")}>
                Short Break
              </Button>
              <Button variant={mode === "longBreak" ? "default" : "outline"} onClick={() => changeMode("longBreak")}>
                Long Break
              </Button>
            </div>

            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-primary">
              <div className="text-5xl font-bold">{formatTime(timeLeft)}</div>
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
                    strokeDashoffset={301.59 - (301.59 * progress) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>

            <div className="flex space-x-4">
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
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Timer Settings</DialogTitle>
                    <DialogDescription>Customize your Pomodoro timer durations</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                      <Input
                        id="workDuration"
                        type="number"
                        value={workDuration}
                        onChange={(e) => setWorkDuration(Number.parseInt(e.target.value) || 25)}
                        min={1}
                        max={60}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
                      <Input
                        id="shortBreakDuration"
                        type="number"
                        value={shortBreakDuration}
                        onChange={(e) => setShortBreakDuration(Number.parseInt(e.target.value) || 5)}
                        min={1}
                        max={30}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                      <Input
                        id="longBreakDuration"
                        type="number"
                        value={longBreakDuration}
                        onChange={(e) => setLongBreakDuration(Number.parseInt(e.target.value) || 15)}
                        min={1}
                        max={60}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pomodorosUntilLongBreak">Pomodoros until Long Break</Label>
                      <Input
                        id="pomodorosUntilLongBreak"
                        type="number"
                        value={pomodorosUntilLongBreak}
                        onChange={(e) => setPomodorosUntilLongBreak(Number.parseInt(e.target.value) || 4)}
                        min={1}
                        max={10}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={applySettings}>Apply Settings</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Stats</CardTitle>
            <CardDescription>Track your focus sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Completed Pomodoros</span>
                <span className="text-sm font-medium">{completedPomodoros}</span>
              </div>
              <Progress value={Math.min(completedPomodoros * 25, 100)} />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Total Focus Time</span>
              <div className="text-2xl font-bold">
                {Math.floor((completedPomodoros * workDuration) / 60)}h {(completedPomodoros * workDuration) % 60}m
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Current Mode</h4>
              <div className="flex items-center space-x-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    mode === "work" ? "bg-primary" : mode === "shortBreak" ? "bg-green-500" : "bg-blue-500"
                  }`}
                />
                <span>{mode === "work" ? "Working" : mode === "shortBreak" ? "Short Break" : "Long Break"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setCompletedPomodoros(0)}>
              Reset Stats
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

