import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useGeoData = () => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [parliaments, setParliaments] = useState<any[]>([]);
  const [duns, setDuns] = useState<any[]>([]);
  const [mukims, setMukims] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_district")
          .select("id, state_id, code, name");
        if (error) throw error;
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setError(error.message);
      }
    };

    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_state")
          .select("id, region_id, code, abbr, name");
        if (error) throw error;
        setStates(data);
      } catch (error) {
        console.error("Error fetching states:", error);
        setError(error.message);
      }
    };

    const fetchRegions = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_region")
          .select("id, bm, eng");
        if (error) throw error;
        setRegions(data);
      } catch (error) {
        console.error("Error fetching regions:", error);
        setError(error.message);
      }
    };

    const fetchPhases = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_phases")
          .select("id, name");
        if (error) throw error;
        setPhases(data);
      } catch (error) {
        console.error("Error fetching phases:", error);
        setError(error.message);
      }
    };

    const fetchParliaments = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_parliaments")
          .select("id, state_id, refid, name, fullname");
        if (error) throw error;
        setParliaments(data);
      } catch (error) {
        console.error("Error fetching parliaments:", error);
        setError(error.message);
      }
    };

    const fetchDuns = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_duns")
          .select(
            "id, states_id, rfid_parliament, refid, name, full_name, no_of_duns"
          );
        if (error) throw error;
        setDuns(data);
      } catch (error) {
        console.error("Error fetching duns:", error);
        setError(error.message);
      }
    };

    const fetchMukims = async () => {
      try {
        const { data, error } = await supabase
          .from("nd_mukims")
          .select("id, state_id, district_id, code, name");
        if (error) throw error;
        setMukims(data);
      } catch (error) {
        console.error("Error fetching mukims:", error);
        setError(error.message);
      }
    };

    fetchDistricts();
    fetchStates();
    fetchRegions();
    fetchPhases();
    fetchParliaments();
    fetchDuns();
    fetchMukims();
  }, []);

  return {
    districts,
    states,
    regions,
    phases,
    parliaments,
    duns,
    mukims,
    error,
  };
};

export default useGeoData;
