import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowUpDown, Download, RotateCcw, Eye } from "lucide-react";
import { getSiteIdsByUserGroup } from "../hook/use-site-id-list";
import { useSiteBillingDynamic } from "./hook/use-site-billing-dynamic";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { exportToCSV } from "@/utils/export-utils";
import BillingPageView from "../component/BillingPageView";
import { useDeleteBillingData } from "../hook/use-utilities-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2, FilePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import BillingFormDialog from "../BillingFormDialog";


const BillingOverview = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const userType = parsedMetadata?.user_type;
  const organizationId = parsedMetadata?.organization_id;
  const siteId = parsedMetadata?.group_profile?.site_profile_id;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const { toast } = useToast();
  const { deleteBillingData } = useDeleteBillingData();

  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [refreshData, setRefreshData] = useState(false); // State to trigger refresh
  const { data, loading, error } = useSiteBillingDynamic(siteIds, refreshData);

  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof typeof data[0] | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  useEffect(() => {
    const fetchSiteIds = async () => {
      const ids = await getSiteIdsByUserGroup(userType, userGroup, organizationId, siteId);
      setSiteIds(ids);
    };

    fetchSiteIds();
  }, [userGroup, userType, organizationId, siteId]);

  const handleView = (billing: any) => {
    setViewData(billing);
    setIsViewDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedBilling(null);
    setIsDialogOpen(true);
  };
  const handleEdit = (billing: any) => {
    setSelectedBilling(billing);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (!isDialogOpen) {
      setRefreshData((prev) => !prev); // Trigger refresh after closing the edit dialog
    }
  }, [isDialogOpen]);

  const handleDelete = async () => {
    if (!deleteRecordId) return;
    await deleteBillingData(deleteRecordId, toast);
    setRefreshData((prev) => !prev); // Refresh data after delete
    setIsDeleteDialogOpen(false);
    setDeleteRecordId(null);
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
      .filter((item) => (filterYear ? item.year === Number(filterYear) : true))
      .filter((item) => (filterMonth ? item.month === Number(filterMonth) : true))
      .filter((item) => (filterType ? item.type_name === filterType : true));
  }, [data, search, filterYear, filterMonth, filterType]);

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
      "Year": item.year,
      "Month": item.month,
      "Amount": item.amount_bill,
      "File": item.file_path || "N/A",
    }));

    exportToCSV(exportData, `billing_overview_${new Date().toISOString().split("T")[0]}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  const uniqueYears = [...new Set(data?.map((item) => item.year))].sort();
  const uniqueTypes = [...new Set(data?.map((item) => item.type_name))].sort();
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Utilities Billing</h2>

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {Number(userGroup) === 9 && (
            <Button onClick={handleCreate}>
              <FilePlus className="mr-2 h-4 w-4" />
              Add New Billing
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Year Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Filter by Year
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search years..." />
              <CommandList>
                <CommandEmpty>No years found.</CommandEmpty>
                <CommandGroup>
                  {uniqueYears.map((year) => (
                    <CommandItem
                      key={year}
                      onSelect={() =>
                        setFilterYear(filterYear === String(year) ? null : String(year))
                      }
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          filterYear === String(year) ? "bg-primary border-primary" : "opacity-50"
                        )}
                      >
                        {filterYear === String(year) && (
                          <ArrowUp className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {year}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Month Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Filter by Month
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Search months..." />
              <CommandList>
                <CommandEmpty>No months found.</CommandEmpty>
                <CommandGroup>
                  {months.map((month) => (
                    <CommandItem
                      key={month.value}
                      onSelect={() =>
                        setFilterMonth(filterMonth === String(month.value) ? null : String(month.value))
                      }
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          filterMonth === String(month.value) ? "bg-primary border-primary" : "opacity-50"
                        )}
                      >
                        {filterMonth === String(month.value) && (
                          <ArrowUp className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {month.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              Filter by Type
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
            setFilterYear(null);
            setFilterMonth(null);
            setFilterType(null);
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
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
                Type
              </TableHead>
              <TableHead
                sortable
                sorted={sortField === "year" ? sortDirection : null}
                onSort={() => handleSort("year")}
              >
                Year
              </TableHead>
              <TableHead
                sortable
                sorted={sortField === "month" ? sortDirection : null}
                onSort={() => handleSort("month")}
              >
                Month
              </TableHead>
              <TableHead
                sortable
                sorted={sortField === "amount_bill" ? sortDirection : null}
                onSort={() => handleSort("amount_bill")}
              >
                Amount
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData?.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell>{item.sitename}</TableCell>
                <TableCell>{item.type_name}</TableCell>
                <TableCell>{item.year}</TableCell>
                <TableCell>{item.month}</TableCell>
                <TableCell>{item.amount_bill}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setDeleteRecordId(item.id);
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <BillingPageView
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        data={viewData}
      />

      {/* Billing Form Dialog */}
      <BillingFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedBilling}
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
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

export default BillingOverview;