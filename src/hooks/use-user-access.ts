import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserType } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

// Cache object to store user types by ID
const userTypeCache: Record<
  string,
  {
    userType: UserType | null;
    isSuperAdmin: boolean | null;
    timestamp: number;
  }
> = {};

// Cache expiration time in milliseconds (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

export const useUserAccess = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  // Clear cache for testing or when explicitly needed
  const clearUserTypeCache = useCallback(
    (userId?: string) => {
      if (userId) {
        delete userTypeCache[userId];
      } else if (user?.id) {
        delete userTypeCache[user.id];
      }
    },
    [user]
  );

  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        if (!user) {
          setUserType(null);
          setIsSuperAdmin(false);
          setAccessChecked(true);
          return;
        }

        // Check if we have a valid cached value for this user
        const cachedData = userTypeCache[user.id];
        const now = Date.now();

        if (cachedData && now - cachedData.timestamp < CACHE_EXPIRATION) {
          console.log("Using cached user type:", cachedData.userType);
          setUserType(cachedData.userType);
          setIsSuperAdmin(cachedData.isSuperAdmin);
          setAccessChecked(true);
          return;
        }

        // First try to get the user profile to check the user_type
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (!profileError && profile?.user_type) {
          const userTypeValue = profile.user_type as UserType;
          setUserType(userTypeValue);
          setIsSuperAdmin(userTypeValue === "super_admin");

          // Cache the result
          userTypeCache[user.id] = {
            userType: userTypeValue,
            isSuperAdmin: userTypeValue === "super_admin",
            timestamp: now,
          };

          console.log("User type from profile (and cached):", userTypeValue);
        } else {
          // Fallback to roles if profile doesn't contain user_type
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("roles(name)")
            .eq("user_id", user.id)
            .single();

          if (!roleError && roleData?.roles) {
            // Check if roles is an array or an object
            let roleName: string | null = null;

            if (Array.isArray(roleData.roles)) {
              if (roleData.roles.length > 0 && roleData.roles[0].name) {
                roleName = roleData.roles[0].name;
              }
            } else if (typeof roleData.roles === "object") {
              roleName = (roleData.roles as { name: string }).name;
            }

            if (roleName) {
              const userTypeValue = roleName as UserType;
              setUserType(userTypeValue);
              setIsSuperAdmin(userTypeValue === "super_admin");

              // Cache the result
              userTypeCache[user.id] = {
                userType: userTypeValue,
                isSuperAdmin: userTypeValue === "super_admin",
                timestamp: now,
              };

              console.log("User type from roles (and cached):", userTypeValue);
            }
          }
        }

        setAccessChecked(true);
      } catch (err) {
        console.error("Error checking user access:", err);
        setUserType(null);
        setIsSuperAdmin(false);
        setAccessChecked(true);
      }
    };

    checkUserAccess();
  }, [user]);

  return {
    user,
    userType,
    isSuperAdmin,
    accessChecked,
    clearUserTypeCache,
  };
};
