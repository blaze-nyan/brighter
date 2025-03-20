// utils/date.ts
import { parseISO } from "date-fns";

export function ensureDateObject(dateInput: any): Date | undefined {
  if (!dateInput) return undefined;

  if (dateInput instanceof Date) return dateInput;

  if (typeof dateInput === "string") {
    try {
      return parseISO(dateInput);
    } catch (error) {
      return new Date(dateInput);
    }
  }

  return new Date(dateInput);
}
