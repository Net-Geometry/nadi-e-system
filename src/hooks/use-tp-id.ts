import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useTPID = () => {
  const [tpID, setTPID] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTPID = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: techPartner, error: tpError } = await supabase
          .from("nd_tech_partner_profile")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (tpError) throw tpError;
        if (!techPartner) {
          throw new Error("No tech partner data found");
        }

        setTPID(techPartner.id);
      } catch (error) {
        console.error("Error fetching tech partner ID:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTPID();
  }, []);

  return { tpID, loading, error };
};

export default useTPID;
