import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useStaffID = () => {
  const [staffID, setStaffID] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffID = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: contract, error: contractError } = await supabase
          .from("nd_staff_contract")
          .select("staff_id")
          .eq("user_id", user.id)
          .single();

        if (contractError) throw contractError;
        if (!contract) {
          throw new Error("No contract data found");
        }

        setStaffID(contract.staff_id);
      } catch (error) {
        console.error("Error fetching staff ID:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffID();
  }, []);

  return { staffID, loading, error };
};

export default useStaffID;
