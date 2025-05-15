import React, { useState, useEffect } from "react";
import { useSiteBilling } from "../hook/use-site-billing";
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
import { ArrowUp, ArrowDown, ArrowUpDown, FilePlus, Trash2, Edit, Eye } from "lucide-react";
import BillingFormDialog from "../BillingFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_NAME_UTILITIES } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast"; // Import the useToast hook
import BillingPageView from "./BillingPageView";
import { useDeleteBillingData } from "../hook/use-utilities-data";

interface BillingPageProps {
  siteId: string;
}

type SortDirection = "asc" | "desc" | null;
type SortField =
  | "id"
  | "type_name"
  | "year"
  | "month"
  | "reference_no"
  | "amount_bill"
  | "remark"
  | null;

const BillingPage: React.FC<BillingPageProps> = ({ siteId }) => {
  const [refreshBilling, setRefreshBilling] = useState(false); // State to trigger re-fetch
  const { data, loading, error } = useSiteBilling(siteId, refreshBilling); // Pass refreshBilling to hook
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog visibility
  const [selectedBilling, setSelectedBilling] = useState<any>(null); // State to store the selected billing data
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State to manage dialog visibility
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null); // State to store the record ID to delete
  const { toast } = useToast(); // Initialize the toast hook
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false); // State to manage view dialog visibility
  const [viewData, setViewData] = useState<any>(null); // State to store the data to view
  const { deleteBillingData, loading: deleteLoading } = useDeleteBillingData(); // Use the new hook

  const handleSort = (field: SortField) => {
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

  const sortedData = () => {
    if (!sortField || !sortDirection) return data;

    return [...data].sort((a, b) => {
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
  };

  const handleEdit = (billing: any) => {
    setSelectedBilling(billing); // Set the selected billing data
    setIsDialogOpen(true); // Open the dialog
  };

  const handleView = (billing: any) => {
    setViewData(billing); // Set the selected billing data
    setIsViewDialogOpen(true); // Open the view dialog
  };

  // Trigger re-fetch when the dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setRefreshBilling((prev) => !prev); // Toggle refreshBilling state
    }
  }, [isDialogOpen]);

  // Function to handle delete a record
  const handleDelete = async () => {
    if (!deleteRecordId) return;

    await deleteBillingData(deleteRecordId, toast); // Call the hook function
    setRefreshBilling((prev) => !prev); // Trigger re-fetch
    setIsDeleteDialogOpen(false); // Close the dialog
    setDeleteRecordId(null); // Reset the record ID
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const sorted = sortedData();

  return (
    <div >
      <h2 className="text-xl font-bold mb-4">Billing Information</h2>

      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setSelectedBilling(null); // Clear selected billing for new entry
            setIsDialogOpen(true); // Open the dialog
          }}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          Add New Billing
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">No.</TableHead>
              <TableHead
                sortable
                sorted={sortField === "id" ? sortDirection : null}
                onSort={() => handleSort("id")}
              >
                ID
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
                sorted={sortField === "reference_no" ? sortDirection : null}
                onSort={() => handleSort("reference_no")}
              >
                Reference No
              </TableHead>
              <TableHead
                sortable
                sorted={sortField === "amount_bill" ? sortDirection : null}
                onSort={() => handleSort("amount_bill")}
              >
                Amount
              </TableHead>
              <TableHead
                sortable
                sorted={sortField === "remark" ? sortDirection : null}
                onSort={() => handleSort("remark")}
              >
                Remark
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length > 0 ? (
              sorted.map((item, index) => (
                <TableRow key={item.id}>
                  <TableRowNumber index={index} />
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.type_name}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell>{item.month}</TableCell>
                  <TableCell>{item.reference_no}</TableCell>
                  <TableCell>{item.amount_bill}</TableCell>
                  <TableCell>{item.remark}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleView(item)} // Open view dialog with data
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
                            onClick={() => handleEdit(item)} // Open dialog with initial data
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
                              setDeleteRecordId(item.id); // Set the record ID to delete
                              setIsDeleteDialogOpen(true); // Open the dialog
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
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Billing Form Dialog */}
      <BillingFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        siteId={siteId} // Pass the siteId to the dialog
        initialData={selectedBilling} // Pass the selected billing data
      />

      {/* View Dialog */}
      <BillingPageView
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        data={viewData} // Pass the selected data to the view dialog
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingPage;
