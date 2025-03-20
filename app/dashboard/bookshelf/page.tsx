"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, PlusCircle, BookX, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Book, BookFormData } from "@/types/book";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "@/lib/actions/books";

const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["to-read", "reading", "completed"]),
  rating: z.number().min(1).max(5).optional().nullable(),
  notes: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  coverImage: z.string().optional(),
  isbn: z.string().optional(),
  pageCount: z.number().positive().optional().nullable(),
  genre: z.string().optional(),
});

export default function BookshelfPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const form = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      status: "to-read",
      rating: null,
      notes: "",
      startDate: null,
      endDate: null,
      coverImage: "",
      isbn: "",
      pageCount: null,
      genre: "",
    },
  });

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load books",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      form.reset({
        title: selectedBook.title,
        author: selectedBook.author || "",
        description: selectedBook.description || "",
        status: selectedBook.status as "to-read" | "reading" | "completed",
        rating: selectedBook.rating,
        notes: selectedBook.notes || "",
        startDate: selectedBook.startDate
          ? new Date(selectedBook.startDate)
          : null,
        endDate: selectedBook.endDate ? new Date(selectedBook.endDate) : null,
        coverImage: selectedBook.coverImage || "",
        isbn: selectedBook.isbn || "",
        pageCount: selectedBook.pageCount,
        genre: selectedBook.genre || "",
      });
    } else {
      form.reset({
        title: "",
        author: "",
        description: "",
        status: "to-read",
        rating: null,
        notes: "",
        startDate: null,
        endDate: null,
        coverImage: "",
        isbn: "",
        pageCount: null,
        genre: "",
      });
    }
  }, [selectedBook, form]);

  const onSubmit = async (data: z.infer<typeof bookFormSchema>) => {
    try {
      if (selectedBook) {
        await updateBook(selectedBook.id, data as BookFormData);
        toast({
          title: "Success",
          description: "Book updated successfully",
        });
      } else {
        await createBook(data as BookFormData);
        toast({
          title: "Success",
          description: "Book added successfully",
        });
      }

      // Refresh books
      const updatedBooks = await getBooks();
      setBooks(updatedBooks);
      setIsFormDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: selectedBook
          ? "Failed to update book"
          : "Failed to add book",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      await deleteBook(selectedBook.id);
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });

      // Refresh books
      const updatedBooks = await getBooks();
      setBooks(updatedBooks);
      setIsDeleteDialogOpen(false);
      setSelectedBook(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  const openAddBookDialog = () => {
    setSelectedBook(null);
    setIsFormDialogOpen(true);
  };

  const openEditBookDialog = (book: Book) => {
    setSelectedBook(book);
    setIsFormDialogOpen(true);
  };

  const openDeleteDialog = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  const filteredBooks = books.filter((book) => {
    if (activeTab === "all") return true;
    return book.status === activeTab;
  });

  const renderRatingStars = (rating: number | null) => {
    if (!rating) return null;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Bookshelf</h1>
        <Button onClick={openAddBookDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Books ({books.length})</TabsTrigger>
          <TabsTrigger value="reading">
            Reading ({books.filter((b) => b.status === "reading").length})
          </TabsTrigger>
          <TabsTrigger value="to-read">
            To Read ({books.filter((b) => b.status === "to-read").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({books.filter((b) => b.status === "completed").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookX className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-center">No books found</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {activeTab === "all"
                ? "You haven't added any books yet."
                : `You don't have any books in the "${activeTab}" category.`}
            </p>
            <Button
              onClick={openAddBookDialog}
              variant="outline"
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add your first book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                    {book.author && (
                      <CardDescription className="line-clamp-1">
                        by {book.author}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={`${
                      book.status === "reading"
                        ? "default"
                        : book.status === "completed"
                        ? "secondary"
                        : "secondary"
                    }`}
                  >
                    {book.status === "to-read"
                      ? "To Read"
                      : book.status === "reading"
                      ? "Reading"
                      : "Completed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                {book.coverImage && (
                  <div className="mb-3 flex justify-center">
                    <img
                      src={book.coverImage || "/placeholder.svg"}
                      alt={`Cover of ${book.title}`}
                      className="h-40 object-cover rounded-md"
                    />
                  </div>
                )}
                {book.genre && (
                  <Badge variant="outline" className="mb-2">
                    {book.genre}
                  </Badge>
                )}
                {book.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                    {book.description}
                  </p>
                )}
                {book.rating && (
                  <div className="mb-2">{renderRatingStars(book.rating)}</div>
                )}
                {(book.startDate || book.endDate) && (
                  <div className="text-xs text-muted-foreground">
                    {book.startDate && (
                      <p>Started: {format(new Date(book.startDate), "PP")}</p>
                    )}
                    {book.endDate && (
                      <p>Finished: {format(new Date(book.endDate), "PP")}</p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditBookDialog(book)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(book)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Book Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBook ? "Edit Book" : "Add New Book"}
            </DialogTitle>
            <DialogDescription>
              {selectedBook
                ? "Update the details of your book."
                : "Enter the details of the book you want to add to your bookshelf."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Book title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="to-read">To Read</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Book description"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Book genre"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          placeholder="Rating"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number.parseInt(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ISBN"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pageCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Number of pages"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number.parseInt(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="URL to book cover"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a URL to an image of the book cover
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your notes about the book"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedBook ? "Update Book" : "Add Book"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedBook?.title}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
