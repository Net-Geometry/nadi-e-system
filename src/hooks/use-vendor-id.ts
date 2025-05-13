import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const usevendorID = () => {
  const [vendorID, setvendorID] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchvendorID = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: contract, error: contractError } = await supabase
          .from("nd_vendor_contract")
          .select("vendor_staff_id")
          .eq("user_id", user.id)
          .single();

        if (contractError) throw contractError;
        if (!contract) {
          throw new Error("No contract data found");
        }

        setvendorID(contract.vendor_staff_id);
      } catch (error) {
        console.error("Error fetching vendor ID:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchvendorID();
  }, []);

  return { vendorID, loading, error };
};

export default usevendorID;
