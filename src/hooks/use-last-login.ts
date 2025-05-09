import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useLastLogin = () => {
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [secondLastLogin, setSecondLastLogin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastLogin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: sessions, error: sessionError } = await supabase
          .from("audit_logs")
          .select("created_at")
          .eq("user_id", user.id)
          .eq("action", "logout")
          .order("created_at", { ascending: false })
          .limit(2);

        if (sessionError) throw sessionError;
        if (!sessions || sessions.length === 0) {
          throw new Error("No login session data found");
        }

        setLastLogin(sessions[0]?.created_at || null);
        setSecondLastLogin(sessions[1]?.created_at || null);
      } catch (error) {
        console.error("Error fetching last login time:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLastLogin();
  }, []);

  return { lastLogin, secondLastLogin, loading, error };
};

export default useLastLogin;
