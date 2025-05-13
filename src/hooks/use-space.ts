import { supabase } from "@/integrations/supabase/client";
import { Space } from "@/types/site";
import { useEffect, useState } from "react";

export const useSpace = () => {
  const [data, setData] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      const { data, error } = await supabase.from("nd_space").select("id, eng");

      if (error) {
        console.error("Error fetching spaces:", error);
        setError(error);
      } else {
        setData(data as Space[]);
      }
      setIsLoading(false);
    };
    fetchSpaces();
  }, []);

  return { data, isLoading, error };
};
