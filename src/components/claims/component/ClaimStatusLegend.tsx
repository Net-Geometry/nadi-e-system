import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";

interface ClaimStatusDescriptionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    status: string;
}

const ClaimStatusDescriptionDialog: React.FC<ClaimStatusDescriptionDialogProps> = ({
    isOpen,
    onClose,
    status,
}) => {
    const [statusDescriptions, setStatusDescriptions] = useState<
        { name: string; description: string }[]
    >([]);
    const [loading, setLoading] = useState<boolean>(true);

    const statuses = ["DRAFTED", "SUBMITTED", "REJECTED", "PROCESSING", "COMPLETED"];

    useEffect(() => {
        const fetchDescriptions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("nd_claim_status")
                .select("name, description");

            if (error) {
                console.error("Error fetching descriptions:", error);
                setStatusDescriptions([]);
            } else {
                setStatusDescriptions(data || []);
            }
            setLoading(false);
        };

        if (isOpen) {
            fetchDescriptions();
        }
    }, [isOpen]);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "DRAFTED":
                return "default";
            case "SUBMITTED":
                return "info";
            case "PROCESSING":
                return "warning";
            case "COMPLETED":
                return "success";
            case "REJECTED":
                return "destructive";
            default:
                return "secondary";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[670px]">
                <DialogHeader>
                    <DialogTitle>Claim Status Flow</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Status Flow */}
                    <div className="flex items-center gap-x-4">
                        {statuses.map((flowStatus, index) => (
                            <React.Fragment key={flowStatus}>
                                <Badge
                                    variant={getStatusBadgeVariant(flowStatus)}
                                    className={flowStatus === status ? "ring-2 ring-primary" : ""}
                                >
                                    {flowStatus}
                                </Badge>
                                {index < statuses.length - 1 && (
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>


                    {/* Status Descriptions */}
                    <div className="space-y-4">
                        {loading ? (
                            <p>Loading descriptions...</p>
                        ) : (
                            statuses.map((flowStatus) => {
                                const description = statusDescriptions.find(
                                    (desc) => desc.name === flowStatus
                                )?.description;

                                return (
                                    <div
                                        key={flowStatus}
                                        className={`p-4 border rounded-md ${flowStatus === status ? "bg-primary/10 border-primary" : ""
                                            }`}
                                    >
                                        <h3 className="font-semibold">
                                            {flowStatus === status ? "Current Status: " : ""}
                                            {flowStatus}
                                        </h3>
                                        <p className="whitespace-pre-line">
                                            {description || "No description available for this status."}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ClaimStatusDescriptionDialog;