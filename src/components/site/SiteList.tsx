import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Eye, EyeOff, Trash2, Search } from "lucide-react"; // Import Search icon
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MaintenanceFormDialog } from "./MaintenanceFormDialog";
import { fetchSites, Site, toggleSiteActiveStatus, deleteSite, fetchPhase, fetchRegion, fetchSiteStatus } from "./component/site-utils"; // Import fetchPhase, fetchRegion, and fetchStatus
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SiteFormDialog } from "./SiteFormDialog"; // Import SiteFormDialog
import { Input } from "@/components/ui/input"; // Import Input component
import { PaginationComponent } from "../ui/PaginationComponent"; // Correct import path
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "../ui/skeleton";
import { useUserMetadata } from "@/hooks/use-user-metadata"; // Import useUserMetadata

export const SiteList = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const isTPUser = parsedMetadata?.user_group_name === "TP" && !!parsedMetadata?.organization_id;
  const isDUSPUser = parsedMetadata?.user_group_name === "DUSP" && !!parsedMetadata?.organization_id;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    (isTPUser || isDUSPUser) &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;

  // Hooks must be called unconditionally
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [filter, setFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites', organizationId],
    queryFn: () => fetchSites(organizationId, isTPUser, isDUSPUser), // Pass isTPUser and isDUSPUser flags
    enabled: !!organizationId || isSuperAdmin, // Disable query if no access
  });
  console.log(sites);
  const { data: phases = [] } = useQuery({
    queryKey: ['phases'],
    queryFn: fetchPhase,
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegion,
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: fetchSiteStatus,
  });

  const handleToggleStatus = async (site: Site) => {
    try {
      await toggleSiteActiveStatus(site.id, site.is_active);
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] });
      toast({
        title: `Site visibility updated`,
        description: `The ${site.sitename} visibility has been successfully updated.`,
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

  const confirmDelete = async () => {
    if (deleteConfirmation !== "DELETE") return;
    if (!siteToDelete) return;
    try {
      await deleteSite(siteToDelete);
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-stats'] }); // Invalidate site-stats query
      toast({
        title: "Site deleted",
        description: `The site has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete site:", error);
      toast({
        title: "Error",
        description: "Failed to delete the site. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSiteToDelete(null);
      setDeleteConfirmation("");
    }
  };

  const handleDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeleteConfirmation("");
  };

  const handleEditClick = (site: Site) => {
    setSiteToEdit(site);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSiteToEdit(null);
  };

  const handleViewDetailsClick = (siteId: string) => {
    navigate(`/site/${siteId}`);
  };

  const getStatusBadge = (status: Site['nd_site_status']['eng']) => {
    if (!status) return "Unknown"; // Handle null or undefined status
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      "In Operation": "default",
      "Permanently Close": "outline",
      "In Progress": "secondary",
      "Temporarily Close": "destructive",
    };
    const variant = variants[status] || "default";
    return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
  };

  const filteredSites = sites.filter(site =>
    site.sitename.toLowerCase().includes(filter.toLowerCase()) ||
    site.nd_site[0]?.standard_code.toLowerCase().includes(filter.toLowerCase())
  ).filter(site =>
    (phaseFilter ? site.nd_phases?.name === phaseFilter : true) &&
    (regionFilter ? site.nd_region?.eng === regionFilter : true) &&
    (statusFilter ? site.nd_site_status?.eng === statusFilter : true)
  );

  const paginatedSites = filteredSites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredSites.length);

  // Access control logic moved to the return statement
  if (!isSuperAdmin && !organizationId) {
    return <div>You do not have access to view this list.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative mb-4 flex space-x-4">
        <Input
          placeholder="Search by site name or code"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10" // Add padding to the left for the icon
        />
        <Search className="absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <div className="relative">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Phases</option>
            {phases.map(phase => (
              <option key={phase.id} value={phase.name}>{phase.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Regions</option>
            {regions.map(region => (
              <option key={region.id} value={region.eng}>{region.eng}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status.id} value={status.eng}>{status.eng}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-md border">
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Site Code</TableHead>
                <TableHead>Site Name</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Region</TableHead>
                {isSuperAdmin && <TableHead>DUSP TP</TableHead>} {/* Add DUSP TP column for super admin */}
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  {isSuperAdmin && <TableCell><Skeleton className="h-4 w-24" /></TableCell>} {/* Add DUSP TP column for super admin */}
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Site Code</TableHead>
                <TableHead>Site Name</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Region</TableHead>
                {isSuperAdmin && <TableHead>TP (DUSP)</TableHead>} {/* Add DUSP TP column for super admin */}
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSites.map((site, index) => {
                return (
                  <TableRow key={site.id}>
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell>{site?.nd_site[0]?.standard_code || ""}</TableCell>
                    <TableCell>{site?.sitename || ""}</TableCell>
                    <TableCell>{site?.nd_phases?.name || ""}</TableCell>
                    <TableCell>{site?.nd_region?.eng || ""}</TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        {site.dusp_tp_id_display || "N/A"}
                      </TableCell>
                    )}
                    <TableCell>{getStatusBadge(site?.nd_site_status?.eng)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
                        {!isDUSPUser && ( // Hide "Edit" button for DUSP users
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(site)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(site.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewDetailsClick(site.id)} // Add view details button
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
      {totalPages > 1 && (
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startItem={startItem}
          endItem={endItem}
          totalItems={filteredSites.length}
        />
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this site? Type "DELETE" to confirm.</div>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            className="mt-2 p-2 border rounded"
            placeholder="DELETE"
          />
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteConfirmation !== "DELETE"}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEditDialogOpen && ( // Render SiteFormDialog only when isEditDialogOpen is true
        <SiteFormDialog
          open={isEditDialogOpen}
          onOpenChange={handleEditDialogClose}
          site={siteToEdit} // Pass the site to edit
        />
      )}
    </div>
  );
};