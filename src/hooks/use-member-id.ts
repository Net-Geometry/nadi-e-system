import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const useMemberID = () => {
  const [memberID, setMemberID] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberID = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: member, error: memberError } = await supabase
          .from("nd_member_profile")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (memberError) throw memberError;
        if (!member) {
          throw new Error("No member data found");
        }

        setMemberID(member.id);
      } catch (error) {
        console.error("Error fetching member ID:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberID();
  }, []);

  return { memberID, loading, error };
};

export default useMemberID;
