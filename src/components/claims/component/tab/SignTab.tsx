import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { uploadSignDoc, deleteAttachment } from "@/components/claims/hook/upload-attachment";
import { supabase, SUPABASE_BUCKET_URL, BUCKET_NAME_SITE_CLAIM } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateNoa } from "../../dusp/update-noa";

interface ClaimData {
    id: number;
    claim_type: string;
    year: number;
    quarter: number | null;
    month: number | null;
    noa: string | null;
    ref_no: string;
    claim_status: { id: number; name: string };
    tp_dusp_id: {
        id: string;
        name: string;
        parent_id: { id: string; name: string };
    };
    signed_documents: { id: number; file_path: string }[]; // Signed documents
}

interface SignTabProps {
    claimData: ClaimData;
}

const SignTab: React.FC<SignTabProps> = ({ claimData }) => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [signedDocuments, setSignedDocuments] = useState(claimData.signed_documents);
    const [isEditing, setIsEditing] = useState(false);
    const [noaValue, setNoaValue] = useState(claimData.noa || "");

    const fetchLatestSignedDocuments = async () => {
        try {
            const { data: updatedSignedDocuments, error: fetchError } = await supabase
                .from("nd_claim_attachment")
                .select("id, file_path")
                .eq("claim_id", claimData.id)
                .eq("claim_type_id", 3); // Fetch only signed documents

            if (fetchError) {
                console.error("Error fetching updated signed documents:", fetchError);
                throw new Error("Failed to fetch updated signed documents");
            }

            // Update the local state
            setSignedDocuments(
                updatedSignedDocuments.map((doc) => ({
                    id: doc.id,
                    file_path: `${SUPABASE_BUCKET_URL}/${BUCKET_NAME_SITE_CLAIM}/${doc.file_path}`,
                }))
            );
        } catch (error) {
            console.error("Error fetching latest signed documents:", error);
        }
    };
    const handleFileUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            for (const file of files) {
                const { success, error } = await uploadSignDoc(
                    file,
                    claimData.tp_dusp_id,
                    claimData.year,
                    claimData.ref_no,
                    claimData.id,
                    3
                );

                if (!success) {
                    console.error("Error uploading file:", error);
                    throw new Error("Failed to upload file");
                }
            }

            // Fetch the latest signed documents
            queryClient.invalidateQueries({ queryKey: ["fetchClaimById"] });
            await fetchLatestSignedDocuments();
        } catch (error) {
            console.error("Error uploading files:", error);
        } finally {
            setIsUploading(false);
            setIsDialogOpen(false);
            setFiles([]);
        }
    };


    const handleDeleteFile = async (fileId: number) => {
        try {
            const { success, error } = await deleteAttachment(fileId);

            if (!success) {
                console.error("Error deleting file:", error);
                throw new Error("Failed to delete file");
            }

            // Fetch the latest signed documents
            queryClient.invalidateQueries({ queryKey: ["fetchClaimById"] });
            await fetchLatestSignedDocuments();
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const handleSave = async () => {
        try {
            await updateNoa({ claim_id: claimData.id, noa: noaValue });
            queryClient.invalidateQueries({ queryKey: ["fetchClaimById"] });
            console.log("NOA updated successfully");
            setIsEditing(false); // Disable editing after saving
        } catch (error) {
            console.error("Error updating NOA:", error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium">Signed Documents</h2>

                {claimData.claim_status?.name === "SUBMITTED" && (
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        Upload Signed Document
                    </Button>
                )}
            </div>
{/* <pre>{JSON.stringify(claimData.signed_documents, null, 2)}</pre> */}

            <Table className="border border-gray-300 w-full text-sm">
                <TableHeader>
                    <TableRow>
                        <TableHead className="px-4 py-2 text-center border">Signed Documents</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {signedDocuments?.length ? (
                        signedDocuments.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell className="px-4 py-2 text-center border">
                                    <div className="flex items-center justify-center gap-2">
                                        <a
                                            href={file.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline"
                                        >
                                            View Document
                                        </a>
                                        {claimData.claim_status?.name === "SUBMITTED" && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-red-600"
                                                onClick={() => handleDeleteFile(file.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell className="px-4 py-2 text-center border text-gray-500">
                                No signed documents available.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Table className="border border-gray-300 w-full text-sm mt-6">
                <TableBody>
                    <TableRow>
                        <TableCell className="px-4 py-2 text-center border">Number of Agreements (NOA)</TableCell>
                        <TableCell className="px-4 py-2 text-center border">
                            {isEditing ? (
                                <Input
                                    type="number"
                                    placeholder="Enter Number of Agreement"
                                    value={noaValue}
                                    onChange={(e) => setNoaValue(e.target.value)}
                                />
                            ) : (
                                <span>{noaValue || "N/A"}</span>
                            )}
                        </TableCell>
                        {claimData.claim_status?.name === "SUBMITTED" && (
                            <TableCell className="px-4 py-2 text-center border  w-[120px]">
                                {isEditing ? (
                                    <Button variant="default" onClick={handleSave}>
                                        Save
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                                        Edit
                                    </Button>
                                )}
                            </TableCell>
                        )}
                    </TableRow>
                </TableBody>
            </Table>

            {/* Upload Dialog */}

            {isDialogOpen && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Signed Documents</DialogTitle>
                            <DialogDescription></DialogDescription>
                        </DialogHeader>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                onClick={handleFileUpload}
                                disabled={files.length === 0 || isUploading}
                            >
                                {isUploading ? "Uploading..." : "Upload"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}


        </div>
    );
};

export default SignTab;