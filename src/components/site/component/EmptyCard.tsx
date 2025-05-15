import { Card, CardContent } from "@/components/ui/card";
import { FileX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyCardProps {
  message?: string;
  className?: string;
}

export function EmptyCard({ message = "There are no items to display.", className }: EmptyCardProps) {
  return (
    <Card className={cn("flex flex-col items-center justify-center text-center p-6 bg-muted/30", className)}>
      <FileX className="w-12 h-12 text-muted-foreground mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </Card>
  );
}