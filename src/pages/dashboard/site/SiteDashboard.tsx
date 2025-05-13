import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Package, Settings, DollarSign, Plus, CheckCircle, Clock, PauseCircle, Building2, Bell, Search, Download, Filter, RotateCcw, Users, Eye, EyeOff, Edit, Trash2, MapPin, Calendar, ChevronsUpDown, X, Check, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SiteList } from "@/components/site/SiteList";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SiteFormDialog } from "@/components/site/SiteFormDialog";
import { fetchSites, fetchRegion, fetchPhase, fetchAllStates, fetchSiteStatus, Site, toggleSiteActiveStatus, deleteSite } from "@/components/site/hook/site-utils";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useNavigate } from 'react-router-dom';
import { fetchActionableRequestCount } from "@/components/site/queries/site-closure";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { exportSitesToCSV } from "@/utils/export-utils";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/site/TableSkeleton";

const SiteDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isTPUser = parsedMetadata?.user_group_name === "TP" && !!parsedMetadata?.organization_id;
  const isDUSPUser = parsedMetadata?.user_group_name === "DUSP" && !!parsedMetadata?.organization_id;
  const isMCMCUser = parsedMetadata?.user_group_name === "MCMC"; // MCMC users don't require organization_id
  const isRestrictedUser = isDUSPUser || isMCMCUser; // Combined check for both DUSP and MCMC users
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
      (isTPUser || isDUSPUser) &&
      parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;
  // MCMC users don't need an organization_id for access

  const queryClient = useQueryClient();

  // State for sorting and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Selected filters (pending application)
  const [selectedPhaseFilters, setSelectedPhaseFilters] = useState<string[]>([]);
  const [selectedRegionFilters, setSelectedRegionFilters] = useState<string[]>([]);
  const [selectedStateFilters, setSelectedStateFilters] = useState<string[]>([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>([]);
  const [selectedDuspFilters, setSelectedDuspFilters] = useState<string[]>([]);
  const [selectedTpFilters, setSelectedTpFilters] = useState<string[]>([]);

  // Applied filters (used in actual filtering)
  const [phaseFilters, setPhaseFilters] = useState<string[]>([]);
  const [regionFilters, setRegionFilters] = useState<string[]>([]);
  const [stateFilters, setStateFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [appliedDuspFilters, setAppliedDuspFilters] = useState<string[]>([]);
  const [appliedTpFilters, setAppliedTpFilters] = useState<string[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const pageSize = 10;

  // State for selected sites
  const [selectedSites, setSelectedSites] = useState<string[]>([]);

  // Fetch sites data with sorting and filtering
  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['sites', organizationId, searchTerm, sortField, sortDirection, currentPage, phaseFilters, regionFilters, stateFilters, statusFilters, appliedDuspFilters, appliedTpFilters],
    queryFn: async () => {
      console.log("ismcmcuser", isMCMCUser);
      const sites = await fetchSites(organizationId, isTPUser, isDUSPUser, isMCMCUser);

      // Apply search filter
      let filteredSites = sites.filter(site =>
        site.sitename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.nd_site[0]?.standard_code.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply dropdown filters
      filteredSites = filteredSites.filter(site =>
        (phaseFilters.length > 0 ? phaseFilters.includes(site.nd_phases?.name || "") : true) &&
        (regionFilters.length > 0 ? regionFilters.includes(site.nd_region?.eng || "") : true) &&
        (stateFilters.length > 0 ?
          (site.nd_site_address && site.nd_site_address.length > 0 &&
            stateFilters.includes(states.find(s => s.id === site.nd_site_address[0]?.state_id)?.name || "")) :
          true) &&
        (statusFilters.length > 0 ? statusFilters.includes(site.nd_site_status?.eng || "") : true) &&
        // Apply DUSP filter
        (appliedDuspFilters.length > 0 ? appliedDuspFilters.includes(site.dusp_tp?.parent?.id || "") : true) &&
        // Apply TP filter
        (appliedTpFilters.length > 0 ? appliedTpFilters.includes(site.dusp_tp?.id || "") : true)
      );

      // Apply sorting
      if (sortField) {
        filteredSites.sort((a, b) => {
          let valueA, valueB;

          // Handle different fields
          switch (sortField) {
            case 'sitename':
              valueA = a.sitename || '';
              valueB = b.sitename || '';
              break;
            case 'site_code':
              valueA = a.nd_site[0]?.standard_code || '';
              valueB = b.nd_site[0]?.standard_code || '';
              break;
            case 'phase':
              valueA = a.nd_phases?.name || '';
              valueB = b.nd_phases?.name || '';
              break;
            case 'region':
              valueA = a.nd_region?.eng || '';
              valueB = b.nd_region?.eng || '';
              break;
            case 'state':
              valueA = states.find(s => s.id === a.nd_site_address[0]?.state_id)?.name || '';
              valueB = b.nd_site_address[0]?.state_id ? states.find(s => s.id === b.nd_site_address[0]?.state_id)?.name || '' : '';
              break;
            case 'dusp_tp':
              valueA = a.dusp_tp_id_display || '';
              valueB = b.dusp_tp_id_display || '';
              break;
            case 'status':
              valueA = a.nd_site_status?.eng || '';
              valueB = b.nd_site_status?.eng || '';
              break;
            default:
              valueA = a[sortField as keyof Site] || '';
              valueB = b[sortField as keyof Site] || '';
          }

          // Compare based on direction
          if (sortDirection === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
      }

      // Calculate total and paginate
      const totalCount = filteredSites.length;
      const paginatedSites = filteredSites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

      return {
        data: paginatedSites,
        count: totalCount,
        allSites: sites // Keep original data for stats
      };
    },
    enabled: !!organizationId || isSuperAdmin || isMCMCUser,
  });

  // Fetch filter options
  const { data: phases = [] } = useQuery({
    queryKey: ['phases'],
    queryFn: fetchPhase,
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegion,
  });

  const { data: states = [] } = useQuery({
    queryKey: ['states'],
    queryFn: fetchAllStates,
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: fetchSiteStatus,
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewDetailsClick = (siteId: string) => {
    navigate(`/site-management/site?id=${siteId}`);
  };

  const handleEditClick = (site: Site) => {
    // Set the site to edit and open the dialog
    setSiteToEdit(site);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (site: Site) => {
    try {
      await toggleSiteActiveStatus(site.id, site.is_active);
      // Invalidate and refetch the sites query to update the UI
      // This will trigger a re-render with the updated visibility status
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
      toast({
        title: `Site visibility updated`,
        description: `The site ${site.sitename} visibility has been successfully updated.`,
      });
    } catch (error) {
      console.error("Failed to update site visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update the site visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (siteId: string) => {
    setSiteToDelete(siteId);
    setIsDeleteDialogOpen(true);
  };

  const handleResetFilters = () => {
    // Reset search term
    setSearchTerm("");

    // Reset selected filters (pending)
    setSelectedPhaseFilters([]);
    setSelectedRegionFilters([]);
    setSelectedStateFilters([]);
    setSelectedStatusFilters([]);
    setSelectedDuspFilters([]);
    setSelectedTpFilters([]);

    // Reset applied filters (active)
    setPhaseFilters([]);
    setRegionFilters([]);
    setStateFilters([]);
    setStatusFilters([]);
    setAppliedDuspFilters([]);
    setAppliedTpFilters([]);

    // Reset sorting
    setSortField(null);
    setSortDirection(null);
    setCurrentPage(1);

    // Show toast notification
    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    });
  };

  const handleExport = () => {
    // Create a filtered sites array based on the current filters
    if (sitesData?.allSites) {
      // Apply the same filtering logic as in the main query
      let filteredSites = sitesData.allSites.filter(site =>
        site.sitename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.nd_site[0]?.standard_code.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply dropdown filters
      filteredSites = filteredSites.filter(site =>
        (phaseFilters.length > 0 ? phaseFilters.includes(site.nd_phases?.name || "") : true) &&
        (regionFilters.length > 0 ? regionFilters.includes(site.nd_region?.eng || "") : true) &&
        (stateFilters.length > 0 ?
          (site.nd_site_address && site.nd_site_address.length > 0 &&
            stateFilters.includes(states.find(s => s.id === site.nd_site_address[0]?.state_id)?.name || "")) :
          true) &&
        (statusFilters.length > 0 ? statusFilters.includes(site.nd_site_status?.eng || "") : true) &&
        // Apply DUSP filter
        (appliedDuspFilters.length > 0 ? appliedDuspFilters.includes(site.dusp_tp?.parent?.id || "") : true) &&
        // Apply TP filter
        (appliedTpFilters.length > 0 ? appliedTpFilters.includes(site.dusp_tp?.id || "") : true)
      );

      // Apply the same sorting if specified
      if (sortField) {
        filteredSites.sort((a, b) => {
          let valueA, valueB;

          switch (sortField) {
            case 'sitename':
              valueA = a.sitename || '';
              valueB = b.sitename || '';
              break;
            case 'site_code':
              valueA = a.nd_site[0]?.standard_code || '';
              valueB = b.nd_site[0]?.standard_code || '';
              break;
            case 'phase':
              valueA = a.nd_phases?.name || '';
              valueB = b.nd_phases?.name || '';
              break;
            case 'region':
              valueA = a.nd_region?.eng || '';
              valueB = b.nd_region?.eng || '';
              break;
            case 'state':
              valueA = states.find(s => s.id === a.nd_site_address[0]?.state_id)?.name || '';
              valueB = b.nd_site_address[0]?.state_id ? states.find(s => s.id === b.nd_site_address[0]?.state_id)?.name || '' : '';
              break;
            case 'dusp_tp':
              valueA = a.dusp_tp_id_display || '';
              valueB = b.dusp_tp_id_display || '';
              break;
            case 'status':
              valueA = a.nd_site_status?.eng || '';
              valueB = b.nd_site_status?.eng || '';
              break;
            default:
              valueA = a[sortField as keyof Site] || '';
              valueB = b[sortField as keyof Site] || '';
          }

          if (sortDirection === 'asc') {
            return valueA > valueB ? 1 : -1;
          } else {
            return valueA < valueB ? 1 : -1;
          }
        });
      }

      // Export the filtered sites
      exportSitesToCSV(filteredSites, states, `site_report_${new Date().toISOString().split('T')[0]}`);

      toast({
        title: "Export successful",
        description: `${filteredSites.length} sites exported to CSV`,
      });
    }
  };

  const totalPages = Math.ceil((sitesData?.count || 0) / pageSize);

  // Format state name helper
  const getStateName = (site: Site) => {
    if (site?.nd_site_address && site.nd_site_address.length > 0) {
      return states.find(s => s.id === site.nd_site_address[0]?.state_id)?.name || "";
    }
    return "";
  };

  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status) {
      case "In Operation":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case "In Progress":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
      case "Temporarily Close":
        return <Badge className="bg-orange-500 hover:bg-orange-600">{status}</Badge>;
      case "Permanently Close":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      default:
        return <Badge variant="outline">{status.replace('_', ' ')}</Badge>;
    }
  };

  const hasActiveFilters = phaseFilters.length > 0 || regionFilters.length > 0 || stateFilters.length > 0 || statusFilters.length > 0 || appliedDuspFilters.length > 0 || appliedTpFilters.length > 0;

  const getActiveFilterCount = () => {
    return phaseFilters.length + regionFilters.length + stateFilters.length + statusFilters.length + appliedDuspFilters.length + appliedTpFilters.length;
  };

  // Checkbox selection handlers
  const handleSelectSite = (siteId: string) => {
    setSelectedSites(prev => {
      // If already selected, remove it
      if (prev.includes(siteId)) {
        return prev.filter(id => id !== siteId);
      }
      // Otherwise, add it
      return [...prev, siteId];
    });
  };

  const handleSelectAll = () => {
    if (!sitesData?.data) return;

    // If all sites on current page are selected, deselect them
    const currentPageSiteIds = sitesData.data.map(site => site.id);
    const allSelected = currentPageSiteIds.every(id => selectedSites.includes(id));

    if (allSelected) {
      // Remove all current page site IDs from selection
      setSelectedSites(prev => prev.filter(id => !currentPageSiteIds.includes(id)));
    } else {
      // Add any unselected site IDs from current page
      setSelectedSites(prev => {
        const newSelection = [...prev];
        currentPageSiteIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Helper to check if all sites on current page are selected
  const areAllSitesSelected = () => {
    if (!sitesData?.data || sitesData.data.length === 0) return false;
    return sitesData.data.every(site => selectedSites.includes(site.id));
  };

  // Helper to check if a specific site is selected
  const isSiteSelected = (siteId: string) => {
    return selectedSites.includes(siteId);
  };

  // Reset selectedSites when changing pages or filters
  useEffect(() => {
    setSelectedSites([]);
  }, [currentPage, phaseFilters, regionFilters, stateFilters, statusFilters, searchTerm]);

  // Access control logic - moved after all hooks
  if (parsedMetadata?.user_type !== "super_admin" && !organizationId && !isMCMCUser) {
    return <>
      <div>You do not have access to this dashboard.</div>;
    </>

  }
  console.log("sitesData", sitesData);
  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Site Management</h1>
          <p className="text-gray-500 mt-1">Manage all physical centres and locations</p>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div className="relative w-full sm:w-auto flex-1">
            <Input
              type="text"
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-10 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <div className="flex gap-2 self-end">
            {selectedSites.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5 text-sm">
                <span className="font-medium">{selectedSites.length} sites selected</span>
                <div className="flex gap-2">
                  {isSuperAdmin || isMCMCUser && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8"
                      onClick={() => {
                        setIsDeleteDialogOpen(true);
                        setSiteToDelete(null); // Indicate that we're doing batch delete
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setSelectedSites([])}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {!isRestrictedUser && (
              <Button
                className="flex items-center gap-2"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add New Site
              </Button>
            )}
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-10"
                >
                  <Users className="h-4 w-4 text-gray-500" />
                  Phase
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput placeholder="Search phases..." />
                  <CommandList>
                    <CommandEmpty>No phases found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {phases.map((phase) => (
                        <CommandItem
                          key={phase.id}
                          onSelect={() => {
                            const value = phase.name;
                            setSelectedPhaseFilters(
                              selectedPhaseFilters.includes(value)
                                ? selectedPhaseFilters.filter((item) => item !== value)
                                : [...selectedPhaseFilters, value]
                            );
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                              selectedPhaseFilters.includes(phase.name)
                                ? "bg-primary border-primary"
                                : "opacity-50"
                            )}
                          >
                            {selectedPhaseFilters.includes(phase.name) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          {phase.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-10"
                >
                  <Box className="h-4 w-4 text-gray-500" />
                  Region
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput placeholder="Search regions..." />
                  <CommandList>
                    <CommandEmpty>No regions found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {regions.map((region) => (
                        <CommandItem
                          key={region.id}
                          onSelect={() => {
                            const value = region.eng;
                            setSelectedRegionFilters(
                              selectedRegionFilters.includes(value)
                                ? selectedRegionFilters.filter((item) => item !== value)
                                : [...selectedRegionFilters, value]
                            );
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                              selectedRegionFilters.includes(region.eng)
                                ? "bg-primary border-primary"
                                : "opacity-50"
                            )}
                          >
                            {selectedRegionFilters.includes(region.eng) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          {region.eng}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-10"
                >
                  <MapPin className="h-4 w-4 text-gray-500" />
                  State
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput placeholder="Search states..." />
                  <CommandList>
                    <CommandEmpty>No states found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {states.map((state) => (
                        <CommandItem
                          key={state.id}
                          onSelect={() => {
                            const value = state.name;
                            setSelectedStateFilters(
                              selectedStateFilters.includes(value)
                                ? selectedStateFilters.filter((item) => item !== value)
                                : [...selectedStateFilters, value]
                            );
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                              selectedStateFilters.includes(state.name)
                                ? "bg-primary border-primary"
                                : "opacity-50"
                            )}
                          >
                            {selectedStateFilters.includes(state.name) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          {state.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* DUSP Filter - Only for MCMC and Super Admin */}
            {(isSuperAdmin || isMCMCUser) && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-10"
                  >
                    <Box className="h-4 w-4 text-gray-500" />
                    DUSP
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandInput placeholder="Search DUSP..." />
                    <CommandList>
                      <CommandEmpty>No DUSP found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {sitesData?.allSites && Array.from(new Set(sitesData.allSites
                          .filter(site => site.dusp_tp?.parent?.id && site.dusp_tp?.parent?.name)
                          .map(site => ({ id: site.dusp_tp.parent.id, name: site.dusp_tp.parent.name }))
                          .map(JSON.stringify)))
                          .map(JSON.parse)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((dusp) => (
                            <CommandItem
                              key={dusp.id}
                              onSelect={() => {
                                const value = dusp.id;
                                setSelectedDuspFilters(
                                  selectedDuspFilters.includes(value)
                                    ? selectedDuspFilters.filter((item) => item !== value)
                                    : [...selectedDuspFilters, value]
                                );
                              }}
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                                  selectedDuspFilters.includes(dusp.id)
                                    ? "bg-primary border-primary"
                                    : "opacity-50"
                                )}
                              >
                                {selectedDuspFilters.includes(dusp.id) && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              {dusp.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {/* TP Filter - Only for DUSP, MCMC and Super Admin */}
            {(isSuperAdmin || isMCMCUser || isDUSPUser) && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-10"
                  >
                    <Building className="h-4 w-4 text-gray-500" />
                    TP
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                  <Command>
                    <CommandInput placeholder="Search TP..." />
                    <CommandList>
                      <CommandEmpty>No TP found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {sitesData?.allSites && Array.from(new Set(sitesData.allSites
                          .filter(site => {
                            if (selectedDuspFilters.length > 0) {
                              return site.dusp_tp?.id && site.dusp_tp?.name && selectedDuspFilters.includes(site.dusp_tp?.parent?.id || "");
                            }
                            return site.dusp_tp?.id && site.dusp_tp?.name;
                          })
                          .map(site => ({ id: site.dusp_tp.id, name: site.dusp_tp.name }))
                          .map(JSON.stringify)))
                          .map(JSON.parse)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((tp) => (
                            <CommandItem
                              key={tp.id}
                              onSelect={() => {
                                const value = tp.id;
                                setSelectedTpFilters(
                                  selectedTpFilters.includes(value)
                                    ? selectedTpFilters.filter((item) => item !== value)
                                    : [...selectedTpFilters, value]
                                );
                              }}
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                                  selectedTpFilters.includes(tp.id)
                                    ? "bg-primary border-primary"
                                    : "opacity-50"
                                )}
                              >
                                {selectedTpFilters.includes(tp.id) && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              {tp.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-10"
                >
                  <Box className="h-4 w-4 text-gray-500" />
                  Status
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandInput placeholder="Search statuses..." />
                  <CommandList>
                    <CommandEmpty>No statuses found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {statuses.map((status) => (
                        <CommandItem
                          key={status.id}
                          onSelect={() => {
                            const value = status.eng;
                            setSelectedStatusFilters(
                              selectedStatusFilters.includes(value)
                                ? selectedStatusFilters.filter((item) => item !== value)
                                : [...selectedStatusFilters, value]
                            );
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                              selectedStatusFilters.includes(status.eng)
                                ? "bg-primary border-primary"
                                : "opacity-50"
                            )}
                          >
                            {selectedStatusFilters.includes(status.eng) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          {status.eng}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
              onClick={handleResetFilters}
            >
              <RotateCcw className="h-4 w-4 text-gray-500" />
              Reset
            </Button>
          </div>

          <Button
            variant="secondary"
            className="flex items-center gap-2 ml-auto"
            onClick={() => {
              setPhaseFilters(selectedPhaseFilters);
              setRegionFilters(selectedRegionFilters);
              setStateFilters(selectedStateFilters);
              setStatusFilters(selectedStatusFilters);
              setAppliedDuspFilters(selectedDuspFilters);
              setAppliedTpFilters(selectedTpFilters);
              setCurrentPage(1);

              toast({
                title: "Filters applied",
                description: `${getActiveFilterCount()} filters applied`,
              });
            }}
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </Button>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center mt-2">
            {phaseFilters.length > 0 && (
              <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
                <span>Phase: {phaseFilters.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setPhaseFilters([]);
                    setSelectedPhaseFilters([]);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {regionFilters.length > 0 && (
              <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
                <span>Region: {regionFilters.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setRegionFilters([]);
                    setSelectedRegionFilters([]);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {stateFilters.length > 0 && (
              <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
                <span>State: {stateFilters.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setStateFilters([]);
                    setSelectedStateFilters([]);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {statusFilters.length > 0 && (
              <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
                <span>Status: {statusFilters.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setStatusFilters([]);
                    setSelectedStatusFilters([]);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {appliedDuspFilters.length > 0 && (
              <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
                <span>DUSP Filter: {appliedDuspFilters.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setAppliedDuspFilters([]);
                    setSelectedDuspFilters([]);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {appliedTpFilters.length > 0 && (
              <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
                <span>TP Filter: {appliedTpFilters.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => {
                    setAppliedTpFilters([]);
                    setSelectedTpFilters([]);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Sites Table */}
        <div className="rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={areAllSitesSelected()}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[60px]">No.</TableHead>
                  <TableHead
                    className="cursor-pointer w-[120px]"
                    onClick={() => handleSort("site_code")}
                  >
                    <div className="flex items-center">
                      Site ID
                      {sortField === "site_code" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer w-[180px]"
                    onClick={() => handleSort("sitename")}
                  >
                    <div className="flex items-center">
                      Name
                      {sortField === "sitename" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer w-[120px]"
                    onClick={() => handleSort("phase")}
                  >
                    <div className="flex items-center">
                      Phase
                      {sortField === "phase" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer w-[120px]"
                    onClick={() => handleSort("region")}
                  >
                    <div className="flex items-center">
                      Region
                      {sortField === "region" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer w-[120px]"
                    onClick={() => handleSort("state")}
                  >
                    <div className="flex items-center">
                      State
                      {sortField === "state" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  {isDUSPUser && <TableHead
                    className="cursor-pointer w-[120px]"
                    onClick={() => handleSort("dusp_tp")}
                  >
                    <div className="flex items-center">
                      TP
                      {sortField === "dusp_tp" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>}
                  {(isSuperAdmin || isMCMCUser) && <TableHead
                    className="cursor-pointer w-[120px]"
                    onClick={() => handleSort("dusp_tp")}
                  >
                    <div className="flex items-center">
                      TP (DUSP)
                      {sortField === "dusp_tp" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>}
                  <TableHead
                    className="cursor-pointer w-[100px]"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "status" ? (
                        <span className="ml-2">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={`skeleton-row-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-6" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      {(isSuperAdmin || isMCMCUser) && (
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                      )}
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : sitesData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin || isMCMCUser ? 10 : 9} className="text-center py-10">
                      <p className="text-gray-500">No sites found matching your criteria</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sitesData?.data.map((site, index) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <Checkbox
                          checked={isSiteSelected(site.id)}
                          onCheckedChange={() => handleSelectSite(site.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>{site?.nd_site[0]?.standard_code || ""}</TableCell>
                      <TableCell>{site?.sitename || ""}</TableCell>
                      <TableCell>{site?.nd_phases?.name || ""}</TableCell>
                      <TableCell>{site?.nd_region?.eng || ""}</TableCell>
                      <TableCell>{getStateName(site)}</TableCell>
                      {isDUSPUser && (
                        <TableCell>
                          {site.dusp_tp?.name || "N/A"}
                        </TableCell>
                      )}
                      {(isSuperAdmin || isMCMCUser) && (
                        <TableCell>
                          {site.dusp_tp_id_display || "N/A"}
                        </TableCell>
                      )}
                      <TableCell>{getStatusBadge(site?.nd_site_status?.eng)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* Temporarily hiding the visibility toggle button 
                          {(isTPUser || isSuperAdmin) && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleStatus(site)}
                            >
                              {site.is_active ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          */}
                          {!isRestrictedUser && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(site)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {isSuperAdmin && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteClick(site.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewDetailsClick(site.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {sitesData?.data?.length > 0 && (
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sitesData?.count || 0}
            pageSize={pageSize}
            startItem={(currentPage - 1) * pageSize + 1}
            endItem={Math.min(currentPage * pageSize, sitesData?.count || 0)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div>
              {siteToDelete ?
                "Are you sure you want to delete this site?" :
                `Are you sure you want to delete ${selectedSites.length} selected sites?`
              }
              Type "DELETE" to confirm.
            </div>
            <Input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="mt-2 p-2"
              placeholder="DELETE"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteConfirmation("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (deleteConfirmation !== "DELETE") return;

                  try {
                    if (siteToDelete) {
                      // Single site deletion
                      await deleteSite(siteToDelete);

                      toast({
                        title: "Site deleted",
                        description: "The site has been successfully deleted.",
                      });
                    } else if (selectedSites.length > 0) {
                      // Batch deletion for multiple selected sites
                      // Use Promise.all to delete all selected sites in parallel
                      await Promise.all(selectedSites.map(id => deleteSite(id)));

                      toast({
                        title: "Sites deleted",
                        description: `${selectedSites.length} sites have been successfully deleted.`,
                      });

                      // Clear selection after deletion
                      setSelectedSites([]);
                    }

                    // Invalidate queries to refresh the data
                    queryClient.invalidateQueries({ queryKey: ['sites'] });
                    queryClient.invalidateQueries({ queryKey: ['site-stats'] });
                  } catch (error) {
                    console.error("Failed to delete site(s):", error);
                    toast({
                      title: "Error",
                      description: "Failed to delete the site(s). Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsDeleteDialogOpen(false);
                    setSiteToDelete(null);
                    setDeleteConfirmation("");
                  }
                }}
                disabled={deleteConfirmation !== "DELETE"}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isDialogOpen && (
          <SiteFormDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setSiteToEdit(null); // Reset siteToEdit when dialog is closed
            }}
            site={siteToEdit}
          />
        )}
      </div>
    </>
  );
};

export default SiteDashboard;
