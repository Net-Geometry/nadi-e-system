import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  MenuVisibility,
  SubmoduleVisibility,
} from "@/components/settings/types/menu-visibility.types";
import { UserType } from "@/types/auth";

export const useMenuPathVisibility = (
  mainPath: string,
  subPath: string | null,
  userType: UserType | null
) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRouteAccess = async () => {
      if (!userType || userType === "super_admin") {
        // Super admins always have access
        setHasAccess(true);
        setLoading(false);
        return;
      }

      try {
        console.log(
          `Checking route access for ${userType} to path: ${mainPath}/${subPath}`
        );

        // Check main menu access
        const { data: menuData } = await supabase
          .from("menu_visibility")
          .select("*")
          .eq("menu_key", mainPath)
          .maybeSingle();

        // If there's no menu visibility record, allow access by default
        if (!menuData) {
          console.log(
            `No menu visibility record for ${mainPath}, allowing access`
          );
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check if user type is allowed to access this menu
        if (!menuData.visible_to.includes(userType)) {
          console.log(`User ${userType} denied access to ${mainPath} menu`);
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check submodule access if applicable
        if (subPath) {
          const { data: submoduleData } = await supabase
            .from("submodule_visibility")
            .select("*")
            .eq("parent_module", mainPath)
            .eq("submodule_key", subPath)
            .maybeSingle();

          // If there's a submodule record and user isn't allowed
          if (submoduleData && !submoduleData.visible_to.includes(userType)) {
            console.log(
              `User ${userType} denied access to ${mainPath}/${subPath} submodule`
            );
            setHasAccess(false);
            setLoading(false);
            return;
          }
        }

        // If we got here, user has access
        setHasAccess(true);
        setLoading(false);
      } catch (err) {
        console.error("Error checking route access:", err);
        // Default to allowing access if there's an error checking
        setHasAccess(true);
        setLoading(false);
      }
    };

    checkRouteAccess();
  }, [mainPath, subPath, userType]);

  return { hasAccess, loading };
};
