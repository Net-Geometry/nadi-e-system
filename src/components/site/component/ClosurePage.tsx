import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableRowNumber } from "@/components/ui/TableRowNumber";
import {
  FilePlus,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Download,
  Filter,
  RotateCcw,
  ChevronsUpDown,
  X,
  Check,
  Box,
  MapPin,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import SiteClosureForm from "./SiteClosure";
import SiteClosureDetailDialog from "./SiteClosureDetailDialog";
import { useSiteId } from "@/hooks/use-site-id";
import { useQuery } from "@tanstack/react-query";
import {
  fetchlListClosureData,
  fetchClosureCategories,
} from "../hook/use-siteclosure";
import { useFormatDate } from "@/hooks/use-format-date";
import { useFormatDuration } from "@/hooks/use-format-duration";
import {
  useDraftClosure,
  useDeleteDraftClosure,
} from "../hook/submit-siteclosure-data";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useAuth } from "@/hooks/useAuth";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV } from "@/utils/export-utils";

// StatusCell component to handle the status display with approval info
const StatusCell = ({ item }: { item: SiteListClosureRequest }) => {
  const [approvalInfo, setApprovalInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  let variant = "default";

  // Map status ID to appropriate variant
  switch (item.nd_closure_status?.id) {
    case 1:
      variant = "draft";
      break; // Draft
    case 2:
      variant = "submitted";
      break; // Submitted
    case 3:
      variant = "approved";
      break; // Approved
    case 4:
      variant = "rejected";
      break; // Rejected
    case 5:
      variant = "recommended";
      break; // Recommended
    case 6:
      variant = "authorized";
      break; // Authorized
    case 7:
      variant = "declined";
      break; // Declined
    case 8:
      variant = "completed";
      break; // Completed
    default:
      variant = "default";
      break;
  }

  useEffect(() => {
    // Only fetch approval info for statuses that represent an action taken by someone
    if ([3, 4, 6, 7].includes(item.nd_closure_status?.id)) {
      const fetchApprovalInfo = async () => {
        setLoading(true);
        try {
          // First, get the log entry with the status change
          const { data, error } = await supabase
            .from("nd_site_closure_logs")
            .select("id, created_by, created_at, remark")
            .eq("site_closure_id", item.id)
            .eq("closure_status_id", item.nd_closure_status?.id)
            .order("created_at", { ascending: false })
            .limit(1);

          if (error) {
            console.error("Error fetching approval log:", error);
            return;
          }

          if (data && data.length > 0) {
            // Then get the approver's profile info
            const approverInfo = data[0];
            if (approverInfo.created_by) {
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, user_type")
                .eq("id", approverInfo.created_by)
                .single();

              if (profileError) {
                console.error("Error fetching profile:", profileError);
              } else if (profileData) {
                setApprovalInfo({
                  ...approverInfo,
                  profile: profileData,
                });
              }
            }
          }
        } catch (err) {
          console.error("Error in fetchApprovalInfo:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchApprovalInfo();
    }
  }, [item.id, item.nd_closure_status?.id]);

  return (
    <div className="space-y-1">
      <Badge variant={variant as any}>
        {item.nd_closure_status?.name || "N/A"}
      </Badge>

      {/* Show approver info if available */}
      {loading && (
        <div className="text-xs text-muted-foreground">Loading...</div>
      )}

      {!loading && approvalInfo?.profile && (
        <div className="text-xs text-muted-foreground mt-1">
          By: {approvalInfo.profile.full_name || "Unknown"}
          {approvalInfo.profile.user_type &&
            ` (${approvalInfo.profile.user_type})`}
        </div>
      )}
    </div>
  );
};

interface ClosurePageProps {
  siteId: string;
}

interface ColumnConfig {
  id: string;
  header: string;
  cell: (item: any, index?: number) => React.ReactNode;
  sortable?: boolean;
}

// Interface for approval actions
interface ApprovalAction {
  closureId: number;
  statusId: number;
  remark: string;
}

// Interface for the site closure data structure
interface SiteListClosureRequest {
  id: number;
  nd_site_profile?: {
    id: any;
    sitename: string;
    nd_site?: { standard_code: string }[];
    organizations?: {
      id?: string;
      name: string;
      type: string;
      parent_id?: {
        id?: string;
        name?: string;
      };
    };
    region_id?: {
      eng: string;
    };
    state_id?: {
      name: string;
    };
  };
  profiles?: {
    full_name: string;
    user_type?: string;
  };
  request_datetime?: string;
  created_at?: string;
  created_by: string;
  close_start: string;
  close_end: string;
  duration: number;
  nd_closure_categories?: {
    id: number;
    eng: string;
  };
  nd_closure_status?: {
    id: number;
    name: string;
  };
}

const ClosurePage: React.FC<ClosurePageProps> = ({ siteId }) => {
  const [isSiteClosureOpen, setSiteClosureOpen] = useState(false);
  const [selectedClosureId, setSelectedClosureId] = useState<number | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editDraftData, setEditDraftData] = useState<any>(null);
  const [deleteDraftId, setDeleteDraftId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New state for pending request deletion
  const [deletePendingId, setDeletePendingId] = useState<number | null>(null);
  const [showDeletePendingConfirm, setShowDeletePendingConfirm] =
    useState(false);

  // State for approval functionality
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedForAction, setSelectedForAction] = useState<number | null>(
    null
  );
  const [actionRemark, setActionRemark] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Sorting and filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null
  );

  // Selected filters (pending application)
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<
    string[]
  >([]);
  const [selectedRegionFilters, setSelectedRegionFilters] = useState<string[]>(
    []
  );
  const [selectedStateFilters, setSelectedStateFilters] = useState<string[]>(
    []
  );
  const [selectedStatusFilters, setSelectedStatusFilters] = useState<string[]>(
    []
  );
  const [selectedDuspFilters, setSelectedDuspFilters] = useState<string[]>([]);
  const [selectedTpFilters, setSelectedTpFilters] = useState<string[]>([]);

  // Applied filters (used in actual filtering)
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [regionFilters, setRegionFilters] = useState<string[]>([]);
  const [stateFilters, setStateFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [duspFilters, setDuspFilters] = useState<string[]>([]);
  const [tpFilters, setTpFilters] = useState<string[]>([]);

  const { formatDuration } = useFormatDuration();
  const { formatDate } = useFormatDate();
  const { fetchDraftData, loading: loadingDraft } = useDraftClosure();
  const { deleteDraft, loading: deletingDraft } = useDeleteDraftClosure();
  const { toast } = useToast();
  const { user } = useAuth();

  // const staffSiteId = useSiteId();

  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const isTPUser =
    parsedMetadata?.user_group_name === "TP" &&
    !!parsedMetadata?.organization_id;
  const isDUSPUser =
    parsedMetadata?.user_group_name === "DUSP" &&
    !!parsedMetadata?.organization_id;
  const isMCMCUser = parsedMetadata?.user_group_name === "MCMC"; // MCMC users don't require organization_id
  // const isStaffUser =
  //   parsedMetadata?.user_group_name === "Centre Staff" ||
  //   parsedMetadata?.user_type === "staff_manager" ||
  //   parsedMetadata?.user_type === "staff_assistant_manager";
  const isStaffUser =
    parsedMetadata?.user_group_name === "Site" ||
    parsedMetadata?.user_type === "staff_manager" ||
    parsedMetadata?.user_type === "staff_assistant_manager";

  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    (isTPUser || isDUSPUser) &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;
  const staffSiteId = parsedMetadata?.group_profile?.site_profile_id || null;
  const effectiveSiteId = siteId || (isStaffUser ? staffSiteId : null);

  if (!effectiveSiteId && isStaffUser) {
    console.log("Staff user has no assigned site");
  }

  const {
    data: closurelistdata,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["siteClosureList", organizationId, effectiveSiteId, isMCMCUser],
    queryFn: () =>
      fetchlListClosureData(
        organizationId,
        isDUSPUser,
        effectiveSiteId,
        isMCMCUser
      ),
    enabled:
      isSuperAdmin || !!organizationId || !!effectiveSiteId || isMCMCUser,
  });

  const { data: categories } = useQuery({
    queryKey: ["closure-categories"],
    queryFn: fetchClosureCategories,
  });

  // Get unique regions, states, and statuses from the data
  const uniqueRegions = useMemo(() => {
    if (!closurelistdata) return [];

    const regions = new Set<string>();
    closurelistdata.forEach((item) => {
      const region = item.nd_site_profile?.region_id?.eng;
      if (region) regions.add(region);
    });

    return Array.from(regions).sort();
  }, [closurelistdata]);

  const uniqueStates = useMemo(() => {
    if (!closurelistdata) return [];

    const states = new Set<string>();
    closurelistdata.forEach((item) => {
      const state = item.nd_site_profile?.state_id?.name;
      if (state) states.add(state);
    });

    return Array.from(states).sort();
  }, [closurelistdata]);

  const uniqueStatuses = useMemo(() => {
    if (!closurelistdata) return [];

    const statuses = new Set<string>();
    closurelistdata.forEach((item) => {
      const status = item.nd_closure_status?.name;
      if (status) statuses.add(status);
    });

    return Array.from(statuses).sort();
  }, [closurelistdata]);

  // Get unique DUSP organizations
  const uniqueDUSP = useMemo(() => {
    if (!closurelistdata) return [];

    const duspMap = new Map();
    closurelistdata.forEach((item) => {
      const duspId = item.nd_site_profile?.organizations?.parent_id?.id;
      const duspName = item.nd_site_profile?.organizations?.parent_id?.name;

      if (duspId && duspName && !duspMap.has(duspId)) {
        duspMap.set(duspId, {
          id: duspId,
          name: duspName,
        });
      }
    });

    return Array.from(duspMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [closurelistdata]);

  // Get unique TP organizations
  const uniqueTP = useMemo(() => {
    if (!closurelistdata) return [];

    const tpMap = new Map();
    closurelistdata.forEach((item) => {
      const tpId = item.nd_site_profile?.organizations?.id;
      const tpName = item.nd_site_profile?.organizations?.name;

      if (tpId && tpName && !tpMap.has(tpId)) {
        tpMap.set(tpId, {
          id: tpId,
          name: tpName,
        });
      }
    });

    return Array.from(tpMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [closurelistdata]);

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
    // Reset search term
    setSearchTerm("");

    // Reset selected filters (pending)
    setSelectedCategoryFilters([]);
    setSelectedRegionFilters([]);
    setSelectedStateFilters([]);
    setSelectedStatusFilters([]);
    setSelectedDuspFilters([]);
    setSelectedTpFilters([]);

    // Reset applied filters (active)
    setCategoryFilters([]);
    setRegionFilters([]);
    setStateFilters([]);
    setStatusFilters([]);
    setDuspFilters([]);
    setTpFilters([]);

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

  // Apply filters
  const handleApplyFilters = () => {
    setCategoryFilters(selectedCategoryFilters);
    setRegionFilters(selectedRegionFilters);
    setStateFilters(selectedStateFilters);
    setStatusFilters(selectedStatusFilters);
    setDuspFilters(selectedDuspFilters);
    setTpFilters(selectedTpFilters);
    setCurrentPage(1);

    toast({
      title: "Filters applied",
      description: `${getActiveFilterCount()} filters applied`,
    });
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

  // Export to CSV
  const handleExport = () => {
    if (!filteredAndSortedData) return;

    const data = filteredAndSortedData.map((item) => ({
      "Site Name": item.nd_site_profile?.sitename || "N/A",
      "Site ID": item.nd_site_profile?.nd_site?.[0]?.standard_code || "N/A",
      State: item.nd_site_profile?.state_id?.name || "N/A",
      Region: item.nd_site_profile?.region_id?.eng || "N/A",
      Organization: item.nd_site_profile?.organizations?.name || "N/A",
      DUSP: item.nd_site_profile?.organizations?.parent_id?.name || "N/A",
      Requestor: item.profiles?.full_name || "N/A",
      "Request Date": formatDate(item.request_datetime || item.created_at),
      "From Date": formatDate(item.close_start),
      "To Date": formatDate(item.close_end),
      Duration: formatDuration(item.duration),
      Category: item.nd_closure_categories?.eng || "N/A",
      Status: item.nd_closure_status?.name || "N/A",
    }));

    exportToCSV(
      data,
      `site_closure_report_${new Date().toISOString().split("T")[0]}`
    );

    toast({
      title: "Export successful",
      description: `${data.length} records exported to CSV`,
    });
  };

  // Check if user can approve a closure based on role and closure data
  const canApprove = (item: any) => {
    // NADI Staff can't approve
    if (isStaffUser) return false;

    // SuperAdmin can approve anything
    if (isSuperAdmin) {
      if (item.nd_closure_status?.id !== 2) return false;
      return true;
    }

    // Relocation category (id: 1) always needs DUSP approval
    const isRelocationCategory = item.nd_closure_categories?.id === 1;

    // Check if TP user
    if (isTPUser) {
      // TP can NEVER approve relocation requests (category id: 1)
      if (isRelocationCategory) return false;

      // Only allow TP approval for status id 2 (Submitted)
      if (item.nd_closure_status?.id !== 2) return false;

      // TP can only approve non-relocations that are <= 2 days
      return item.duration <= 2;
    }

    // Check if DUSP user
    if (isDUSPUser) {
      // Only allow DUSP approval for status id 2 (Submitted)
      if (item.nd_closure_status?.id !== 2) return false;

      // DUSP handles:
      // 1. Relocations (regardless of duration)
      // 2. Requests > 2 days
      return isRelocationCategory || item.duration > 2;
    }

    // No user type matched
    return false;
  };

  // Handle approval action
  const handleApprove = async () => {
    if (!selectedForAction) return;

    setIsProcessingAction(true);
    try {
      // Get the closure item
      const closureItem = closurelistdata?.find(
        (item) => item.id === selectedForAction
      );
      if (!closureItem) throw new Error("Closure item not found");

      // SAFETY CHECK: Prevent TP users from approving relocation category requests
      const isRelocationCategory = closureItem.nd_closure_categories?.id === 1;
      if (isTPUser && isRelocationCategory) {
        throw new Error("TP users cannot approve relocation requests.");
      }

      let newStatusId = 0;

      // Determine appropriate status based on user role
      if (isTPUser) {
        // Check if closure needs DUSP authorization due to duration > 2 days
        // if (closureItem.duration > 2) {
        //   // Set to "Recommended" status
        //   newStatusId = 5;
        // } else {
        // Set to "Approved" status - only for short non-relocations
        newStatusId = 3;
        console.log(
          "TP accepted closure request, setting status to Approved (3)"
        );
        // }
      } else if (isDUSPUser) {
        // DUSP approval sets to "Authorized" status
        newStatusId = 6;
      } else if (isSuperAdmin) {
        // SuperAdmin can directly approve
        newStatusId = 3;
      }

      if (newStatusId === 0)
        throw new Error("Could not determine appropriate status");

      // Update the closure status - using 'status' instead of 'status_id'
      const { error: updateError } = await supabase
        .from("nd_site_closure")
        .update({
          status: newStatusId, // Changed from status_id to status
        })
        .eq("id", selectedForAction);

      if (updateError) throw updateError;

      // Add to closure logs - keep closure_status_id here as it's for the logs table
      const { error: logError } = await supabase
        .from("nd_site_closure_logs")
        .insert({
          site_closure_id: selectedForAction,
          remark: actionRemark,
          closure_status_id: newStatusId,
        });

      if (logError) throw logError;

      // If the status is "Approved" (3) or "Authorized" (6), update the site profile status
      if (newStatusId === 3 || newStatusId === 6) {
        // Get the site profile ID from the closure item
        const siteProfileId = closureItem.nd_site_profile?.id;
        if (siteProfileId) {
          // Update the site profile with both status values
          const { error: siteProfileUpdateError } = await supabase
            .from("nd_site_profile")
            .update({
              active_status: 3, // Set active_status to 3 for temporarily closed
            })
            .eq("id", siteProfileId);

          if (siteProfileUpdateError) {
            console.error(
              "Error updating site profile status:",
              siteProfileUpdateError
            );
            // Don't throw error here to prevent blocking the approval process
            // Instead, we'll just log it and continue
          } else {
            console.log(
              `Site profile ${siteProfileId} status changed to temporarily close with active_status = 3`
            );
          }
        }
      }

      // Create appropriate success message based on the status
      let successMessage = "Closure request approved successfully";
      if (isTPUser && newStatusId === 3) {
        successMessage = "Closure request recommended for DUSP approval";
      } else if (newStatusId === 3 || newStatusId === 6) {
        successMessage =
          "Closure request approved and site status set to temporarily closed";
      }

      toast({
        title: "Success",
        description: successMessage,
      });

      refetch();
    } catch (err) {
      console.error("Error approving closure:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to approve closure request",
        variant: "destructive",
      });
    } finally {
      setApprovalDialogOpen(false);
      setSelectedForAction(null);
      setActionRemark("");
      setIsProcessingAction(false);
    }
  };

  // Handle rejection action
  const handleReject = async () => {
    if (!selectedForAction) return;

    setIsProcessingAction(true);
    try {
      // Get the closure item
      const closureItem = closurelistdata?.find(
        (item) => item.id === selectedForAction
      );
      if (!closureItem) throw new Error("Closure item not found");

      let newStatusId = 0;

      // Determine appropriate rejection status based on user role
      if (isTPUser) {
        // TP rejection
        newStatusId = 4; // "Rejected" status
      } else if (isDUSPUser) {
        // DUSP rejection
        newStatusId = 7; // "Declined" status
      } else if (isSuperAdmin) {
        // SuperAdmin rejection
        newStatusId = 4; // "Rejected" status
      }

      if (newStatusId === 0)
        throw new Error("Could not determine appropriate status");

      // Update the closure status - using 'status' instead of 'status_id'
      const { error: updateError } = await supabase
        .from("nd_site_closure")
        .update({
          status: newStatusId, // Changed from status_id to status
        })
        .eq("id", selectedForAction);

      if (updateError) throw updateError;

      // Add to closure logs
      const { error: logError } = await supabase
        .from("nd_site_closure_logs")
        .insert({
          site_closure_id: selectedForAction,
          remark: actionRemark,
          closure_status_id: newStatusId,
        });

      if (logError) throw logError;

      toast({
        title: "Success",
        description: "Closure request rejected successfully",
      });

      refetch();
    } catch (err) {
      console.error("Error rejecting closure:", err);
      toast({
        title: "Error",
        description: "Failed to reject closure request",
        variant: "destructive",
      });
    } finally {
      setRejectionDialogOpen(false);
      setSelectedForAction(null);
      setActionRemark("");
      setIsProcessingAction(false);
    }
  };

  const handleDeletePendingClick = (requestId: number) => {
    setDeletePendingId(requestId);
    setShowDeletePendingConfirm(true);
  };

  const handleDeletePendingConfirm = async () => {
    if (!deletePendingId) return;

    try {
      // Delete the pending request
      const { error } = await supabase
        .from("nd_site_closure")
        .delete()
        .eq("id", deletePendingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Closure request deleted successfully",
      });

      refetch();
    } catch (err) {
      console.error("Error deleting request:", err);
      toast({
        title: "Error",
        description: "Failed to delete closure request",
        variant: "destructive",
      });
    } finally {
      setShowDeletePendingConfirm(false);
      setDeletePendingId(null);
    }
  };

  // Apply filtering and sorting to the data
  const filteredAndSortedData = useMemo(() => {
    if (!closurelistdata || !user) return [];

    // Filter for drafts (only show user's own drafts unless super admin)
    let filtered = closurelistdata.filter((item) => {
      if (item.nd_closure_status?.name !== "Draft") {
        return true;
      }

      if (isSuperAdmin) {
        return true;
      }

      return item.created_by === user.id;
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
        let valueA, valueB;

        // Handle different fields
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
          case "requestor":
            valueA = a.profiles?.full_name || "";
            valueB = b.profiles?.full_name || "";
            break;
          case "category":
            valueA = a.nd_closure_categories?.eng || "";
            valueB = b.nd_closure_categories?.eng || "";
            break;
          case "closurePeriod":
            valueA = a.close_start || "";
            valueB = b.close_start || "";
            break;
          case "duration":
            valueA = a.duration || 0;
            valueB = b.duration || 0;
            break;
          case "status":
            valueA = a.nd_closure_status?.name || "";
            valueB = b.nd_closure_status?.name || "";
            break;
          default:
            valueA = a[sortField as keyof typeof a] || "";
            valueB = b[sortField as keyof typeof b] || "";
        }

        // Compare based on direction
        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
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

  // Apply pagination
  const paginatedData = useMemo(() => {
    return filteredAndSortedData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  const columns = useMemo<ColumnConfig[]>(
    () => [
      {
        id: "number",
        header: "No.",
        cell: (_, index) => <TableRowNumber index={index} />,
        sortable: false,
      },
      {
        id: "siteInfo",
        header: "Site Name",
        cell: (item) => (
          <>
            {item.nd_site_profile?.sitename || "N/A"}
            <div className="text-xs text-muted-foreground">
              {item.nd_site_profile?.nd_site?.[0]?.standard_code || "N/A"}
            </div>
          </>
        ),
        sortable: true,
      },
      {
        id: "state",
        header: "State",
        cell: (item) => item.nd_site_profile?.state_id?.name || "N/A",
        sortable: true,
      },
      {
        id: "region",
        header: "Region",
        cell: (item) => item.nd_site_profile?.region_id?.eng || "N/A",
        sortable: true,
      },
      // Only show the organization column for superadmin and MCMC users
      ...(isSuperAdmin || isMCMCUser
        ? [
            {
              id: "organization",
              header: "TP (DUSP)",
              cell: (item) => (
                <>
                  {item.nd_site_profile?.organizations?.name || "N/A"}
                  {item.nd_site_profile?.organizations?.parent_id?.name && (
                    <div className="text-xs text-muted-foreground">
                      DUSP:{" "}
                      {item.nd_site_profile?.organizations?.parent_id?.name}
                    </div>
                  )}
                </>
              ),
              sortable: true,
            },
          ]
        : []),
      // Only show the TP column for DUSP users
      ...(isDUSPUser
        ? [
            {
              id: "tp",
              header: "TP",
              cell: (item) =>
                item.nd_site_profile?.organizations?.name || "N/A",
              sortable: true,
            },
          ]
        : []),
      {
        id: "requestor",
        header: "Requestor",
        cell: (item) => (
          <div className="flex flex-col">
            <div className="font-medium">
              {item.profiles?.full_name || "N/A"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {/* Show request_datetime for submitted requests, created_at for drafts */}
              {formatDate(item.request_datetime || item.created_at)}
              {item.profiles?.user_type && (
                <span className="ml-1">({item.profiles.user_type})</span>
              )}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "closurePeriod",
        header: "Closure Period",
        cell: (item) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">From:</span>
              <span>{formatDate(item.close_start)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">To:</span>
              <span>{formatDate(item.close_end)}</span>
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        id: "duration",
        header: "Duration",
        cell: (item) => formatDuration(item.duration),
        sortable: true,
      },
      {
        id: "category",
        header: "Category",
        cell: (item) => item.nd_closure_categories?.eng || "N/A",
        sortable: true,
      },
      {
        id: "status",
        header: "Status",
        cell: (item) => <StatusCell item={item} />,
        sortable: true,
      },
      {
        id: "action",
        header: "Action",
        cell: (item) => {
          const isDraft = item.nd_closure_status?.name === "Draft";
          const isSubmitted = item.nd_closure_status?.id === 2; // Submitted
          const isPending = isSubmitted && item.created_by === user?.id; // Check if pending and owner
          const needsApproval = canApprove(item); // Check if this user can approve this request

          return (
            <div className="flex space-x-2">
              {/* View button with approval indicator */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleViewClosure(item.id)}
                title={needsApproval ? "View and approve" : "View"}
                className={needsApproval ? "relative" : ""}
              >
                {needsApproval && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
                <Eye className="h-4 w-4" />
              </Button>

              {/* Edit button - only for drafts */}
              {isDraft && item.created_by === user?.id && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditDraft(item.id)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}

              {/* Delete button */}
              {(isDraft || isPending) && item.created_by === user?.id && (
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                  onClick={() =>
                    isDraft
                      ? handleDeleteDraftClick(item.id)
                      : handleDeletePendingClick(item.id)
                  }
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
        sortable: false,
      },
    ],
    [user, formatDate, formatDuration, isSuperAdmin, isMCMCUser, isDUSPUser]
  );

  const handleDialogOpenChange = (open: boolean) => {
    setSiteClosureOpen(open);
    if (!open) {
      setEditDraftData(null);
      refetch();
    }
  };

  const handleViewClosure = (closureId: number) => {
    setSelectedClosureId(closureId);
    setIsDetailDialogOpen(true);
  };

  const handleEditDraft = async (closureId: number) => {
    try {
      const formData = await fetchDraftData(closureId);
      setEditDraftData(formData);
      setSiteClosureOpen(true);
    } catch (err) {
      console.error("Failed to prepare draft for editing:", err);
    }
  };

  const handleNewRequest = () => {
    setEditDraftData(null);
    setSiteClosureOpen(true);
  };

  const handleDeleteDraftClick = (draftId: number) => {
    setDeleteDraftId(draftId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteDraftConfirm = async () => {
    if (!deleteDraftId) return;

    try {
      const result = await deleteDraft(deleteDraftId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Draft request deleted successfully",
        });
        refetch();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error deleting draft:", err);
      toast({
        title: "Error",
        description: "Failed to delete draft request",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeleteDraftId(null);
    }
  };

  if (!isSuperAdmin && !organizationId && !effectiveSiteId && !isMCMCUser) {
    return <div>You do not have access to view this list.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Site Closure Requests</h2>
        <p className="text-gray-500 mt-1">
          Manage temporary and permanent site closures
        </p>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full sm:w-auto flex-1">
          <Input
            type="text"
            placeholder="Search closures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 h-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <div className="flex gap-2 self-end">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-white"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          {!isDUSPUser && !isMCMCUser && (
            <Button
              className="flex items-center gap-2"
              onClick={handleNewRequest}
            >
              <FilePlus className="h-4 w-4" />
              New Closure Request
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Box className="h-4 w-4 text-gray-500" />
                Category
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {categories?.map((category) => (
                      <CommandItem
                        key={category.id}
                        onSelect={() => {
                          const value = category.eng;
                          setSelectedCategoryFilters(
                            selectedCategoryFilters.includes(value)
                              ? selectedCategoryFilters.filter(
                                  (item) => item !== value
                                )
                              : [...selectedCategoryFilters, value]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            selectedCategoryFilters.includes(category.eng)
                              ? "bg-primary border-primary"
                              : "opacity-50"
                          )}
                        >
                          {selectedCategoryFilters.includes(category.eng) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {category.eng}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Region Filter */}
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
                    {uniqueRegions.map((region) => (
                      <CommandItem
                        key={region}
                        onSelect={() => {
                          const value = region;
                          setSelectedRegionFilters(
                            selectedRegionFilters.includes(value)
                              ? selectedRegionFilters.filter(
                                  (item) => item !== value
                                )
                              : [...selectedRegionFilters, value]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            selectedRegionFilters.includes(region)
                              ? "bg-primary border-primary"
                              : "opacity-50"
                          )}
                        >
                          {selectedRegionFilters.includes(region) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {region}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* State Filter */}
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
                    {uniqueStates.map((state) => (
                      <CommandItem
                        key={state}
                        onSelect={() => {
                          const value = state;
                          setSelectedStateFilters(
                            selectedStateFilters.includes(value)
                              ? selectedStateFilters.filter(
                                  (item) => item !== value
                                )
                              : [...selectedStateFilters, value]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            selectedStateFilters.includes(state)
                              ? "bg-primary border-primary"
                              : "opacity-50"
                          )}
                        >
                          {selectedStateFilters.includes(state) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {state}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Clock className="h-4 w-4 text-gray-500" />
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
                    {uniqueStatuses.map((status) => (
                      <CommandItem
                        key={status}
                        onSelect={() => {
                          const value = status;
                          setSelectedStatusFilters(
                            selectedStatusFilters.includes(value)
                              ? selectedStatusFilters.filter(
                                  (item) => item !== value
                                )
                              : [...selectedStatusFilters, value]
                          );
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                            selectedStatusFilters.includes(status)
                              ? "bg-primary border-primary"
                              : "opacity-50"
                          )}
                        >
                          {selectedStatusFilters.includes(status) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {status}
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
                      {uniqueDUSP.map((dusp) => (
                        <CommandItem
                          key={dusp.id}
                          onSelect={() => {
                            const value = dusp.id;
                            setSelectedDuspFilters(
                              selectedDuspFilters.includes(value)
                                ? selectedDuspFilters.filter(
                                    (item) => item !== value
                                  )
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
                  <Box className="h-4 w-4 text-gray-500" />
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
                      {uniqueTP.map((tp) => (
                        <CommandItem
                          key={tp.id}
                          onSelect={() => {
                            const value = tp.id;
                            setSelectedTpFilters(
                              selectedTpFilters.includes(value)
                                ? selectedTpFilters.filter(
                                    (item) => item !== value
                                  )
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
          onClick={handleApplyFilters}
        >
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center mt-2">
          {categoryFilters.length > 0 && (
            <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
              <span>Category: {categoryFilters.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setCategoryFilters([]);
                  setSelectedCategoryFilters([]);
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
          {duspFilters.length > 0 && (
            <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
              <span>DUSP: {duspFilters.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setDuspFilters([]);
                  setSelectedDuspFilters([]);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {tpFilters.length > 0 && (
            <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
              <span>TP: {tpFilters.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setTpFilters([]);
                  setSelectedTpFilters([]);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading data...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            Error loading data: {(error as Error).message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        column.id === "number" ? "w-[60px] text-center" : "",
                        column.sortable ? "cursor-pointer" : ""
                      )}
                      onClick={() => column.sortable && handleSort(column.id)}
                    >
                      <div className="flex items-center">
                        {column.header}
                        {column.sortable && (
                          <div className="ml-2">
                            {sortField === column.id ? (
                              sortDirection === "asc" ? (
                                <span className="inline-block">↑</span>
                              ) : (
                                <span className="inline-block">↓</span>
                              )
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id}>
                      {columns.map((column) => (
                        <TableCell key={`${item.id}-${column.id}`}>
                          {column.cell(
                            item,
                            (currentPage - 1) * pageSize + index
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-4"
                    >
                      No closure requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && filteredAndSortedData.length > 0 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredAndSortedData.length}
          pageSize={pageSize}
          startItem={(currentPage - 1) * pageSize + 1}
          endItem={Math.min(
            currentPage * pageSize,
            filteredAndSortedData.length
          )}
        />
      )}

      <SiteClosureForm
        open={isSiteClosureOpen}
        onOpenChange={handleDialogOpenChange}
        siteId={effectiveSiteId || ""}
        onSuccess={() => refetch()}
        editData={editDraftData}
        clearEditData={() => setEditDraftData(null)}
      />

      <SiteClosureDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        closureId={selectedClosureId}
        onApprove={() => {
          setSelectedForAction(selectedClosureId);
          setApprovalDialogOpen(true);
        }}
        onReject={() => {
          setSelectedForAction(selectedClosureId);
          setRejectionDialogOpen(true);
        }}
      />

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Draft"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to delete this draft closure request?</p>
            <p className="text-red-500">This action cannot be undone.</p>
          </div>
        }
        cancelText="Cancel"
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteDraftConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteDraftId(null);
        }}
      />

      <ConfirmationDialog
        open={showDeletePendingConfirm}
        onOpenChange={setShowDeletePendingConfirm}
        title="Delete Pending Request"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to delete this pending closure request?</p>
            <p className="text-red-500">This action cannot be undone.</p>
          </div>
        }
        cancelText="Cancel"
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeletePendingConfirm}
        onCancel={() => {
          setShowDeletePendingConfirm(false);
          setDeletePendingId(null);
        }}
      />

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Closure Request</DialogTitle>
            <DialogDescription>
              Please provide a remark for the approval.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-remark">Approval Remark</Label>
              <Textarea
                id="approval-remark"
                placeholder="Enter your approval remarks here..."
                value={actionRemark}
                onChange={(e) => setActionRemark(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApprovalDialogOpen(false);
                setSelectedForAction(null);
                setActionRemark("");
              }}
              disabled={isProcessingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessingAction}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Closure Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-remark">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-remark"
                placeholder="Enter your rejection reason here..."
                value={actionRemark}
                onChange={(e) => setActionRemark(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectionDialogOpen(false);
                setSelectedForAction(null);
                setActionRemark("");
              }}
              disabled={isProcessingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessingAction || !actionRemark.trim()}
              variant="destructive"
            >
              {isProcessingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClosurePage;
