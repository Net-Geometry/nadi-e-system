
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { sidebarStyles } from "@/utils/sidebar-styles";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

interface SidebarItemProps {
  title: string;
  path: string;
  icon: LucideIcon;
  isCollapsed?: boolean;
  isInWhiteBackground?: boolean;
}

export const SidebarItem = ({ 
  title, 
  path, 
  icon: Icon, 
  isCollapsed,
  isInWhiteBackground 
}: SidebarItemProps) => {
  const location = useLocation();
  const { isMobile } = useSidebar();
  const isActive = location.pathname === path;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link 
          to={path}
          className={cn(
            sidebarStyles.menuItem,
            isActive && sidebarStyles.menuItemActive,
            isCollapsed && !isMobile && "justify-center px-2",
            isInWhiteBackground && "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
          title={isCollapsed && !isMobile ? title : undefined}
        >
          <Icon className={cn(
            sidebarStyles.iconWrapper,
            isInWhiteBackground && "text-gray-700"
          )} />
          {(!isCollapsed || isMobile) && <span className="break-words leading-tight truncate">{title}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
