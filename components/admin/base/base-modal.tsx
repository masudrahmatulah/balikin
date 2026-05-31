"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseModalContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const BaseModalContext = createContext<BaseModalContextType | null>(null);

/**
 * Base Modal Component
 * Provides consistent modal behavior with accessibility support
 * Handles backdrop clicks, ESC key, and focus management
 */
export function BaseModal({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, close]);

  // Focus trap when modal opens
  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element after modal opens
      const timeout = setTimeout(() => {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  return (
    <BaseModalContext.Provider value={{ isOpen, setIsOpen, open, close, toggle }}>
      <Dialog open={isOpen} onOpenChange={setIsOpen} {...props}>
        {typeof children === "function"
          ? (children as (context: BaseModalContextType) => React.ReactNode)({
              isOpen,
              setIsOpen,
              open,
              close,
              toggle,
            })
          : children}
      </Dialog>
    </BaseModalContext.Provider>
  );
}

/**
 * Hook to access Base Modal context
 */
export function useBaseModal() {
  const context = useContext(BaseModalContext);
  if (!context) {
    throw new Error("useBaseModal must be used within a BaseModal");
  }
  return context;
}

/**
 * Base Modal Content Component
 * Provides consistent modal content structure
 */
export function BaseModalContent({
  title,
  description,
  children,
  className,
  showCloseButton = true,
  onClose,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}) {
  const { close } = useBaseModal();

  const handleClose = () => {
    onClose?.();
    close();
  };

  return (
    <DialogContent className={cn("sm:max-w-md", className)}>
      <DialogHeader>
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && <DialogDescription>{description}</DialogDescription>}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </DialogHeader>
      {children}
    </DialogContent>
  );
}

/**
 * HOC for modal with trigger
 * Wraps a component with modal trigger functionality
 */
export function withModal<P extends object>(
  Component: React.ComponentType<P & { isOpen: boolean; onClose: () => void }>
) {
  return function WithModalWrapper(props: Omit<P, "isOpen" | "onClose">) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    return (
      <>
        <Component {...(props as P)} isOpen={isOpen} onClose={handleClose} />
        {typeof props.children === "function"
          ? props.children({ open: handleOpen, close: handleClose })
          : props.children}
      </>
    );
  };
}
