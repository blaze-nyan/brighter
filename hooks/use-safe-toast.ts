"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  toast as originalToast,
  useToast as originalUseToast,
} from "./use-toast";

/**
 * A wrapper around the original toast function that ensures it's only called
 * in useEffect or event handlers, never during rendering.
 */
export function useSafeToast() {
  const { toast, ...rest } = originalUseToast();
  const pendingToastsRef = useRef<Array<Parameters<typeof toast>>>([]);

  // Process any queued toasts after render
  useEffect(() => {
    if (pendingToastsRef.current.length > 0) {
      const toasts = [...pendingToastsRef.current];
      pendingToastsRef.current = [];

      toasts.forEach((toastArgs) => {
        toast(...toastArgs);
      });
    }
  });

  // Safe version that queues toasts instead of showing them immediately
  const safeToast = useCallback((...args: Parameters<typeof toast>) => {
    pendingToastsRef.current.push(args);
  }, []);

  return {
    ...rest,
    toast: safeToast,
  };
}

/**
 * A safe version of the toast function that can be called anywhere
 * without causing React state update violations.
 */
export const safeToast = (...args: Parameters<typeof originalToast>) => {
  // Schedule the toast to run after the current execution
  setTimeout(() => {
    originalToast(...args);
  }, 0);

  // Return a mock object to maintain API compatibility
  return {
    id: "pending",
    dismiss: () => {},
    update: () => {},
  };
};
