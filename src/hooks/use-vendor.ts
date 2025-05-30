import { supabase } from "@/integrations/supabase/client";
import { Vendor } from "@/types/vendor";
import { useEffect, useState } from "react";

export const useVendors = () => {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data: vendors, error: vendorError } = await supabase
          .from("nd_vendor_profile")
          .select(`*`);

        if (vendorError) throw vendorError;
        if (!vendors) {
          throw new Error("No vendor data found");
        }

        setData(vendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return { data, loading, error };
};

export const useVendorProfileId = (isVendorUser?: boolean) => {
  const [vendorId, setVendorId] = useState<number | null>(null);

  useEffect(() => {
    if (!isVendorUser) return;

    const fetchVendorByUserId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("nd_vendor_staff")
          .select("registration_number")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        setVendorId(data.registration_number);
      } catch (error) {
        console.error("Error fetching vendor ID:", error);
      }
    };

    fetchVendorByUserId();
  }, [isVendorUser]);

  return isVendorUser ? vendorId : null;
};
