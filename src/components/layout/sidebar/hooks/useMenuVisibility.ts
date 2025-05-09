import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  MenuVisibility,
  SubmoduleVisibility,
} from "@/components/settings/types/menu-visibility.types";
import { UserType } from "@/types/auth";
import { useToast } from "@/components/ui/use-toast";

export const useMenuVisibility = (userId: string | undefined) => {
  const { toast } = useToast();
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibility[]>([]);
  const [submoduleVisibility, setSubmoduleVisibility] = useState<
    SubmoduleVisibility[]
  >([]);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user's role/type
  useEffect(() => {
    const fetchUserType = async () => {
      if (!userId) return;

      try {
        // First try to get the user profile to check the user_type
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", userId)
          .single();

        if (!profileError && profileData?.user_type) {
          console.log("Setting user type from profile:", profileData.user_type);
          setUserType(profileData.user_type as UserType);
          return;
        }

        // Fallback to user_roles if profile check fails
        const { data, error } = await supabase
          .from("user_roles")
          .select("roles(name)")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          toast({
            title: "Error",
            description: "Could not fetch user permissions",
            variant: "destructive",
          });
          return;
        }

        const roleData = data as { roles: { name: string }[] };
        if (roleData?.roles?.[0]?.name) {
          console.log("Setting user type from roles:", roleData.roles[0].name);
          setUserType(roleData.roles[0].name as UserType);
        }
      } catch (error) {
        console.error("Error in fetchUserType:", error);
      }
    };

    fetchUserType();
  }, [userId, toast]);

  // Fetch menu visibility settings
  useEffect(() => {
    const fetchVisibilitySettings = async () => {
      setLoading(true);
      try {
        console.log("Fetching visibility settings for:", userType);
        // Fetch menu visibility
        const { data: menuData, error: menuError } = await supabase
          .from("menu_visibility")
          .select("*")
          .contains("visible_to", [userType]);

        if (menuError) {
          console.error("Error fetching menu visibility:", menuError);
          return;
        }

        // console.log("Fetched menu visibility:", menuData);
        setMenuVisibility(menuData || []);

        // Fetch submodule visibility
        const { data: submoduleData, error: submoduleError } = await supabase
          .from("submodule_visibility")
          .select("*");

        if (submoduleError) {
          console.error("Error fetching submodule visibility:", submoduleError);
          return;
        }

        // console.log("Fetched submodule visibility:", submoduleData);
        setSubmoduleVisibility(submoduleData || []);
      } catch (error) {
        console.error("Error in fetchVisibilitySettings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userType) {
      fetchVisibilitySettings();
    }
  }, [userType]);

  return {
    menuVisibility,
    submoduleVisibility,
    userType,
    loading,
  };
};
