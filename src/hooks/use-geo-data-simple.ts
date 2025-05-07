import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const useGeoData = () => {
  const [districts, setDistricts] = useState<any[]>([]); // State for districts
  const [states, setStates] = useState<any[]>([]); // State for states
  const [error, setError] = useState<string | null>(null); // State for errors

  // Fetch all states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data, error } = await supabase.from("nd_state").select("id, region_id, code, abbr, name");
        if (error) throw error;
        setStates(data);
      } catch (error) {
        console.error("Error fetching states:", error);
        setError(error.message);
      }
    };

    fetchStates();
  }, []);

  // Function to fetch districts by state_id
  const fetchDistrictsByState = async (stateId: string) => {
    try {
      const { data, error } = await supabase
        .from("nd_district")
        .select("id, name")
        .eq("state_id", stateId); // Filter districts by state_id
      if (error) throw error;
      setDistricts(data); // Update districts state
    } catch (error) {
      console.error("Error fetching districts:", error);
      setError(error.message);
    }
  };

  return { states, districts, fetchDistrictsByState, error }; // Return the new function
};

export default useGeoData;