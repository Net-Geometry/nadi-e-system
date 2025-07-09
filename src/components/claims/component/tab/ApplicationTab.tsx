import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import ViewSiteDialog from "../ViewSiteDialog";
import FrontPage from "../../template/component/FrontPage";
import Appendix from "../../template/component/Appendix";

type ClaimData = {
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
  tp_dusp_id: { id: string; name: string; parent_id: { id: string; name: string; logo_url: string; description: string } };
  requests: {
    id: number;
    name: string;
    items: {
      id: number;
      item: {
        id: number;
        name: string;
        need_support_doc: boolean;
        need_summary_report: boolean;
        need_appendix: boolean;
        status_item: boolean;
        remark: string | null;
        site_ids: number[];
        suppport_doc_file: { id: number; file_path: string }[];
        summary_report_file: { id: number; file_path: string } | null;
        appendix_file: { id: number; file_path: string }[];
      };
    }[];
  }[];
};

type ApplicationTabProps = {
  claimData: ClaimData;
  refetch: () => void;
};

export function ApplicationTab({ claimData, refetch }: ApplicationTabProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewSiteDialogOpen, setIsViewSiteDialogOpen] = useState(false);
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);

  const handleDownloadAllReports = async () => {
    setIsDownloading(true);
    try {
      const pdfDoc = await PDFDocument.create();

      // Add the FrontPage as the first page
      const frontPageFile = await FrontPage({
        duspName: claimData.tp_dusp_id.parent_id.description,
        claimType: claimData.claim_type,
        year: claimData.year,
        quarter: claimData.quarter,
        month: claimData.month,
        dusplogo: claimData.tp_dusp_id.parent_id.logo_url,
      });
      const frontPageBytes = await frontPageFile.arrayBuffer();
      const frontPagePdf = await PDFDocument.load(frontPageBytes);
      const frontPagePages = await pdfDoc.copyPages(frontPagePdf, frontPagePdf.getPageIndices());
      frontPagePages.forEach((page) => pdfDoc.addPage(page));

      // Add all items first
      for (const request of claimData.requests) {
        for (const item of request.items) {
          if (item.item.summary_report_file) {
            const summaryResponse = await fetch(item.item.summary_report_file.file_path);
            const summaryBytes = await summaryResponse.arrayBuffer();
            const summaryPdf = await PDFDocument.load(summaryBytes);
            const summaryPages = await pdfDoc.copyPages(summaryPdf, summaryPdf.getPageIndices());
            summaryPages.forEach((page) => pdfDoc.addPage(page));
          }
        }
      }

      // Add all attachments after items
      for (const request of claimData.requests) {
        for (const item of request.items) {
          if (item.item.suppport_doc_file?.length > 0) {
            const appendixFile = await Appendix({
              appendixNumber: "APPENDIX",
              title: item.item.name,
              attachments: item.item.suppport_doc_file.map((file) => ({
                path: file.file_path,
                description: `Supporting Document for ${item.item.name}`,
              })),
            });
            const appendixBytes = await appendixFile.arrayBuffer();
            const appendixPdf = await PDFDocument.load(appendixBytes);
            const appendixPages = await pdfDoc.copyPages(appendixPdf, appendixPdf.getPageIndices());
            appendixPages.forEach((page) => pdfDoc.addPage(page));
          }
        }
      }

      // Serialize the combined PDF
      const combinedPdfBytes = await pdfDoc.save();

      // Create a blob and trigger download
      const blob = new Blob([combinedPdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ClaimData_Combined_Report.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error combining and downloading reports:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Claim Lists</h2>
        <Button
          variant="outline"
          onClick={handleDownloadAllReports}
          disabled={isDownloading}
          className="relative flex items-center justify-center"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-2"></div>
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Combined Reports
            </>
          )}
        </Button>
      </div>

      <Table className="border border-gray-300 w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2 border w-[120px]">Category</TableHead>
            <TableHead className="px-4 py-2 border w-[200px]">Items</TableHead>
            <TableHead className="px-4 py-2 border w-[120px]">Sites</TableHead>
            <TableHead className="px-4 py-2 text-center border w-[120px]">Summary Report</TableHead>
            <TableHead className="px-4 py-2 text-center border">Attachment</TableHead>
            <TableHead className="px-4 py-2 text-center border">Appendix</TableHead>
            <TableHead className="px-4 py-2 text-center border w-[300px]">Remark</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {claimData.requests.map((request) => (
            <React.Fragment key={request.id}>
              {request.items.map((item, index) => (
                <TableRow key={item.id}>
                  {index === 0 && (
                    <TableCell
                      className="px-4 py-2 align-top border"
                      rowSpan={request.items.length}
                    >
                      {request.name}
                    </TableCell>
                  )}
                  <TableCell className="px-4 py-2 border">{item.item.name}</TableCell>
                  <TableCell className="px-4 py-2 text-center border">
                    {item.item.site_ids.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedSiteIds(item.item.site_ids);
                            setIsViewSiteDialogOpen(true);
                          }}
                          className="h-6"
                        >
                          View Sites
                        </Button>
                        <div className="text-xs text-muted-foreground mt-1">
                          {`${item.item.site_ids.length} site${item.item.site_ids.length !== 1 ? "s" : ""} selected`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Sites</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center border">
                    {item.item.need_summary_report ? (
                      item.item.summary_report_file ? (
                        <a
                          href={item.item.summary_report_file.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Report
                        </a>
                      ) : (
                        <span className="text-gray-500">Not Available</span>
                      )
                    ) : (
                      <span className="text-gray-500">Not Required</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center border">
                    {item.item.need_support_doc ? (
                      <div className="flex flex-col items-center gap-2">
                        {item.item.suppport_doc_file?.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {item.item.suppport_doc_file.map((file, idx) => (
                              <a
                                key={idx}
                                href={file.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                View File {idx + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No Files</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Not Required</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center border">
                    {item.item.need_appendix ? (
                      <div className="flex flex-col items-center gap-2">
                        {item.item.appendix_file?.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {item.item.appendix_file.map((file, idx) => (
                              <a
                                key={idx}
                                href={file.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                View File {idx + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No Files</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Not Required</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center border">
                    <span className="px-2 py-1 w-full">
                      {item.item.remark?.trim() ? item.item.remark : "No Remark"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {/* View Site Dialog */}
      <ViewSiteDialog
        isOpen={isViewSiteDialogOpen}
        onClose={() => setIsViewSiteDialogOpen(false)}
        siteIds={selectedSiteIds}
      />
    </div>
  );
}