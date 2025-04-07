
import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar";
import { SidebarContent as CustomSidebarContent } from "./sidebar/SidebarContent";
import { useAppSettings } from "@/hooks/use-app-settings";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sidebarStyles } from "@/utils/sidebar-styles";

export const DashboardSidebar = () => {
  const { settings } = useAppSettings();
  const { isMobile, openMobile, toggleSidebar, state } = useSidebar();
  const sidebarTitle = settings.find(s => s.key === 'sidebar_title')?.value || 'NADI';
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={cn("border-r border-border/10 h-screen flex flex-col", sidebarStyles.sidebarBackground)}>
      <div className={cn(
        "p-4 border-b border-border/20 flex items-center",
        isCollapsed && !isMobile ? "justify-center" : "justify-between"
      )}>
        {(!isCollapsed || isMobile) && (
          <h1 className="text-2xl font-bold text-white">{sidebarTitle}</h1>
        )}
        {isCollapsed && !isMobile && (
          <h1 className="text-xl font-bold text-white">N</h1>
        )}
        
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <SidebarContent className="p-4 flex-1 overflow-y-auto scrollbar-none">
        <CustomSidebarContent />
      </SidebarContent>
    </Sidebar>
  );
};
