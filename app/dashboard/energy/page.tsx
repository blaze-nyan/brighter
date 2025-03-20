"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { createEnergyLog, getEnergyLogs } from "@/lib/actions/energy"

export default function EnergyTrackingPage() {
  const { toast } = useToast()
  const [energyLevel, setEnergyLevel] = useState<number>(70)
  const [focusLevel, setFocusLevel] = useState<number>(65)
  const [notes, setNotes] = useState<string>("")
  const [date, setDate] = useState<Date>(new Date())
  const [energyData, setEnergyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchEnergyLogs = async () => {
      setIsLoading(true)
      try {
        const logs = await getEnergyLogs()

        // Process logs for chart display
        const processedData = logs.map((log) => ({
          date: format(new Date(log.date), "MMM d"),
          energy: log.energyLevel,
          focus: log.focusLevel,
        }))

        setEnergyData(processedData.slice(-7).reverse())
      } catch (error) {
        console.error("Error fetching energy logs:", error)
        toast({
          title: "Error",
          description: "Failed to load energy logs",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnergyLogs()
  }, [toast])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      await createEnergyLog({
        energyLevel,
        focusLevel,
        notes: notes || undefined,
        date,
      })

      toast({
        title: "Energy log saved",
        description: `Energy: ${energyLevel}%, Focus: ${focusLevel}%, Date: ${format(date, "PPP")}`,
      })

      // Reset form
      setNotes("")

      // Refresh data
      const logs = await getEnergyLogs()
      const processedData = logs.map((log) => ({
        date: format(new Date(log.date), "MMM d"),
        energy: log.energyLevel,
        focus: log.focusLevel,
      }))

      setEnergyData(processedData.slice(-7).reverse())
    } catch (error) {
      console.error("Error saving energy log:", error)
      toast({
        title: "Error",
        description: "Failed to save energy log",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Energy Tracking</h1>
        <p className="text-muted-foreground">Monitor your energy and focus levels to optimize your productivity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log Your Energy</CardTitle>
            <CardDescription>Record how you're feeling right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Energy Level: {energyLevel}%</span>
                <span className="text-sm text-muted-foreground">
                  {energyLevel < 30 ? "Low" : energyLevel < 70 ? "Medium" : "High"}
                </span>
              </div>
              <Slider
                value={[energyLevel]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setEnergyLevel(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Focus Level: {focusLevel}%</span>
                <span className="text-sm text-muted-foreground">
                  {focusLevel < 30 ? "Distracted" : focusLevel < 70 ? "Focused" : "Deep Focus"}
                </span>
              </div>
              <Slider
                value={[focusLevel]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setFocusLevel(value[0])}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Notes</span>
              <Textarea
                placeholder="What factors are affecting your energy today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Energy Log"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Energy Trends</CardTitle>
            <CardDescription>Your energy and focus levels over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <p>Loading data...</p>
              </div>
            ) : energyData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">No energy data recorded yet</p>
              </div>
            ) : (
              <ChartContainer
                config={{
                  energy: {
                    label: "Energy",
                    color: "hsl(var(--chart-1))",
                  },
                  focus: {
                    label: "Focus",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart accessibilityLayer data={energyData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} domain={[0, 100]} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="energy" fill="var(--color-energy)" radius={4} />
                  <Bar dataKey="focus" fill="var(--color-focus)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

