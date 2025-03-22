"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, isAfter, isBefore, isToday } from "date-fns";
import {
  CalendarIcon,
  Check,
  Clock,
  Edit,
  Loader2,
  Plus,
  Tag,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
} from "@/lib/actions/todos";

// Todo categories with colors
const todoCategories = [
  { name: "work", color: "bg-blue-500" },
  { name: "personal", color: "bg-green-500" },
  { name: "health", color: "bg-red-500" },
  { name: "learning", color: "bg-purple-500" },
  { name: "social", color: "bg-yellow-500" },
  { name: "other", color: "bg-gray-500" },
];

export default function TodosPage() {
  const { toast } = useToast();
  const [todos, setTodos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTodoOpen, setNewTodoOpen] = useState(false);
  const [editTodoOpen, setEditTodoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // New todo form state
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | undefined>(
    undefined
  );
  const [newTodoPriority, setNewTodoPriority] = useState<string>("medium");
  const [newTodoCategory, setNewTodoCategory] = useState("work");

  // Edit todo form state
  const [editingTodo, setEditingTodo] = useState<any | null>(null);

  // Fetch todos on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await getTodos();
        setTodos(data);
      } catch (error: any) {
        toast({
          title: "Error fetching todos",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [toast]);

  // Filter todos based on active tab and category
  const filteredTodos = todos.filter((todo) => {
    // Filter by tab
    if (activeTab === "completed" && !todo.completed) return false;
    if (activeTab === "active" && todo.completed) return false;
    if (
      activeTab === "today" &&
      (!todo.dueDate || !isToday(new Date(todo.dueDate)))
    )
      return false;
    if (
      activeTab === "upcoming" &&
      (!todo.dueDate || !isAfter(new Date(todo.dueDate), new Date()))
    )
      return false;
    if (
      activeTab === "overdue" &&
      (!todo.dueDate ||
        !isBefore(new Date(todo.dueDate), new Date()) ||
        todo.completed)
    )
      return false;

    // Filter by category
    if (categoryFilter !== "all" && todo.category !== categoryFilter)
      return false;

    return true;
  });

  // Function to get category color
  const getCategoryColor = (categoryName?: string) => {
    if (!categoryName) return "bg-gray-500";
    const category = todoCategories.find((cat) => cat.name === categoryName);
    return category ? category.color : "bg-gray-500";
  };

  // Function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Function to add todo
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newTodo = await createTodo({
        title: newTodoTitle,
        description: newTodoDescription || undefined,
        dueDate: newTodoDueDate,
        priority: newTodoPriority,
        category: newTodoCategory,
      });

      setTodos([...todos, newTodo]);
      resetNewTodoForm();
      setNewTodoOpen(false);

      toast({
        title: "Task added",
        description: `"${newTodoTitle}" has been added to your tasks`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding task",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to update todo
  const handleUpdateTodo = async () => {
    if (!editingTodo || !editingTodo.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedTodo = await updateTodo({
        id: editingTodo.id,
        title: editingTodo.title,
        description: editingTodo.description || undefined,
        dueDate: editingTodo.dueDate,
        priority: editingTodo.priority,
        category: editingTodo.category,
      });

      setTodos(
        todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      setEditingTodo(null);
      setEditTodoOpen(false);

      toast({
        title: "Task updated",
        description: "Your changes have been saved",
      });
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to toggle todo completion
  const handleToggleTodo = async (id: string) => {
    try {
      const updatedTodo = await toggleTodoCompletion(id);
      setTodos(
        todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Function to delete todo
  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));

      toast({
        title: "Task deleted",
        description: "The task has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Reset new todo form
  const resetNewTodoForm = () => {
    setNewTodoTitle("");
    setNewTodoDescription("");
    setNewTodoDueDate(undefined);
    setNewTodoPriority("medium");
    setNewTodoCategory("work");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">To-Do Lists</h1>
          <p className="text-muted-foreground">
            Manage your tasks and stay organized
          </p>
        </div>
        <Dialog open={newTodoOpen} onOpenChange={setNewTodoOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task with details and due date
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newTodoDescription}
                  onChange={(e) => setNewTodoDescription(e.target.value)}
                  placeholder="Add details about this task..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTodoPriority}
                    onValueChange={(value) => setNewTodoPriority(value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTodoCategory}
                    onValueChange={setNewTodoCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {todoCategories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${category.color}`}
                            />
                            <span className="capitalize">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTodoDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTodoDueDate
                        ? format(newTodoDueDate, "PPP")
                        : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTodoDueDate}
                      onSelect={setNewTodoDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTodo} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Task"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">View</Label>
              <div className="mt-2 space-y-1">
                <Button
                  variant={activeTab === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("all")}
                >
                  All Tasks
                </Button>
                <Button
                  variant={activeTab === "active" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("active")}
                >
                  Active
                </Button>
                <Button
                  variant={activeTab === "completed" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant={activeTab === "today" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("today")}
                >
                  Due Today
                </Button>
                <Button
                  variant={activeTab === "upcoming" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming
                </Button>
                <Button
                  variant={activeTab === "overdue" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("overdue")}
                >
                  Overdue
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2">Categories</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {todoCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${category.color}`}
                        />
                        <span className="capitalize">{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "all" && "All Tasks"}
              {activeTab === "active" && "Active Tasks"}
              {activeTab === "completed" && "Completed Tasks"}
              {activeTab === "today" && "Due Today"}
              {activeTab === "upcoming" && "Upcoming Tasks"}
              {activeTab === "overdue" && "Overdue Tasks"}
              {categoryFilter !== "all" &&
                ` - ${
                  categoryFilter.charAt(0).toUpperCase() +
                  categoryFilter.slice(1)
                }`}
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading..."
                : `${filteredTodos.length} ${
                    filteredTodos.length === 1 ? "task" : "tasks"
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                <div className="flex flex-col items-center text-center">
                  <Check className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeTab === "completed"
                      ? "You haven't completed any tasks yet"
                      : "Add a new task to get started"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-start justify-between rounded-lg border p-4 ${
                      todo.completed ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => handleToggleTodo(todo.id)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              todo.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {todo.title}
                          </span>
                          <Badge
                            className={`${getPriorityColor(
                              todo.priority
                            )} text-xs`}
                          >
                            {todo.priority}
                          </Badge>
                        </div>
                        {todo.description && (
                          <p
                            className={`text-sm ${
                              todo.completed
                                ? "text-muted-foreground/70 line-through"
                                : "text-muted-foreground"
                            }`}
                          >
                            {todo.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {todo.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                Due{" "}
                                {format(new Date(todo.dueDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                          {todo.category && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Tag className="h-3 w-3" />
                              <span className="capitalize">
                                {todo.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingTodo(todo);
                          setEditTodoOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editTodoOpen} onOpenChange={setEditTodoOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task</DialogDescription>
          </DialogHeader>
          {editingTodo && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  value={editingTodo.title}
                  onChange={(e) =>
                    setEditingTodo({ ...editingTodo, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editingTodo.description || ""}
                  onChange={(e) =>
                    setEditingTodo({
                      ...editingTodo,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingTodo.priority}
                    onValueChange={(value) =>
                      setEditingTodo({ ...editingTodo, priority: value })
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingTodo.category || "other"}
                    onValueChange={(value) =>
                      setEditingTodo({ ...editingTodo, category: value })
                    }
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {todoCategories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${category.color}`}
                            />
                            <span className="capitalize">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editingTodo.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingTodo.dueDate
                        ? format(new Date(editingTodo.dueDate), "PPP")
                        : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        editingTodo.dueDate
                          ? new Date(editingTodo.dueDate)
                          : undefined
                      }
                      onSelect={(date) =>
                        setEditingTodo({ ...editingTodo, dueDate: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateTodo} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
