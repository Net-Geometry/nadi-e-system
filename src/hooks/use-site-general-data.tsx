import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const useSiteGeneralData = () => {
  const [siteStatus, setSiteStatus] = useState<any[]>([]);
  const [technology, setTechnology] = useState<any[]>([]);
  const [bandwidth, setBandwidth] = useState<any[]>([]);
  const [buildingType, setBuildingType] = useState<any[]>([]);
  const [space, setSpace] = useState<any[]>([]);
  const [zone, setZone] = useState<any[]>([]);
  const [categoryArea, setCategoryArea] = useState<any[]>([]);
  const [buildingLevel, setBuildingLevel] = useState<any[]>([]);
  const [socioEconomics, setSocioEconomic] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteStatus = async () => {
      try {
        const { data, error } = await supabase.from("nd_site_status").select("id, eng, bm");
        if (error) throw error;
        setSiteStatus(data);
      } catch (error) {
        console.error("Error fetching site status:", error);
        setError(error.message);
      }
    };

    const fetchTechnology = async () => {
      try {
        const { data, error } = await supabase.from("nd_technology").select("id, name");
        if (error) throw error;
        setTechnology(data);
      } catch (error) {
        console.error("Error fetching technology:", error);
        setError(error.message);
      }
    };

    const fetchBandwidth = async () => {
      try {
        const { data, error } = await supabase.from("nd_bandwidth").select("id, name");
        if (error) throw error;
        setBandwidth(data);
      } catch (error) {
        console.error("Error fetching bandwidth:", error);
        setError(error.message);
      }
    };

    const fetchBuildingType = async () => {
      try {
        const { data, error } = await supabase.from("nd_building_type").select("id, bm, eng");
        if (error) throw error;
        setBuildingType(data);
      } catch (error) {
        console.error("Error fetching building type:", error);
        setError(error.message);
      }
    };

    const fetchSpace = async () => {
      try {
        const { data, error } = await supabase.from("nd_space").select("id, bm, eng");
        if (error) throw error;
        setSpace(data);
      } catch (error) {
        console.error("Error fetching space:", error);
        setError(error.message);
      }
    };

    const fetchZone = async () => {
      try {
        const { data, error } = await supabase.from("nd_zone").select("id, area, zone");
        if (error) throw error;
        setZone(data);
      } catch (error) {
        console.error("Error fetching zone:", error);
        setError(error.message);
      }
    };

    const fetchCategoryArea = async () => {
      try {
        const { data, error } = await supabase.from("nd_category_area").select("id, name");
        if (error) throw error;
        setCategoryArea(data);
      } catch (error) {
        console.error("Error fetching category area:", error);
        setError(error.message);
      }
    };

    const fetchBuildingLevel = async () => {
      try {
        const { data, error } = await supabase.from("nd_building_level").select("id, bm, eng");
        if (error) throw error;
        setBuildingLevel(data);
      } catch (error) {
        console.error("Error fetching building level:", error);
        setError(error.message);
      }
    };

    const fetchSocioeconomic = async () => {
      try {
        const { data, error } = await supabase.from("nd_socioeconomics").select("id, sector_id, eng, bm");
        if (error) throw error;
        setSocioEconomic(data);
      } catch (error) {
        console.error("Error fetching socio economic:", error);
        setError(error.message);
      }
    };

    fetchSiteStatus();
    fetchTechnology();
    fetchBandwidth();
    fetchBuildingType();
    fetchSpace();
    fetchZone();
    fetchCategoryArea();
    fetchBuildingLevel();
    fetchSocioeconomic();
  }, []);

  return { siteStatus, technology, bandwidth, buildingType, space, zone, categoryArea, buildingLevel, socioEconomics, error };
};

export default useSiteGeneralData;