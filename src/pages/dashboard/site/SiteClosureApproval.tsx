import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { fetchSiteClosureRequests, updateSiteClosureRequest, fetchClosure_Status } from "@/components/site/queries/site-closure";
import { SiteClosureRequest, Closure_Status } from "@/components/site/types/site-closure";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/date-utils"; // Utility for formatting dates
import { useUserMetadata } from "@/hooks/use-user-metadata"; // Import user metadata

const SiteClosureApproval = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userMetadata = useUserMetadata();
    const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;

    const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
    const isTPUser = parsedMetadata?.user_group_name === "TP" && !!parsedMetadata?.organization_id;
    const organizationId = isTPUser ? parsedMetadata.organization_id : null;

    const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

    // Fetch site closure requests
    const { data: requests = [], isLoading: isRequestsLoading, isError: isRequestsError } = useQuery({
        queryKey: ["site-closure-requests", organizationId],
        queryFn: () => fetchSiteClosureRequests(organizationId), // Pass organizationId for TP users
        enabled: isSuperAdmin || !!organizationId, // Enable query for super_admin or TP users with organizationId
    });

    // Fetch closure statuses
    const { data: statuses = [], isLoading: isStatusesLoading, isError: isStatusesError } = useQuery({
        queryKey: ["closure-statuses"],
        queryFn: fetchClosure_Status,
    });

    const handleUpdateStatus = async (id: string, status_id: string | number) => {
        const numericStatusId = typeof status_id === "string" ? parseInt(status_id, 10) : status_id;

        // Restrict TP users to only update statuses with IDs 3, 4, and 5
        if (isTPUser && ![3, 4, 5].includes(numericStatusId)) {
            toast({
                title: "Action not allowed",
                description: "You are not allowed to update to this status.",
                variant: "destructive",
            });
            return;
        }

        console.log("Attempting to update status:", { id, status_id: numericStatusId });

        try {
            setIsSubmitting(true);
            await updateSiteClosureRequest(id, numericStatusId); // Directly call the update function
            queryClient.invalidateQueries({ queryKey: ["site-closure-requests", organizationId] }); // Refresh data after update
            toast({ title: "Request updated successfully.", variant: "default" });
        } catch (error: any) {
            console.error("Error updating site closure request:", error); // Log detailed error
            toast({
                title: "Failed to update request.",
                description: error?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: number, statuses: Closure_Status[]) => {
        const statusObj = statuses.find(s => s.id === status);
        if (!statusObj) return <Badge variant="outline">Unknown</Badge>;

        const variants: Record<number, "default" | "destructive" | "outline" | "secondary"> = {
            1: "default", 
            2: "outline", 
            3: "secondary", 
            4: "destructive", 
            5: "default", 
            6: "secondary", 
            7: "destructive", 
            8: "default", 
        };

        const variant = variants[status] || "outline";
        return <Badge variant={variant}>{statusObj.name}</Badge>;
    };

    if (isRequestsLoading || isStatusesLoading) {
        return <div>Loading...</div>;
    }

    if (isRequestsError || isStatusesError) {
        return <div>Error loading data. Please try again later.</div>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Site Closure Approval</h1>
                {/* <p className="text-muted-foreground">Approve, reject, or recommend site closure requests.</p> */}
                <div className="rounded-md border">
                    {requests.length === 0 ? (
                        <p className="p-4">No site closure requests available.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Site Name</TableHead>
                                    <TableHead>Standard Code</TableHead>
                                    <TableHead>Categories</TableHead>
                                    <TableHead>Subcategories</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests
                                    .filter(request => 
                                        isSuperAdmin || 
                                        (isTPUser && request.nd_site_profile?.organizations?.id === organizationId) // Directly check the organization ID
                                    )
                                    .map((request: SiteClosureRequest, index) => (
                                        <TableRow key={request.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{request?.nd_site_profile?.sitename || "N/A"}</TableCell>
                                            <TableCell>{request?.nd_site_profile?.nd_site?.[0]?.standard_code || "N/A"}</TableCell>
                                            <TableCell>
                                                {request.nd_closure_categories
                                                    ? request.nd_closure_categories.eng
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {request.nd_closure_subcategories
                                                    ? request.nd_closure_subcategories.eng
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell>{request.duration || "N/A"}</TableCell>
                                            <TableCell>{formatDate(request.close_start)}</TableCell>
                                            <TableCell>{formatDate(request.close_end)}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(request.nd_closure_status?.id, statuses)}
                                            </TableCell>
                                            <TableCell>
                                                {isSuperAdmin || (isTPUser && ![3, 4, 5].includes(request.nd_closure_status?.id)) ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <span className="sr-only">Open menu</span>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="w-5 h-5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm0 5.25a.75.75 0 110-1.5.75.75 0 010 1.5z"
                                                                    />
                                                                </svg>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {statuses
                                                                .filter(status => isSuperAdmin || [3, 4, 5].includes(status.id)) // Hide statuses not allowed for TP users
                                                                .map((status: Closure_Status) => (
                                                                    <DropdownMenuItem
                                                                        key={status.id}
                                                                        onClick={() => handleUpdateStatus(request.id, String(status.id))}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        {status.name}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <span>No actions available</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SiteClosureApproval;
