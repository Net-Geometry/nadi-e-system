import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/types/brand";
import { useEffect, useState } from "react";

export function useBrand() {
  const [data, setData] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("nd_brand")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching brands:", error);
        setError(error);
      } else {
        setData(data as Brand[]);
      }

      setIsLoading(false);
    };

    fetchBrands();
  }, []);

  return { data, isLoading, error };
}
