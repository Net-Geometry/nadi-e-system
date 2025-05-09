import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSiteProfile = (id: string) => {
  const [data, setData] = useState<any>(null);
  const [socioeconomics, setSocioeconomics] = useState<any[]>([]);
  const [space, setSpace] = useState<any[]>([]);
  const [address, setAddress] = useState<any>(null); // <-- Added address state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteProfile = async () => {
      try {
        // Fetch site profile
        const { data: siteData, error: siteError } = await supabase
          .from("nd_site_profile")
          .select(
            `
            *,
            region_id (eng, bm),
            phase_id (name),
            state_id (abbr, name),
            parliament_rfid (fullname),
            dun_rfid (full_name),
            mukim_id (name),
            active_status (eng, bm),
            technology (name),
            bandwidth (name),
            building_type_id (eng, bm),
            zone_id (zone, area),
            area_id (name),
            level_id (eng, bm)
          `
          )
          .eq("id", id)
          .single();

        if (siteError) throw siteError;

        setData(siteData);

        // Fetch socioeconomic data
        const { data: socioeconomicData, error: socioeconomicError } =
          await supabase
            .from("nd_site_socioeconomic")
            .select(
              `
            socioeconomic_id (eng, bm)
          `
            )
            .eq("site_id", id);

        if (socioeconomicError) throw socioeconomicError;

        setSocioeconomics(
          socioeconomicData.map((item) => item.socioeconomic_id)
        );

        // Fetch space data
        const { data: spaceData, error: spaceError } = await supabase
          .from("nd_site_space")
          .select(`space_id (eng, bm)`)
          .eq("site_id", id);

        if (spaceError) throw spaceError;

        setSpace(spaceData.map((item) => item.space_id));

        // Fetch address data
        const { data: addressData, error: addressError } = await supabase
          .from("nd_site_address")
          .select(
            `
            address1,
            address2,
            district_id (code, name),
            state_id (code, abbr, name),
            city,
            postcode
          `
          )
          .eq("site_id", id)
          .single();

        if (addressError) throw addressError;

        setAddress(addressData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteProfile();
  }, [id]);

  return { data, socioeconomics, space, address, loading, error }; // <-- return address
};
