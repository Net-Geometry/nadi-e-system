import { Bell, Settings, Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NotificationList } from "@/components/notifications/NotificationList";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useSidebar } from "@/hooks/use-sidebar";
import { sidebarStyles } from "@/utils/sidebar-styles";
import { cn } from "@/lib/utils";

export const DashboardNavbar = () => {
  const { logout, user } = useAuth();
  const { settings } = useAppSettings();
  const { isMobile, toggleSidebar } = useSidebar();

  // Get navbar title from settings
  const navbarTitle =
    settings.find((s) => s.key === "navbar_title")?.value || "";

  // Fetch user profile including name and role
  const { data: profile } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, user_type")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Get first character of name for avatar fallback
  const getNameInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return "U"; // Default to 'U' for User if no name is available
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border/10 backdrop-blur supports-[backdrop-filter]:bg-[#000033]/90",
        sidebarStyles.navbarBackground
      )}
    >
      <div className="flex h-14 items-center px-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="mr-4 hidden md:flex">
          <h2 className="text-lg font-semibold text-white">{navbarTitle}</h2>
        </div>
        {isMobile && (
          <h2 className="text-lg font-semibold text-white flex-1">
            {navbarTitle}
          </h2>
        )}
        <div
          className={
            isMobile
              ? "flex items-center space-x-2"
              : "flex flex-1 items-center justify-end space-x-4"
          }
        >
          <nav className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Bell fill="#FFFFFF" className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                </DialogHeader>
                <NotificationList />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Theme</h4>
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        Light
                      </Button>
                      <Button variant="outline" size="sm">
                        Dark
                      </Button>
                      <Button variant="outline" size="sm">
                        System
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      Notification Preferences
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="form-checkbox" />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="form-checkbox" />
                        <span className="text-sm">Push notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="background:white rounded-full pl-2 pr-3 py-1 h-auto hover:bg-white/10 flex items-center gap-2"
                >
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage
                      src=""
                      alt="Profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-white/10 text-white">
                      {getNameInitial()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-5 w-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || "Loading..."}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.user_type
                        ? profile.user_type.replace(/_/g, " ").toLowerCase()
                        : "Loading..."}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};
