
import React from "react";
import { cn } from "@/lib/utils";

export const SidebarMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="sidebar-menu space-y-1">{children}</div>;
};

export const SidebarMenuItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="sidebar-menu-item">{children}</div>;
};

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({ 
  children, 
  asChild = false, 
  className 
}) => {
  const Comp = asChild ? 'div' : 'button';
  return (
    <Comp className={cn(
      "sidebar-menu-button w-full transition-all duration-200", 
      className
    )}>
      {children}
    </Comp>
  );
};
