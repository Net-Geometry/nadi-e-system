import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowUpDown, Download, RotateCcw, Eye, Edit, Trash2, FilePlus } from "lucide-react";
import { useSiteInsuranceDynamic } from "./hook/use-site-insurance-dynamic";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/utils/export-utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { getSiteIdsByUserGroup } from "../hook/use-site-id-list";
import InsurancePageView from "../component/InsurancePageView";
import { useToast } from "@/hooks/use-toast";
import { useDeleteInsuranceData } from "../hook/use-insurance-data";
import InsuranceFormDialog from "../InsuranceFormDialog";


const InsuranceOverview = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const userType = parsedMetadata?.user_type;
  const organizationId = parsedMetadata?.organization_id;
  const siteId = parsedMetadata?.group_profile?.site_profile_id;

  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [refreshData, setRefreshData] = useState(false); // State to trigger refresh
  const { data, loading, error } = useSiteInsuranceDynamic(siteIds, refreshData);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof typeof data[0] | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<any>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const { deleteInsuranceData, loading: deleteLoading } = useDeleteInsuranceData();
  const { toast } = useToast(); // Toast for notifications

  useEffect(() => {
    const fetchSiteIds = async () => {
      const ids = await getSiteIdsByUserGroup(userType, userGroup, organizationId, siteId);
      setSiteIds(ids);
    };

    fetchSiteIds();
  }, [userGroup, userType, organizationId, siteId]);

  const handleView = (insurance: any) => {
    setViewData(insurance);
    setIsViewDialogOpen(true);
  };



  const handleEdit = (insurance: any) => {
    setSelectedInsurance(insurance);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (!isDialogOpen) {
      setRefreshData((prev) => !prev); // Trigger refresh after closing the edit dialog
    }
  }, [isDialogOpen]);

  const handleDelete = async () => {
    if (!deleteRecordId) return;

    await deleteInsuranceData(deleteRecordId, toast); // Call the delete hook
    setRefreshData((prev) => !prev); // Trigger refresh after deletion
    setIsDeleteDialogOpen(false); // Close the dialog
    setDeleteRecordId(null); // Reset the record ID
  };

  const handleSort = (field: keyof typeof data[0]) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredData = useMemo(() => {
    return data
      ?.filter(
        (item) =>
          item.sitename.toLowerCase().includes(search.toLowerCase()) ||
          item.standard_code.toLowerCase().includes(search.toLowerCase())
      )
      .filter((item) => (filterType ? item.insurance_type_name === filterType : true));
  }, [data, search, filterType]);

  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = typeof bValue === "string" ? bValue.toLowerCase() : bValue;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    return sortedData?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);

  const handleExport = () => {
    if (!filteredData) return;

    const exportData = filteredData.map((item) => ({
      "Site Name": item.sitename,
      "Type": item.type_name,
      "Insurance Type": item.insurance_type_name,
      "Start Date": item.start_date || "N/A",
      "End Date": item.end_date || "N/A",
      "File": item.file_path || "N/A",
    }));

    exportToCSV(exportData, `insurance_overview_${new Date().toISOString().split("T")[0]}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  const uniqueTypes = [...new Set(data?.map((item) => item.insurance_type_name))].sort();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Insurance Overview</h2>

      {/* Search and Export */}
      <div className="flex items-center justify-between">
        {userGroup !== 9 ? (
          <Input
            placeholder="Search by site name or code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mr-4"
          />
        ) : (
          <div></div>
        )}
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Filter by Insurance Type
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search types..." />
              <CommandList>
                <CommandEmpty>No types found.</CommandEmpty>
                <CommandGroup>
                  {uniqueTypes.map((type) => (
                    <CommandItem
                      key={type}
                      onSelect={() =>
                        setFilterType(filterType === type ? null : type)
                      }
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          filterType === type ? "bg-primary border-primary" : "opacity-50"
                        )}
                      >
                        {filterType === type && (
                          <ArrowUp className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {type}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Reset Filters */}
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setFilterType(null);
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        {Number(userGroup) === 9 && (
          <Button
            onClick={() => {
              setSelectedInsurance(null);
              setIsDialogOpen(true);
            }}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Add New Insurance
          </Button>
        )}

      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">No.</TableHead>
              <TableHead
                sortable
                sorted={sortField === "sitename" ? sortDirection : null}
                onSort={() => handleSort("sitename")}
              >
                Site Name
              </TableHead>
              <TableHead
                sortable
                sorted={sortField === "type_name" ? sortDirection : null}
                onSort={() => handleSort("type_name")}
              >
                Incident Type
              </TableHead>
              <TableHead
                sortable
                sorted={sortField === "insurance_type_name" ? sortDirection : null}
                onSort={() => handleSort("insurance_type_name")}
              >
                Insurance Type
              </TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>{item.sitename}</TableCell>
                  <TableCell>{item.type_name}</TableCell>
                  <TableCell>{item.insurance_type_name}</TableCell>
                  <TableCell>{item.start_date || "N/A"}</TableCell>
                  <TableCell>{item.end_date || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {/* View Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>

                      {/* Edit Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>

                      {/* Delete Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setDeleteRecordId(item.id.toString());
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* InsurancePageView */}
      <InsurancePageView
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        data={viewData}
      />

      {/* InsuranceFormDialog for Edit and Create*/}
      <InsuranceFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedInsurance}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredData?.length || 0}
        />
      )}
    </div>
  );
};

export default InsuranceOverview;