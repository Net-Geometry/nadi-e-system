import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useClaimCategorySimple = () => {
  const [categories, setCategories] = useState<any[]>([]); // State for claim categories
  const [items, setItems] = useState<any[]>([]); // State for claim items
  const [error, setError] = useState<string | null>(null); // State for errors

  // Fetch all active claim categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_claim_categories")
          .select("id, name, description")
          .eq("is_active", true); // Filter by active categories
        if (error) throw error;
        setCategories(data);
      } catch (error) {
        console.error("Error fetching claim categories:", error);
        setError(error.message);
      }
    };

    fetchCategories();
  }, []);

  // Function to fetch claim items by category_id
  const fetchItemsByCategory = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from("nd_claim_items")
        .select("id, name, description, need_support_doc, need_summary_report")
        .eq("category_id", categoryId) // Filter items by category_id
        .eq("is_active", true); // Filter by active items
      if (error) throw error;
      setItems(data); // Update items state
    } catch (error) {
      console.error("Error fetching claim items:", error);
      setError(error.message);
    }
  };

  return { categories, items, fetchItemsByCategory, error }; // Return the states and functions
};

export default useClaimCategorySimple;