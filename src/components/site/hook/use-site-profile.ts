import { useState, useEffect } from "react";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";

export const useSiteProfile = (id: string) => {
  const [data, setData] = useState<any>(null);
  const [socioeconomics, setSocioeconomics] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any>(null); // <-- Add this state
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
            dusp_tp_id (id, name, type, logo_url),
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
          socioeconomicData && socioeconomicData.length > 0
            ? socioeconomicData.map((item) => item.socioeconomic_id)
            : []
        );

        // Fetch space data
        const { data: spaceData, error: spaceError } = await supabase
          .from("nd_site_space")
          .select(`space_id (eng, bm)`)
          .eq("site_id", id);

        if (spaceError) throw spaceError;

        setSpace(
          spaceData && spaceData.length > 0
            ? spaceData.map((item) => item.space_id)
            : []
        );

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

        if (addressError && addressError.code !== "PGRST116") throw addressError;

        setAddress(addressData ?? null);

        // Fetch organization data
        if (siteData?.dusp_tp_id?.id) {
          const { data: orgData, error: orgError } = await supabase
            .from("organizations")
            .select("parent_id")
            .eq("id", siteData.dusp_tp_id.id)
            .single();

          if (orgError) throw orgError;

          setOrganization(orgData);

          // Fetch parent organization details if parent_id exists
          if (orgData?.parent_id) {
            const { data: parentOrg, error: parentOrgError } = await supabase
              .from("organizations")
              .select("id, name, type, logo_url")
              .eq("id", orgData.parent_id)
              .single();

            if (parentOrgError) throw parentOrgError;

            // You can set this in a new state, or combine with organization as needed
            setOrganization((prev: any) => ({
              ...prev,
              parent: parentOrg,
            }));
          }
        } else {
          setOrganization(null);
        }

      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteProfile();
  }, [id]);

  return { data, socioeconomics, space, address, organization, loading, error }; // <-- return organization
};

export const useSiteStats = (siteId: string) => {
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [activeMembers, setActiveMembers] = useState<number>(0);
  const [staffMembers, setStaffMembers] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(45000); // Static value
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch total members
        const { count: totalMembersCount, error: totalMembersError } = await supabase
          .from("nd_member_profile")
          .select("*", { count: "exact", head: true })
          .eq("ref_id", siteId);

        if (totalMembersError) throw totalMembersError;
        setTotalMembers(totalMembersCount || 0);

        // Fetch active members
        const { count: activeMembersCount, error: activeMembersError } = await supabase
          .from("nd_member_profile")
          .select("*", { count: "exact", head: true })
          .eq("ref_id", siteId)
          .eq("status_membership", 1);

        if (activeMembersError) throw activeMembersError;
        setActiveMembers(activeMembersCount || 0);

        // Fetch staff members
        const { count: staffMembersCount, error: staffMembersError } = await supabase
          .from("nd_site_user")
          .select("*", { count: "exact", head: true })
          .eq("site_profile_id", siteId);

        if (staffMembersError) throw staffMembersError;
        setStaffMembers(staffMembersCount || 0);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [siteId]);

  return { totalMembers, activeMembers, staffMembers, totalRevenue, loading, error };
};

export const useSiteOperationHours = (siteId: string) => {
  const [operationHours, setOperationHours] = useState<
    Array<{
      days_of_week: string;
      open_time: string | null;
      close_time: string | null;
      is_close: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperationHours = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("nd_site_operation")
          .select("days_of_week, open_time, close_time, is_closed")
          .eq("site_id", siteId);

        if (error) throw error;
        setOperationHours(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOperationHours();
  }, [siteId]);

  return { operationHours, loading, error };
};

export const useSiteProfileImages = (siteId: string) => {
  const [file_path, setFilePath] = useState<string[]>([
    "/nadi-site.jpg",
    "/nadi-site2.jpg",
    "/nadi-site3.jpg",
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileImages = async () => {
      if (!siteId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("nd_site_image")
          .select("file_path")
          .eq("site_profile_id", siteId);

        if (error) throw error;

        if (data && data.length > 0 && Array.isArray(data[0].file_path) && data[0].file_path.length > 0) {
          const publicUrls = data[0].file_path.map(
            (path: string) => `${SUPABASE_URL}${path}`
          );
          setFilePath(publicUrls);
        } else {
          setFilePath([
            "/nadi-site.jpg",
            "/nadi-site2.jpg",
            "/nadi-site3.jpg",
          ]);
        }
      } catch (err: any) {
        setError(err.message);
        setFilePath([
          "/nadi-site.jpg",
          "/nadi-site2.jpg",
          "/nadi-site3.jpg",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileImages();
  }, [siteId]);

  return { file_path, loading, error };
};