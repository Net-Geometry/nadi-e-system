import React from "react";

export const SidebarMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="sidebar-menu">{children}</div>;
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
    <Comp className={`sidebar-menu-button ${className || ''}`}>
      {children}
    </Comp>
  );
};