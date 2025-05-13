import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useMCMCPID = () => {
  const [mcmcID, setMCMCID] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMCMCID = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: mcmc, error: mcmcError } = await supabase
          .from("nd_mcmc_profile")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (mcmcError) throw mcmcError;
        if (!mcmc) {
          throw new Error("No MCMC data found");
        }

        setMCMCID(mcmc.id);
      } catch (error) {
        console.error("Error fetching MCMC ID:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMCMCID();
  }, []);

  return { mcmcID, loading, error };
};

export default useMCMCPID;
