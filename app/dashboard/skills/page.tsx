"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash } from "lucide-react"
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
import { createSkill, deleteSkill, getSkills, logSkillSession } from "@/lib/actions/skills"

export default function SkillsPage() {
  const { toast } = useToast()
  const [skills, setSkills] = useState<any[]>([])
  const [newSkillOpen, setNewSkillOpen] = useState(false)
  const [logSessionOpen, setLogSessionOpen] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New skill form state
  const [newSkillName, setNewSkillName] = useState("")
  const [newSkillCategory, setNewSkillCategory] = useState("")

  // Log session form state
  const [sessionHours, setSessionHours] = useState("1")
  const [sessionNotes, setSessionNotes] = useState("")

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const fetchedSkills = await getSkills()
        setSkills(fetchedSkills)
      } catch (error) {
        console.error("Error fetching skills:", error)
        toast({
          title: "Error",
          description: "Failed to load skills",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkills()
  }, [toast])

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newSkill = await createSkill({
        name: newSkillName,
        category: newSkillCategory || "Other",
      })

      setSkills([...skills, newSkill])
      setNewSkillName("")
      setNewSkillCategory("")
      setNewSkillOpen(false)

      toast({
        title: "Skill added",
        description: `${newSkillName} has been added to your skills`,
      })
    } catch (error) {
      console.error("Error adding skill:", error)
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogSession = async () => {
    if (!selectedSkill) {
      toast({
        title: "Error",
        description: "Please select a skill",
        variant: "destructive",
      })
      return
    }

    const hours = Number.parseFloat(sessionHours)
    if (isNaN(hours) || hours <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of hours",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updatedSkill = await logSkillSession({
        skillId: selectedSkill,
        hours,
        notes: sessionNotes || undefined,
      })

      setSkills(
        skills.map((skill) => {
          if (skill.id === selectedSkill) {
            return updatedSkill
          }
          return skill
        }),
      )

      setSessionHours("1")
      setSessionNotes("")
      setLogSessionOpen(false)

      toast({
        title: "Session logged",
        description: `${hours} hours added to your skill`,
      })
    } catch (error) {
      console.error("Error logging session:", error)
      toast({
        title: "Error",
        description: "Failed to log session",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSkill = async (id: string) => {
    try {
      await deleteSkill(id)
      setSkills(skills.filter((skill) => skill.id !== id))

      toast({
        title: "Skill deleted",
        description: "The skill has been removed from your list",
      })
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills Development</h1>
          <p className="text-muted-foreground">Track your progress in learning new skills</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={logSessionOpen} onOpenChange={setLogSessionOpen}>
            <DialogTrigger asChild>
              <Button>Log Session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Practice Session</DialogTitle>
                <DialogDescription>Record time spent practicing a skill</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="skill">Skill</Label>
                  <Select value={selectedSkill || ""} onValueChange={setSelectedSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Hours Spent</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={sessionHours}
                    onChange={(e) => setSessionHours(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Session Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="What did you learn or practice?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleLogSession} disabled={isSubmitting}>
                  {isSubmitting ? "Logging..." : "Log Session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={newSkillOpen} onOpenChange={setNewSkillOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
                <DialogDescription>Add a new skill you want to track</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g., Programming, Spanish, Guitar"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    placeholder="e.g., Technical, Language, Music"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSkill} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Skill"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading skills...</p>
          </div>
        </div>
      ) : skills.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No skills yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add your first skill to start tracking your progress</p>
            <Button onClick={() => setNewSkillOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Skill
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{skill.name}</CardTitle>
                    <CardDescription>{skill.category}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSkill(skill.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">{skill.progress}%</span>
                    </div>
                    <Progress value={skill.progress} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Hours Spent</p>
                      <p className="text-lg font-medium">{skill.hoursSpent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Practiced</p>
                      <p className="text-lg font-medium">
                        {skill.lastPracticed ? new Date(skill.lastPracticed).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedSkill(skill.id)
                    setLogSessionOpen(true)
                  }}
                >
                  Log Practice
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

