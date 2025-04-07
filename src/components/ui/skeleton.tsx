import { cn } from "@/lib/utils"

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "list" | "table" | "card";
  rows?: number; // For list or table rows
  columns?: number; // For table columns
};

function Skeleton({
  className,
  variant = "default", // Default variant is "default"
  rows = 3, // Default rows for list/table
  columns = 3, // Default columns for table
  ...props
}: SkeletonProps) {
  // If no props are provided, the default "default" variant is rendered
  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-2">
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-4 flex-1 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("p-4 rounded-md border bg-muted", className)} {...props}>
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-8 w-1/2 animate-pulse rounded-md bg-muted mt-4" />
      </div>
    );
  }

  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton }
