import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { type Holiday, type State } from "@/utils/holidayUtils";

export function useHolidays(initialYear: number = new Date().getFullYear()) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch holidays for the selected year
  const fetchHolidays = async (year: number) => {
    setIsLoading(true);
    try {
      const { data: holidaysData, error: holidaysError } = await supabase
        .from("nd_leave_public_holiday")
        .select("*")
        .eq("year", year)
        .eq("status", 1);

      if (holidaysError) throw holidaysError;

      // For each holiday, fetch the states
      const holidaysWithStates = await Promise.all(
        (holidaysData || []).map(async (holiday) => {
          const { data: stateAssignments, error: stateError } = await supabase
            .from("nd_leave_public_holiday_state")
            .select("state_id")
            .eq("public_holiday_id", holiday.id);

          if (stateError) throw stateError;

          // Get state details for each assignment
          const stateIds =
            stateAssignments?.map((assignment) => assignment.state_id) || [];

          if (stateIds.length === 0) {
            return {
              ...holiday,
              states: [],
            };
          }

          const { data: stateDetails, error: detailsError } = await supabase
            .from("nd_state")
            .select("id, name")
            .in("id", stateIds);

          if (detailsError) throw detailsError;

          return {
            ...holiday,
            states: stateDetails || [],
          };
        })
      );

      setHolidays(holidaysWithStates);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast({
        variant: "destructive",
        title: "Failed to load holidays",
        description: "There was an error loading the holiday data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch all states
  const fetchStates = async () => {
    try {
      const { data, error } = await supabase
        .from("nd_state")
        .select("id, name, code, abbr")
        .order("name");

      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
      toast({
        variant: "destructive",
        title: "Failed to load states",
        description: "There was an error loading the state data.",
      });
    }
  };

  useEffect(() => {
    fetchHolidays(currentYear);
    fetchStates();
  }, [currentYear]);

  return {
    currentYear,
    setCurrentYear,
    holidays,
    states,
    isLoading,
    fetchHolidays,
  };
}
