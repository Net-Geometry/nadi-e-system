
import React from "react";
import { cn } from "@/lib/utils";

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("sidebar-content flex flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
