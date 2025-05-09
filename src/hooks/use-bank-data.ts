import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useBankData = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_bank_list")
          .select("id, bank_name, bank_code");
        if (error) throw error;
        setBanks(data);
      } catch (error) {
        console.error("Error fetching banks:", error);
        setError(error.message);
      }
    };

    fetchBanks();
  }, []);

  return { banks, error };
};

export default useBankData;
