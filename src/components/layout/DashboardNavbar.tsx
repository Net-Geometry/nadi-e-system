import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useSidebar } from "@/hooks/use-sidebar";
import { sidebarStyles } from "@/utils/sidebar-styles";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./navbar/ThemeToggle";
import { CartToggle } from "./navbar/CartToggle";
import { NotificationToggle } from "./navbar/NotificationToggle";
import { SettingsToggle } from "./navbar/SettingsToggle";
import { HeaderProfile } from "./navbar/HeaderProfile";

export const DashboardNavbar = () => {
  const { settings } = useAppSettings();
  const { isMobile, toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Get navbar title from settings
  const navbarTitle =
    settings.find((s) => s.key === "navbar_title")?.value || "";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border/10 bg-white dark:bg-gray-900 dark:border-gray-800 transition-all duration-300",
        sidebarStyles.navbarBackground
      )}
    >
      <div className="flex h-16 items-center px-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 text-gray-700 dark:text-gray-200"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="mr-4 hidden md:flex">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {navbarTitle}
          </h2>
        </div>

        {isMobile && (
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">
            {navbarTitle}
          </h2>
        )}

        <div
          className={cn(
            "flex items-center space-x-4",
            !isMobile && "flex-1 justify-end"
          )}
        >
          <ThemeToggle />
          <NotificationToggle />
          <SettingsToggle />
          <HeaderProfile />
        </div>
      </div>
    </header>
  );
};
