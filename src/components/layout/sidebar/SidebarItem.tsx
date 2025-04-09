
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { sidebarStyles } from "@/utils/sidebar-styles";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

interface SidebarItemProps {
  title: string;
  path: string;
  icon?: LucideIcon;
  isCollapsed?: boolean;
  isInWhiteBackground?: boolean;
  iconColor?: string;
}

export const SidebarItem = ({
  title,
  path,
  icon: Icon,
  isCollapsed,
  isInWhiteBackground,
  iconColor = "#6E41E2",
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
            "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-200 rounded-md",
            sidebarStyles.hoverTransition,
            "hover:bg-gray-50 hover:scale-105 dark:hover:bg-gray-800/80",
            isActive &&
              "bg-gray-50 text-gray-900 font-medium dark:bg-gray-800/90 dark:text-white",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
          title={isCollapsed && !isMobile ? title : undefined}
        >
          <div className="relative flex items-center flex-shrink-0">
            {isActive && (
              <div
                className={cn(
                  "absolute -left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full",
                  "bg-primary"
                )}
              />
            )}
            {Icon && <Icon className="h-5 w-5" color={iconColor} />}
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="truncate leading-tight min-h-[1.25rem] line-clamp-2 text-left">
              {title}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
