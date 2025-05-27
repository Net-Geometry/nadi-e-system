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
import { uploadAttachment, deleteAttachment } from "@/components/claims/hook/upload-attachment";
import { BUCKET_NAME_SITE_CLAIM, supabase, SUPABASE_BUCKET_URL } from "@/integrations/supabase/client";
import { useSiteProfilesByIds } from "@/components/claims/tp/hooks/use-generate-claim-report";

interface ClaimData {
  id: number;
  claim_type: string;
  year: number;
  quarter: number | null;
  month: number | null;
  ref_no: string;
  date_paid: string | null;
  payment_status: boolean;
  phase_id: { id: number; name: string };
  claim_status: { id: number; name: string };
  tp_dusp_id: {
    id: string;
    name: string;
    parent_id: { id: string; name: string };
  };
  requests: {
    id: number;
    category: { id: number; name: string };
    item: {
      id: number;
      name: string;
      need_support_doc: boolean;
      need_summary_report: boolean;
      status_item: boolean;
      remark: string;
      site_ids: number[];
      suppport_doc_file: { id: number; file_path: string }[];
      summary_report_file: { id: number; file_path: string } | null;
    };
  }[];
}

interface ApplicationTabProps {
  claimData: ClaimData;
}

const ApplicationTab: React.FC<ApplicationTabProps> = ({ claimData }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);

  const { siteProfiles, isLoading, error } = useSiteProfilesByIds(selectedSiteIds);

  const handleOpenDialog = (requestId: number) => {
    setSelectedRequestId(requestId);
    setIsDialogOpen(true);
  };

  const handleOpenSiteDialog = (siteIds: number[]) => {
    setSelectedSiteIds(siteIds);
    setIsSiteDialogOpen(true);
  };

  const handleFileUpload = async () => {
    if (!selectedRequestId || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        const { success, error } = await uploadAttachment(
          file,
          claimData.tp_dusp_id, // Pass the tp_dusp_id object
          claimData.year, // Pass the year
          claimData.ref_no, // Pass the reference number
          selectedRequestId, // Pass the request ID
          1 // Supporting document
        );

        if (success) {
          // Fetch the latest data for the specific request
          const { data: updatedAttachments, error: fetchError } = await supabase
            .from("nd_claim_attachment")
            .select("id, file_path")
            .eq("request_id", selectedRequestId)
            .eq("claim_type_id", 1); // Fetch only supporting documents

          if (fetchError) {
            console.error("Error fetching updated attachments:", fetchError);
            throw new Error("Failed to fetch updated attachments");
          }

          // Update the UI with the latest attachments
          const request = claimData.requests.find((req) => req.id === selectedRequestId);
          if (request) {
            request.item.suppport_doc_file = updatedAttachments.map((attachment) => ({
              id: attachment.id,
              file_path: `${SUPABASE_BUCKET_URL}/${BUCKET_NAME_SITE_CLAIM}/${attachment.file_path}`,
            }));
          }
        } else {
          console.error("Error uploading file:", error);
          throw new Error("Failed to upload file");
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      setIsDialogOpen(false);
      setFiles([]);
    }
  };

  const handleDeleteFile = async (fileId: number, filePath: string, requestId: number) => {
    try {
      const { success, error } = await deleteAttachment(fileId, filePath);

      if (success) {
        // Update the UI
        const request = claimData.requests.find((req) => req.id === requestId);
        if (request) {
          request.item.suppport_doc_file = request.item.suppport_doc_file.filter((file) => file.id !== fileId);
        }

        // Trigger a re-render by updating the state
        setFiles((prevFiles) => [...prevFiles]); // Dummy state update to force re-render
      } else {
        console.error("Error deleting file:", error);
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div>
      <header className="mb-4">Claim Items</header>
      {/* <pre>{JSON.stringify(claimData, null, 2)}</pre> */}

      <Table className="border border-gray-300 w-full text-sm">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-4 py-2 border">Category</TableHead>
            <TableHead className="px-4 py-2 border">Items</TableHead>
            <TableHead className="px-4 py-2 text-center border">Sites</TableHead>
            <TableHead className="px-4 py-2 text-center border">Summary Report</TableHead>
            <TableHead className="px-4 py-2 text-center border">Supporting Document</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {claimData.requests.reduce((acc, request, index, array) => {
            const isFirstInCategory =
              index === 0 || request.category.id !== array[index - 1].category.id;

            acc.push(
              <TableRow key={request.id}>
                {isFirstInCategory && (
                  <TableCell
                    className="px-4 py-2 border"
                    rowSpan={
                      array.filter((req) => req.category.id === request.category.id).length
                    }
                  >
                    {request.category.name}
                  </TableCell>
                )}
                <TableCell className="px-4 py-2 border">{request.item.name}</TableCell>
                <TableCell className="px-4 py-2 text-center border">
                  <Button variant="outline" onClick={() => handleOpenSiteDialog(request.item.site_ids)}>
                    View Sites
                  </Button>
                  <div className="text-xs text-muted-foreground mt-1">
                    {request.item.site_ids.length} site{request.item.site_ids.length !== 1 ? "s" : ""} selected
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 text-center border">
                  {request.item.summary_report_file ? (
                    <a
                      href={request.item.summary_report_file.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View Report
                    </a>
                  ) : (
                    <span className="text-gray-500">Not Required</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 text-center border">
                  <div className="flex flex-col items-center gap-2">
                    {request.item.suppport_doc_file?.length ? (
                      <div className="flex flex-col gap-2">
                        {request.item.suppport_doc_file.map((file) => (
                          <div key={file.id} className="flex items-center gap-2">
                            <a
                              href={file.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              View Document
                            </a>
                            {claimData.claim_status?.name === "DRAFTED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-600"
                                onClick={() => handleDeleteFile(file.id, file.file_path, request.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Not Available</span>
                    )}
                    {claimData.claim_status?.name === "DRAFTED" && (
                      <Button variant="outline" onClick={() => handleOpenDialog(request.id)}>
                        Upload
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );

            return acc;
          }, [])}
        </TableBody>
      </Table>

      {/* Upload Dialog */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Supporting Documents</DialogTitle>
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


      {/* Dialog for Site Profiles */}
      {isSiteDialogOpen && (
        <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Site Profiles</DialogTitle>
              <DialogDescription>
                Below are the details of the selected site profiles.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              {isLoading ? (
                <p>Loading site profiles...</p>
              ) : error ? (
                <p className="text-red-500">Error loading site profiles.</p>
              ) : siteProfiles && siteProfiles.length > 0 ? (
                <table className="table-auto w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-4 py-2">Full Name</th>
                      <th className="border px-4 py-2">Ref ID (MCMC)</th>
                      <th className="border px-4 py-2">Ref ID (TP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siteProfiles.map((profile, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{profile.fullname}</td>
                        <td className="border px-4 py-2">{profile.refid_mcmc}</td>
                        <td className="border px-4 py-2">{profile.refid_tp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No site profiles available.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ApplicationTab;