"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Edit, FileText, Plus, Search, Trash } from "lucide-react"
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
import { createNote, deleteNote, getNotes, updateNote } from "@/lib/actions/notes"

export default function NotesPage() {
  const { toast } = useToast()
  const [notes, setNotes] = useState<any[]>([])
  const [newNoteOpen, setNewNoteOpen] = useState(false)
  const [editNoteOpen, setEditNoteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New note form state
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteCategory, setNewNoteCategory] = useState("")

  // Edit note form state
  const [editingNote, setEditingNote] = useState<any>(null)

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes()
        setNotes(fetchedNotes)
      } catch (error) {
        console.error("Error fetching notes:", error)
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [toast])

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || note.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(notes.map((note) => note.category)))

  const handleAddNote = async () => {
    if (!newNoteTitle.trim()) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newNote = await createNote({
        title: newNoteTitle,
        content: newNoteContent,
        category: newNoteCategory || "Uncategorized",
      })

      setNotes([newNote, ...notes])
      setNewNoteTitle("")
      setNewNoteContent("")
      setNewNoteCategory("")
      setNewNoteOpen(false)

      toast({
        title: "Note added",
        description: "Your note has been saved",
      })
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNote = async () => {
    if (!editingNote || !editingNote.title.trim()) {
      toast({
        title: "Error",
        description: "Note title is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updatedNote = await updateNote({
        id: editingNote.id,
        title: editingNote.title,
        content: editingNote.content,
        category: editingNote.category,
      })

      setNotes(notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
      setEditingNote(null)
      setEditNoteOpen(false)

      toast({
        title: "Note updated",
        description: "Your changes have been saved",
      })
    } catch (error) {
      console.error("Error updating note:", error)
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id)
      setNotes(notes.filter((note) => note.id !== id))

      toast({
        title: "Note deleted",
        description: "The note has been removed",
      })
    } catch (error) {
      console.error("Error deleting note:", error)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Organize your learning resources and notes</p>
        </div>
        <Dialog open={newNoteOpen} onOpenChange={setNewNoteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>Create a new note or learning resource</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Note title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  placeholder="e.g., Programming, Language, Music"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  rows={8}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddNote} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Note"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="category-filter" className="whitespace-nowrap">
            Filter by:
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category-filter" className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading notes...</p>
          </div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No notes found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || categoryFilter !== "all"
                ? "Try changing your search or filter"
                : "Get started by creating your first note"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                    <CardDescription>{note.category}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingNote(note)
                        setEditNoteOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-4 text-sm text-muted-foreground">{note.content}</p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Created on {new Date(note.createdAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={editNoteOpen} onOpenChange={setEditNoteOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Make changes to your note</DialogDescription>
          </DialogHeader>
          {editingNote && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  rows={8}
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditNote} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

