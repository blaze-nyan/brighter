export type Book = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  status: "to-read" | "reading" | "completed";
  rating: number | null;
  notes: string | null;
  startDate: Date | null;
  endDate: Date | null;
  coverImage: string | null;
  isbn: string | null;
  pageCount: number | null;
  genre: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BookFormData = {
  title: string;
  author?: string;
  description?: string;
  status: "to-read" | "reading" | "completed";
  rating?: number;
  notes?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  coverImage?: string;
  isbn?: string;
  pageCount?: number;
  genre?: string;
};
