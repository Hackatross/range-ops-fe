"use client";

import type { ReactNode } from "react";
import { CardWrapper } from "@classytic/fluid";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type SectionVariant = "default" | "card" | "subtle";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: SectionVariant;
  collapsible?: boolean;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

interface FormGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | number;
  className?: string;
}

interface FormFieldArrayProps {
  title?: string;
  description?: string;
  children: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  emptyMessage?: string;
  itemCount?: number;
  className?: string;
}

interface FormFieldArrayItemProps {
  children: ReactNode;
  onRemove?: () => void;
  index?: number;
  className?: string;
  title?: string;
}

// ============================================================================
// FORM SECTION
// ============================================================================

/**
 * FormSection component for organizing form fields into logical groups
 * Provides consistent styling and layout for form sections
 */
export function FormSection({
  title,
  description,
  children,
  className,
  variant = "default",
  collapsible = false,
  defaultOpen = true,
  icon,
}: FormSectionProps) {
  // Render icon - handle both component references and JSX elements
  const renderIcon = () => {
    if (!icon) return null;

    // Check if it's already a valid React element (JSX)
    if (typeof icon === "object" && "$$typeof" in icon) {
      return icon;
    }

    // If icon is a function component, render it
    if (typeof icon === "function") {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="h-4 w-4" />;
    }

    return icon;
  };

  // Header content
  const renderHeader = () => (
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground">{renderIcon()}</span>}
      <div className="flex-1 space-y-0.5">
        {title && <h3 className="text-base font-semibold">{title}</h3>}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );

  // Card variant
  if (variant === "card") {
    return (
      <CardWrapper
        title={
          title ? (
            <span className="flex items-center gap-2">
              {icon && <span className="text-muted-foreground">{renderIcon()}</span>}
              {title}
            </span>
          ) : undefined
        }
        description={description}
        hideHeader={!title && !description}
        className={cn("border-muted", className)}
      >
        {children}
      </CardWrapper>
    );
  }

  // Subtle variant
  if (variant === "subtle") {
    return (
      <div className={cn("space-y-4", className)}>
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-base font-semibold flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{renderIcon()}</span>}
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }

  // Default variant with separator
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <>
          <div className="space-y-1.5">
            {title && (
              <h3 className="text-base font-semibold flex items-center gap-2">
                {icon && <span className="text-muted-foreground">{renderIcon()}</span>}
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <Separator className="my-4" />
        </>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// FORM GRID
// ============================================================================

/**
 * FormGrid component for responsive grid layouts
 */
export function FormGrid({ children, cols = 2, className }: FormGridProps) {
  const colsClass: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", colsClass[cols] || "grid-cols-1 md:grid-cols-2", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// FORM FIELD ARRAY
// ============================================================================

/**
 * FormFieldArray wrapper for dynamic field arrays
 */
export function FormFieldArray({
  title,
  description,
  children,
  onAdd,
  addLabel = "Add Item",
  emptyMessage = "No items yet.",
  itemCount = 0,
  className,
}: FormFieldArrayProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {title && <h4 className="text-sm font-medium">{title}</h4>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            {addLabel}
          </button>
        )}
      </div>

      {itemCount === 0 && emptyMessage ? (
        <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

// ============================================================================
// FORM FIELD ARRAY ITEM
// ============================================================================

/**
 * FormFieldArrayItem wrapper for individual array items
 */
export function FormFieldArrayItem({
  children,
  onRemove,
  index: _index,
  className,
  title,
}: FormFieldArrayItemProps) {
  return (
    <div
      className={cn(
        "relative border rounded-lg p-4 space-y-4 bg-muted/20 hover:bg-muted/30 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        {title && <h5 className="text-sm font-medium text-muted-foreground">{title}</h5>}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/10 text-destructive h-8 w-8"
            aria-label="Remove item"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

