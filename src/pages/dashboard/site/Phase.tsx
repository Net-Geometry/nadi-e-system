import React from 'react';
import { useUserMetadata } from '@/hooks/use-user-metadata';
import { useGetPhases, useDeletePhase } from '@/hooks/phase/use-phase';
import DataTable, { Column } from '@/components/ui/datatable';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    Calendar,
    Clock,
    Eye,
    Trash2,
    Edit,
    Plus,
    CheckCircle,
    XCircle,
    X,
    AlertCircle
} from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useNavigate } from 'react-router-dom';
import PhaseDialog from '@/components/site/component/PhaseDialog';
import { format } from 'date-fns';

const Phase = () => {
    // Get user metadata for permissions
    const userMetadata = useUserMetadata();
    const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;

    const isDusp = parsedMetadata?.user_type.startsWith('dusp') || "";
    const isAdmin = parsedMetadata?.user_type.startsWith('super_admin') || "";
    const isMCMC = parsedMetadata?.user_type.startsWith('mcmc') || "";
    const isTP = parsedMetadata?.user_type.startsWith('tp') || "";

    const { toast } = useToast();
    const navigate = useNavigate();

    // Fetch all phases - no organization filtering
    const {
        data: phases = [],
        isLoading,
        error
    } = useGetPhases();
    console.log("Phases data:", phases); // Debug log
    const deletePhaseMutation = useDeletePhase();

    const [confirmDialog, setConfirmDialog] = React.useState<{
        open: boolean;
        phaseId: number | null;
    }>({ open: false, phaseId: null });

    const [viewDialog, setViewDialog] = React.useState<{ open: boolean; phase: any | null }>({ open: false, phase: null });

    // Action handlers
    const handleViewPhase = (phaseId: number) => {
        const phase = phases.find((p) => p.id === phaseId);
        setViewDialog({ open: true, phase });
    };

    const handleEditPhase = (phaseId: number) => {
        navigate(`/site-management/phase/form/${phaseId}`);
    };

    const handleDeletePhase = (phaseId: number) => {
        setConfirmDialog({ open: true, phaseId });
    };

    const handleConfirmDelete = async () => {
        if (confirmDialog.phaseId == null) return;
        try {
            await deletePhaseMutation.mutateAsync(confirmDialog.phaseId);
            toast({
                title: `Deleted Phase ${confirmDialog.phaseId}`,
                variant: "success",
            });
        } catch (error: any) {
            toast({
                title: `Failed to delete Phase ${confirmDialog.phaseId}`,
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setConfirmDialog({ open: false, phaseId: null });
        }
    };

    const handleCreatePhase = () => {
        navigate('/site-management/phase/form');
    };

    // Data table configuration
    const columns: Column[] = [
        {
            key: (_, i) => `${i + 1}.`,
            header: "No",
            width: "5%",
            visible: true,
            align: "center"
        },
        {
            key: "name",
            header: (
                <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Phase Name</span>
                </div>
            ),
            render: (value) => value || "-",
            filterable: true,
            visible: true,
            filterType: "string",
            align: "center",
        },
        {
            key: "is_active",
            header: "Status",
            filterable: true,
            visible: true,
            filterType: "boolean",
            width: "10%",
            align: "center",
            render: (value) => {
                if (value === null || value === undefined) {
                    return (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <X className="w-3 h-3 mr-1" /> Not Set
                        </span>
                    );
                }
                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {value ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                        ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                        )}
                    </span>
                );
            }
        },
        {
            key: "updated_at",
            header: (
                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Updated At</span>
                </div>
            ),
            render: (value) => {
                if (!value) return '-';
                try {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return value;
                    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                } catch (e) {
                    return value;
                }
            },
            visible: true,
            align: "center",
            width: "15%",
            // filterable: true,
            // filterType: "date"
        },

        {
            key: (row) => (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                        onClick={() => handleViewPhase(row.id)}
                        title="View details"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                    {(isAdmin || isMCMC || isDusp || isTP) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                            onClick={() => handleEditPhase(row.id)}
                            title="Edit phase"
                        >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                    )}
                    {(isAdmin || isMCMC || isDusp || isTP) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                            onClick={() => handleDeletePhase(row.id)}
                            title="Delete phase"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    )}
                </div>
            ),
            header: "Actions",
            align: "center",
            width: "10%",
            visible: true,
        }
    ];

    return (
        <div className="space-y-4">            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Phase Management</h1>
                {(isAdmin || isMCMC || isDusp || isTP) && (
                    <Button
                        onClick={handleCreatePhase}
                        className="flex items-center gap-2"
                        disabled={isLoading}
                    >
                        <Plus size={16} />
                        <span>Create Phase</span>
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                    <AlertCircle size={20} />
                    <span>Error loading phases: {(error as Error).message}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <DataTable
                    data={phases}
                    columns={columns}
                    pageSize={10}
                    isLoading={isLoading}
                />

                {/* {phases.length === 0 && !isLoading && !error && (
                    <div className="py-8 text-center text-gray-500">
                        No phases found. Create a new phase to get started.
                    </div>
                )} */}
            </div>

            <ConfirmationDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                title="Delete Phase?"
                description="Are you sure you want to delete this phase? This action cannot be undone."
                confirmText="Delete"
                confirmVariant="destructive"
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDialog({ open: false, phaseId: null })}
            />

            <PhaseDialog
                open={viewDialog.open}
                onOpenChange={(open) => setViewDialog((prev) => ({ ...prev, open }))}
                phase={viewDialog.phase}
            />
        </div>
    );
}

export default Phase;
