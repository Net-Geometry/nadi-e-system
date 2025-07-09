import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useClaimCategorySimple = () => {
  const [categories, setCategories] = useState<any[]>([]); // State for categories with claim items
  const [error, setError] = useState<string | null>(null); // State for errors

  // Fetch all active claim items with category info on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_claim_items")
          .select(
            "id, name, need_support_doc, need_summary_report, need_appendix, category_id (id, name)"
          )
          .order("id", { ascending: true })
          .eq("is_active", true); // Filter by active items
        if (error) throw error;

        // Group items by category
        const groupedData = data.reduce((acc, item) => {
          const { category_id, ...itemDetails } = item;

          // Find or create the category in the accumulator
          let category = acc.find((cat) => cat.id === category_id.id);
          if (!category) {
            category = { ...category_id, children: [] };
            acc.push(category);
          }

          // Add the item to the category's children
          category.children.push(itemDetails);

          return acc;
        }, []);

        setCategories(groupedData);
      } catch (error) {
        console.error("Error fetching claim items:", error);
        setError(error.message);
      }
    };

    fetchItems();
  }, []);

  return { categories, error }; // Return the categories and error state
};

export default useClaimCategorySimple;