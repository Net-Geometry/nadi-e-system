import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../use-toast";
import { handleAuthError } from "./utils/auth-error-handler";
import { createUserSession } from "./utils/session-handler";
import { fetchUserProfile } from "./utils/profile-handler";
import { fetchOrganizationDetails } from "./utils/organization-handler";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting login for email:", email);

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error("Authentication error:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("No user data returned after successful auth");
      }

      console.log("Auth successful, checking profile...");

      // ✅ Fetch user profile with group_profile
      const { profile, profileError } = await fetchUserProfile(
        authData.user.id
      );

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      // ✅ Fetch organization details (optional logic)
      const { organizationId, organizationName } =
        await fetchOrganizationDetails(authData.user.id, profile);

      // ✅ Prepare metadata
      const userMetadata: Record<string, any> = {
        user_type: profile?.user_type || "member",
        organization_id: organizationId,
        organization_name: organizationName,
        group_profile: profile?.group_profile || null,
      };

      if (profile?.user_group) {
        userMetadata.user_group = profile.user_group;
        userMetadata.user_group_name =
          profile.nd_user_group?.group_name || null;
      }

      if (profile?.user_type == "tp_site") {
        const siteId = await supabase
          .from("nd_site_user")
          .select("site_profile_id")
          .eq("user_id", authData.user.id)
          .single();
        userMetadata.group_profile.site_profile_id =
          siteId.data?.site_profile_id || null;
      }

      console.log("User metadata:", userMetadata);

      // ✅ Store session
      createUserSession(authData.user, profile, userMetadata);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = handleAuthError(error);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
  };
};
