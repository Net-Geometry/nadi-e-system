import React from "react";

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({ 
  children, 
  className 
}) => {
  return <div className={`sidebar-content ${className || ''}`}>{children}</div>;
};