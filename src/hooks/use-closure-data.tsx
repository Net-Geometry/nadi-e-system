import { useMemo, useState } from "react";
import { ClosureData } from "../../types/TableTypes";

export const useClosureData = (
  closurelistdata: ClosureData[] | undefined,
  user: any,
  isSuperAdmin: boolean
) => {
  // State for sorting
  const [sortField, setSortField] = useState<string>("requestor");
  const [sortDirection, setSortDirection] = useState<string>("desc");

  // States for filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [regionFilters, setRegionFilters] = useState<string[]>([]);
  const [stateFilters, setStateFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [duspFilters, setDuspFilters] = useState<string[]>([]);
  const [tpFilters, setTpFilters] = useState<string[]>([]);

  // States for selected filters in the UI
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);
  const [selectedRegionFilters, setSelectedRegionFilters] = useState<string[]>([]);
  const [selectedStateFilters, setSelectedStateFilters] = useState<string[]>([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
  const [selectedDuspFilters, setSelectedDuspFilters] = useState<string[]>([]);
  const [selectedTpFilters, setSelectedTpFilters] = useState<string[]>([]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategoryFilters([]);
    setSelectedRegionFilters([]);
    setSelectedStateFilters([]);
    setSelectedStatusFilters([]);
    setSelectedDuspFilters([]);
    setSelectedTpFilters([]);
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCategoryFilters(selectedCategoryFilters);
    setRegionFilters(selectedRegionFilters);
    setStateFilters(selectedStateFilters);
    setStatusFilters(selectedStatusFilters);
    setDuspFilters(selectedDuspFilters);
    setTpFilters(selectedTpFilters);
  };

  const getActiveFilterCount = () => {
    return (
      categoryFilters.length +
      regionFilters.length +
      stateFilters.length +
      statusFilters.length +
      duspFilters.length +
      tpFilters.length
    );
  };

  const hasActiveFilters =
    categoryFilters.length > 0 ||
    regionFilters.length > 0 ||
    stateFilters.length > 0 ||
    statusFilters.length > 0 ||
    duspFilters.length > 0 ||
    tpFilters.length > 0;

  // Apply filtering and sorting to the data
  const filteredAndSortedData = useMemo(() => {
    if (!closurelistdata || !user) return [];

    // Filter for drafts (only show user's own drafts unless super admin)
    let filtered = closurelistdata.filter((item) => {
      if (!isSuperAdmin && item.nd_closure_status?.name === "Draft") {
        return item.created_by === user.id;
      }
      return true;
    });

    // Apply DUSP filter - updated to use array
    if (duspFilters.length > 0) {
      filtered = filtered.filter((item) =>
        duspFilters.includes(
          item.nd_site_profile?.organizations?.parent_id?.id || ""
        )
      );
    }

    // Apply TP filter - updated to use array
    if (tpFilters.length > 0) {
      filtered = filtered.filter((item) =>
        tpFilters.includes(item.nd_site_profile?.organizations?.id || "")
      );
    }

    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.nd_site_profile?.sitename || "")
            .toLowerCase()
            .includes(search) ||
          (item.nd_site_profile?.nd_site?.[0]?.standard_code || "")
            .toLowerCase()
            .includes(search) ||
          (item.profiles?.full_name || "").toLowerCase().includes(search) ||
          (item.nd_closure_categories?.eng || "")
            .toLowerCase()
            .includes(search) ||
          (item.nd_closure_status?.name || "").toLowerCase().includes(search)
      );
    }

    // Apply dropdown filters
    filtered = filtered.filter(
      (item) =>
        (categoryFilters.length > 0
          ? categoryFilters.includes(item.nd_closure_categories?.eng || "")
          : true) &&
        (regionFilters.length > 0
          ? regionFilters.includes(item.nd_site_profile?.region_id?.eng || "")
          : true) &&
        (stateFilters.length > 0
          ? stateFilters.includes(item.nd_site_profile?.state_id?.name || "")
          : true) &&
        (statusFilters.length > 0
          ? statusFilters.includes(item.nd_closure_status?.name || "")
          : true)
    );

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let valueA;
        let valueB;

        // Extract values based on sort field
        switch (sortField) {
          case "siteInfo":
            valueA = a.nd_site_profile?.sitename || "";
            valueB = b.nd_site_profile?.sitename || "";
            break;
          case "state":
            valueA = a.nd_site_profile?.state_id?.name || "";
            valueB = b.nd_site_profile?.state_id?.name || "";
            break;
          case "region":
            valueA = a.nd_site_profile?.region_id?.eng || "";
            valueB = b.nd_site_profile?.region_id?.eng || "";
            break;
          case "organization":
            valueA = a.nd_site_profile?.organizations?.name || "";
            valueB = b.nd_site_profile?.organizations?.name || "";
            break;
          case "tp":
            valueA = a.nd_site_profile?.organizations?.name || "";
            valueB = b.nd_site_profile?.organizations?.name || "";
            break;
          case "requestor":
            valueA = a.profiles?.full_name || "";
            valueB = b.profiles?.full_name || "";
            break;
          case "closurePeriod":
            valueA = a.request_datetime || a.created_at || "";
            valueB = b.request_datetime || b.created_at || "";
            break;
          case "duration":
            valueA = a.duration || 0;
            valueB = b.duration || 0;
            break;
          case "category":
            valueA = a.nd_closure_categories?.eng || "";
            valueB = b.nd_closure_categories?.eng || "";
            break;
          case "status":
            valueA = a.nd_closure_status?.name || "";
            valueB = b.nd_closure_status?.name || "";
            break;
          default:
            valueA = a[sortField] || "";
            valueB = b[sortField] || "";
        }

        // Compare values
        if (typeof valueA === "string" && typeof valueB === "string") {
          if (sortDirection === "asc") {
            return valueA.localeCompare(valueB);
          } else {
            return valueB.localeCompare(valueA);
          }
        } else {
          if (sortDirection === "asc") {
            return valueA - valueB;
          } else {
            return valueB - valueA;
          }
        }
      });
    }

    return filtered;
  }, [
    closurelistdata,
    user,
    isSuperAdmin,
    searchTerm,
    categoryFilters,
    regionFilters,
    stateFilters,
    statusFilters,
    duspFilters,
    tpFilters,
    sortField,
    sortDirection,
  ]);

  return {
    // Sorting state
    sortField,
    sortDirection,
    handleSort,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    categoryFilters,
    regionFilters,
    stateFilters,
    statusFilters,
    duspFilters,
    tpFilters,
    setCategoryFilters,
    setRegionFilters,
    setStateFilters,
    setStatusFilters,
    setDuspFilters,
    setTpFilters,
    
    // Selected filter states for UI
    selectedCategoryFilters,
    selectedRegionFilters,
    selectedStateFilters,
    selectedStatusFilters,
    selectedDuspFilters,
    selectedTpFilters,
    setSelectedCategoryFilters,
    setSelectedRegionFilters,
    setSelectedStateFilters,
    setSelectedStatusFilters,
    setSelectedDuspFilters,
    setSelectedTpFilters,
    
    // Filter handlers
    handleResetFilters,
    handleApplyFilters,
    getActiveFilterCount,
    hasActiveFilters,
    
    // Processed data
    filteredAndSortedData,
  };
};
