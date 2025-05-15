import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserMetadata } from "@/hooks/use-user-metadata";

export const HeaderProfile = () => {
  const { logout, user } = useAuth();
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const siteId = parsedMetadata?.group_profile?.site_profile_id;
  const positionId = parsedMetadata?.group_profile?.position_id;

  // Fetch user profile based on userGroup
const { data: profile } = useQuery({
  queryKey: ["user-profile", user?.id, userGroup, siteId, positionId],
  queryFn: async () => {
    if (userGroup === 9 && siteId) {
      // Fetch from nd_site_profile_name if userGroup is 9
      const { data: siteData, error: siteError } = await supabase
        .from("nd_site_profile_name")
        .select("id, sitename, fullname")
        .eq("id", siteId)
        .maybeSingle();

      if (siteError) {
        console.error("Error fetching site profile:", siteError);
        throw siteError;
      }

      let userType = "tp_site";

      // Map positionId to nd_position table
      if (positionId) {
        const { data: positionData, error: positionError } = await supabase
          .from("nd_position")
          .select("name")
          .eq("id", positionId)
          .maybeSingle();

        if (positionError) {
          console.error("Error fetching position:", positionError);
          throw positionError;
        }

        userType = positionData?.name || userType;
      }

      return {
        full_name: siteData?.fullname || "N/A",
        user_type: userType,
      };
    } else if (user?.id) {
      // Fetch from profiles table for other user groups
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
    }

    return null;
  },
  enabled: !!user?.id || (userGroup === 9 && !!siteId),
});

  // Get first character of name for avatar fallback
  const getNameInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return "U"; // Default to 'U' for User if no name is available
  };

  // Format user type for display
  const formatUserType = (userType: string) => {
    if (!userType) return "";
    return userType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="pl-2 pr-3 py-2 h-auto hover:bg-gray-100 flex items-center gap-2 rounded-full"
        >
          <Avatar className="h-8 w-8 border border-gray-200">
            <AvatarImage src="" alt="Profile" className="object-cover" />
            <AvatarFallback className="bg-primary text-white">
              {getNameInitial()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium text-gray-800">
              {profile?.full_name || "User"}
            </span>
            <span className="text-xs text-gray-500">
              {profile?.user_type
                ? formatUserType(profile.user_type)
                : "Loading..."}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
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
                ? formatUserType(profile.user_type)
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
  );
};