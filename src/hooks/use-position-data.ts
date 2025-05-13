import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const usePositionData = () => {
  const [positions, setPositions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_position")
          .select("id, name");
        if (error) throw error;
        setPositions(data);
      } catch (error) {
        console.error("Error fetching positions:", error);
        setError(error.message);
      }
    };

    fetchPositions();
  }, []);

  return { positions, error };
};

export default usePositionData;
