import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Eye, EyeOff, Search, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { assetClient } from "@/hooks/assets/asset-client";
import { useAssets } from "@/hooks/use-assets";
import { useOrganizations } from "@/hooks/use-organizations";
import { useSpace } from "@/hooks/use-space";
import { toast } from "@/hooks/use-toast";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { Asset } from "@/types/asset";
import { useQuery } from "@tanstack/react-query";
import { fetchSites } from "../site/hook/site-utils";
import { AssetDeleteDialog } from "./AssetDeleteDialog";
import { AssetDetailsDialog } from "./AssetDetailsDialog";
import { AssetFormDialog } from "./AssetFormDialog";

interface AssetListProps {
  assets: Asset[];
  isLoadingAssets: boolean;
  refetch: () => void;
}

export const AssetList = ({
  assets,
  isLoadingAssets,
  refetch,
}: AssetListProps) => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const isTPUser =
    parsedMetadata?.user_group_name === "TP" &&
    !!parsedMetadata?.organization_id;
  const isDUSPUser =
    parsedMetadata?.user_group_name === "DUSP" &&
    !!parsedMetadata?.organization_id;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    (isTPUser || isDUSPUser) &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;

  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [duspFilter, setDuspFilter] = useState<string>("");
  const [tpFilter, setTpFilter] = useState<string>("");
  const [siteFilter, setSiteFilter] = useState<string>("");

  const { useAssetTypesQuery } = useAssets();

  const { useOrganizationsByTypeQuery } = useOrganizations();

  const { data: dusps = [], isLoading: isLoadingDusps } =
    useOrganizationsByTypeQuery("dusp", isSuperAdmin);

  const {
    data: tps = [],
    isLoading: isLoadingTPs,
    refetch: refetchTPs,
  } = useOrganizationsByTypeQuery(
    "tp",
    isSuperAdmin || isDUSPUser,
    duspFilter ?? organizationId
  );

  const {
    data: sites = [],
    isLoading: isLoadingSites,
    refetch: refetchSites,
  } = useQuery({
    queryKey: ["sites", organizationId],
    queryFn: () => fetchSites(tpFilter ?? organizationId, isTPUser, isDUSPUser),
    enabled: !!organizationId || isSuperAdmin || isDUSPUser || isTPUser,
  });

  const {
    data: spaces,
    isLoading: spacesIsLoading,
    error: spaceError,
  } = useSpace();

  useEffect(() => {
    refetchTPs();
  }, [duspFilter, refetchTPs]);

  useEffect(() => {
    refetchSites();
  }, [duspFilter, tpFilter, refetchSites]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: assetTypes = [], isLoading: isLoadingAssetType } =
    useAssetTypesQuery();

  if (isLoadingAssets || isLoadingAssetType) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const filteredAssets = (assets ?? [])
    .filter((asset) => asset?.name.toLowerCase().includes(filter.toLowerCase()))
    .filter((asset) =>
      typeFilter ? String(asset?.type.id) === String(typeFilter) : true
    )
    .filter((asset) =>
      duspFilter
        ? String(asset?.site?.dusp_tp?.parent.id) === String(duspFilter)
        : true
    )
    .filter((asset) =>
      tpFilter ? String(asset?.site?.dusp_tp_id) === String(tpFilter) : true
    )
    .filter((asset) =>
      siteFilter ? String(asset?.site?.id) === String(siteFilter) : true
    );

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredAssets.length);

  const handleToggleStatus = async (asset: Asset) => {
    try {
      await assetClient.toggleAssetActiveStatus(
        String(asset.id),
        asset.is_active
      );
      refetch();
      toast({
        title: `Asset visibility updated`,
        description: `Asset ${asset.name} visibility has been successfully updated.`,
      });
    } catch (error) {
      console.error("Failed to update asset visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update the asset visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportAssetsAsCSV = (assets: Asset[]) => {
    if (!assets || assets.length === 0) {
      console.warn("No assets to export.");
      return;
    }

    const headers = [
      "No.",
      "Name",
      "Type",
      "Brand",
      "Barcode / SKU",
      "Quantity",
      "Remark",
      "NADI Centre",
      "Location",
    ];

    if (isSuperAdmin) {
      const insertIndex = headers.indexOf("NADI Centre");
      headers.splice(insertIndex, 0, "TP (DUSP)");
    }

    // Convert assets to rows
    const rows = assets.map((asset, index) => {
      const location = spaces.find(
        (space) => String(space.id) === String(asset.location_id)
      );

      const row = [
        index + 1,
        asset.name,
        asset.type?.name ?? "",
        asset.nd_brand?.name ?? "",
        asset.serial_number ?? "",
        asset.qty_unit ?? "",
        asset.remark ?? "",
        // we'll insert "TP (DUSP)" before sitename if isSuperAdmin is true
        asset.site?.sitename ?? "",
        location?.eng ?? "",
      ];

      if (isSuperAdmin) {
        const insertIndex = row.length - 2; // before "NADI Centre"
        row.splice(insertIndex, 0, asset.site?.dusp_tp_id_display ?? "");
      }

      return row;
    });

    const csvContent = [headers, ...rows]
      .map((e) => e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return csvContent;
  };

  const handleExportAssets = () => {
    const csvContent = exportAssetsAsCSV(filteredAssets);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "assets.csv");
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="relative mb-4 flex space-x-4">
        <Input
          placeholder="Search asset.."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">All Types</option>
            {assetTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        {isSuperAdmin && (
          <div className="relative">
            <select
              value={duspFilter}
              onChange={(e) => setDuspFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={isLoadingDusps}
            >
              <option value="">All DUSP</option>
              {dusps.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {(isSuperAdmin || isDUSPUser) && (
          <div className="relative">
            <select
              value={tpFilter}
              onChange={(e) => setTpFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={isLoadingTPs}
            >
              <option value="">All TP</option>
              {tps.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {(isSuperAdmin || isDUSPUser || isTPUser) && (
          <div className="relative">
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={isLoadingSites}
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site?.id} value={site?.id}>
                  {site?.sitename}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="relative">
          <Button
            disabled={spacesIsLoading}
            onClick={() => handleExportAssets()}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        {isLoadingAssets ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                {/* Add DUSP TP column for super admin */}
                {isSuperAdmin && <TableHead>TP (DUSP)</TableHead>}
                <TableHead>Nadi Centre</TableHead>
                <TableHead>Request Date</TableHead>
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
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
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
                <TableHead>Item Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                {/* Add DUSP TP column for super admin */}
                {isSuperAdmin && <TableHead>TP (DUSP)</TableHead>}
                <TableHead>Nadi Centre</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssets &&
                paginatedAssets.map((asset, index) => {
                  const requestDate = asset.created_at
                    ? asset.created_at.split("T")[0]
                    : "";

                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{asset?.name || "N/A"}</TableCell>
                      <TableCell>{asset?.type.name || "N/A"}</TableCell>
                      <TableCell>{asset?.qty_unit || "N/A"}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          {asset?.site?.dusp_tp_id_display || "N/A"}
                        </TableCell>
                      )}
                      <TableCell>{asset?.site?.sitename || "N/A"}</TableCell>
                      <TableCell>{requestDate || "N/A"}</TableCell>
                      <TableCell>
                        {asset?.is_active ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(asset)}
                          >
                            {asset.is_active ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setIsEditDialogOpen(true);
                              setSelectedItem(asset);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setIsDeleteDialogOpen(true);
                              setSelectedItem(asset);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setIsViewDetailsDialogOpen(true);
                              setSelectedItem(asset);
                            }}
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
          totalItems={filteredAssets.length}
        />
      )}

      <AssetDetailsDialog
        open={isViewDetailsDialogOpen}
        onOpenChange={setIsViewDetailsDialogOpen}
        asset={selectedItem}
      />
      {isEditDialogOpen && (
        <AssetFormDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) refetch();
          }}
          asset={selectedItem}
        />
      )}
      {isDeleteDialogOpen && (
        <AssetDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) refetch();
          }}
          asset={selectedItem}
        />
      )}
    </div>
  );
};
