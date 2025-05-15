import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  userTypeFilter: string;
  onUserTypeFilterChange: (value: string) => void;
  onExport: () => void;
  onApplyFilters: () => void;
  siteFilter: string;
  onSiteFilterChange: (value: string) => void;
  phaseFilter: string;
  onPhaseFilterChange: (value: string) => void;
  stateFilter: string;
  onStateFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onReset: () => void;
}

interface userType {
  name: string;
  description: string;
}

export const UserSearch = ({
  searchQuery,
  onSearchChange,
  userTypeFilter,
  onUserTypeFilterChange,
  onExport,
  onApplyFilters,
  siteFilter,
  onSiteFilterChange,
  phaseFilter,
  onPhaseFilterChange,
  stateFilter,
  onStateFilterChange,
  dateFilter,
  onDateFilterChange,
  onReset,
}: UserSearchProps) => {
  const [userTypes, setUserTypes] = useState<userType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<string[]>([
    "All Sites",
    "East Branch",
    "South Branch",
    "Main Center",
  ]);
  const [phases, setPhases] = useState<string[]>([
    "All Phases",
    "Onboarding",
    "Active",
    "Senior",
    "Advanced",
  ]);
  const [states, setStates] = useState<string[]>([
    "All States",
    "California",
    "Florida",
    "New York",
    "Texas",
  ]);

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("roles")
          .select("name, description")
          .order("name");

        if (error) {
          console.error("Error fetching roles:", error);
          throw error;
        }

        setUserTypes(data as userType[]);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTypes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search users by name, email or phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-3 pr-4 py-2 h-12 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-[#6E41E2]"
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Select value={siteFilter} onValueChange={onSiteFilterChange}>
          <SelectTrigger className="w-32 bg-white border-gray-200">
            <SelectValue placeholder="Site" />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem
                key={site}
                value={site === "All Sites" ? "all_sites" : site}
              >
                {site}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={phaseFilter} onValueChange={onPhaseFilterChange}>
          <SelectTrigger className="w-32 bg-white border-gray-200">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            {phases.map((phase) => (
              <SelectItem
                key={phase}
                value={phase === "All Phases" ? "all_phases" : phase}
              >
                {phase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stateFilter} onValueChange={onStateFilterChange}>
          <SelectTrigger className="w-32 bg-white border-gray-200">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem
                key={state}
                value={state === "All States" ? "all_states" : state}
              >
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-44 bg-white border-gray-200">
            <SelectValue placeholder="Date Registered" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_dates">All Dates</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onReset}
          className="border-gray-200 hover:bg-gray-50"
        >
          Reset
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onExport}
            className="border-gray-200 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button
            onClick={onApplyFilters}
            className="bg-[#6E41E2] hover:bg-[#5a33c9]"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
