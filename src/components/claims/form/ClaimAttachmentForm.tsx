import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Trash2 } from "lucide-react";
import { Progress } from "@radix-ui/react-progress";
import { Textarea } from "@/components/ui/textarea";
import { PDFDocument } from "pdf-lib";
import FrontPage from "../template/component/FrontPage";
import AppendixBlob from "../template/component/AppendixBlob";
import { generateReportByItemId } from "../hook/getGenerateReport";

type CategoryData = {
    id: number;
    name: string;
    item_ids: {
        id: number;
        name: string;
        need_appendix: boolean;
        need_summary_report: boolean;
        need_support_doc: boolean;
        appendix_file: File[] | null; // New state for the appendix document
        summary_report_file: File | null; // New state for the support document
        suppport_doc_file: File[] | null; // New state for the summary report
        remark: string;
        site_ids: number[];
    }[];
}
type ClaimData = {
    claim_type: string;
    year: number;
    quarter: number;
    month: number;
    start_date: string;
    end_date: string;
    ref_no: string;
    tp_dusp_id: string;
    dusp_id: string;
    dusp_description: string;
    dusp_logo: string;
    phase_id: number;
    category_ids: CategoryData[];
    is_finished_generate: boolean;
};

type ClaimAttachmentFormProps = ClaimData & {
    updateFields: (fields: Partial<ClaimData>) => void;
};

export function ClaimAttachmentForm({
    claim_type,
    year,
    quarter,
    month,
    start_date,
    end_date,
    ref_no,
    tp_dusp_id,
    dusp_id,
    dusp_description,
    dusp_logo,
    phase_id,
    category_ids,
    is_finished_generate,
    updateFields,
}: ClaimAttachmentFormProps) {
    const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progressAll, setProgressAll] = useState(0);

    const generateReportForItem = async (itemId: number) => {
        let targetItem = null;
        let categoryIndex = -1;
        let itemIndex = -1;

        // Find the category and item
        for (let i = 0; i < category_ids.length; i++) {
            const category = category_ids[i];
            for (let j = 0; j < category.item_ids.length; j++) {
                if (category.item_ids[j].id === itemId) {
                    categoryIndex = i;
                    itemIndex = j;
                    targetItem = category.item_ids[j];
                    break;
                }
            }
            if (targetItem) break;
        }

        if (!targetItem || !targetItem.need_summary_report) return null;

        // Find the first item in this category that needs a summary report for header logic
        const category = category_ids[categoryIndex];
        const firstTrueItem = category.item_ids.find((itm) => itm.need_summary_report);
        const firstTrueItemId = firstTrueItem?.id;

        const reportData = {
            claimType: claim_type,
            quater: String(quarter),
            startDate: start_date,
            endDate: end_date,
            tpFilter: tp_dusp_id,
            phaseFilter: phase_id,
            duspFilter: dusp_id,
            dusplogo: dusp_logo,
            nadiFilter: targetItem.site_ids,
            header: itemId === firstTrueItemId,
        };

        let generatedFile: File | null = null;

        try {
            return await generateReportByItemId(itemId, reportData);
        } catch (error) {
            console.error(`Error generating report for item ${itemId}:`, error);
            return null;
        }
    };

    const generateSummaryReport = async (itemId: number) => {

        setGeneratingIndex(itemId);
        setProgress(0);

        let generatedFile: File | null = null;

        // Simulate progress
        let newProgress = 0;
        // const newProgress = Math.min(progress + Math.floor(Math.random() * 10) + 1, 99);

        while (newProgress <= 80) {
            const increment = Math.floor(Math.random() * 10) + 39;
            newProgress = Math.min(newProgress + increment, 100);

            setProgress(newProgress);
            if (newProgress > 80) break;

            await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
        }

        try {
            generatedFile = await generateReportForItem(itemId);

            setProgress(100);

            if (generatedFile) {
                // Open the generated file in a new tab instead of saving it
                const fileURL = URL.createObjectURL(generatedFile);
                window.open(fileURL, '_blank');

                // Clean up the object URL after a short delay
                setTimeout(() => {
                    URL.revokeObjectURL(fileURL);
                }, 1000);
            }

        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setGeneratingIndex(null);
            setProgress(0);
        }
    };

    const downloadSummaryReport = async (itemId: number) => {

        setGeneratingIndex(itemId);
        setProgress(0);


        let generatedFile: File | null = null;

        // Simulate progress
        let newProgress = 0;

        while (newProgress <= 80) {
            const increment = Math.floor(Math.random() * 10) + 39;
            newProgress = Math.min(newProgress + increment, 100);

            setProgress(newProgress);
            if (newProgress > 80) break;

            await new Promise(resolve => setTimeout(resolve, 500)); // wait 500ms
        }

        try {

            generatedFile = await generateReportForItem(itemId);

            setProgress(100);

            if (generatedFile) {
                // Download the generated file without saving to state
                const fileURL = URL.createObjectURL(generatedFile);
                const link = document.createElement('a');
                link.href = fileURL;
                link.download = generatedFile.name || `report-${itemId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the object URL after a short delay
                setTimeout(() => {
                    URL.revokeObjectURL(fileURL);
                }, 1000);
            }

        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setGeneratingIndex(null);
            setProgress(0);
        }
    };

    const handleDownloadAllReports = async () => {
        setIsDownloading(true);
        
        const generatedUrls: string[] = [];

        try {
            const pdfDoc = await PDFDocument.create();

            // Add the FrontPage as the first page
            const frontPageFile = await FrontPage({
                duspName: dusp_description,
                claimType: claim_type,
                year: year,
                quarter: quarter,
                month: month,
                dusplogo: dusp_logo,
            });
            const frontPageBytes = await frontPageFile.arrayBuffer();
            const frontPagePdf = await PDFDocument.load(frontPageBytes);
            const frontPagePages = await pdfDoc.copyPages(frontPagePdf, frontPagePdf.getPageIndices());
            frontPagePages.forEach((page) => pdfDoc.addPage(page));

            // Simulate progress
            let newProgress = 0;
            const totalCategories = category_ids.length;
            const num1 = Math.floor(totalCategories * 0.8);
            const num2 = totalCategories - num1;

            const increment1 = num1 === 0 ? 0 : 80 / num1;
            const increment2 = num2 === 0 ? 0 : 20 / num2;

            // Generate and add summary reports
            for (const category of category_ids) {
                for (const item of category.item_ids) {
                    if (item.need_summary_report) {

                        const reportFile = await generateReportForItem(item.id);

                        if (reportFile) {
                            const reportBytes = await reportFile.arrayBuffer();
                            const reportPdf = await PDFDocument.load(reportBytes);
                            const reportPages = await pdfDoc.copyPages(reportPdf, reportPdf.getPageIndices());
                            reportPages.forEach((page) => pdfDoc.addPage(page));
                        }

                        setProgressAll(Math.min(newProgress, 80));
                        newProgress += increment1;
                    }

                    // // Add supporting documents for this item right after its summary report (per category)
                    // if (item.suppport_doc_file?.length > 0) {
                    //     for (const supportFile of item.suppport_doc_file) {
                    //         try {
                    //             const supportFileBytes = await supportFile.arrayBuffer();
                    //             const supportPdf = await PDFDocument.load(supportFileBytes);
                    //             const supportPages = await pdfDoc.copyPages(supportPdf, supportPdf.getPageIndices());
                    //             supportPages.forEach((page) => pdfDoc.addPage(page));
                    //         } catch (error) {
                    //             console.error(`Error processing support document ${supportFile.name}:`, error);
                    //             // Continue with next file if one fails
                    //         }
                    //     }
                    // }
                }
            }

            // Add all appendix after items
            for (const category of category_ids) {
                for (const item of category.item_ids) {
                    if (item.appendix_file?.length > 0) {
                        setProgressAll(Math.min(newProgress, 100));
                        newProgress += increment2;

                        // Convert File objects to proper attachment format
                        const attachments = item.appendix_file.map((file) => ({
                            file: file, // Pass the File object directly
                            name: file.name,
                            description: `Appendix for ${item.name}`,
                        }));

                        const appendixFile = await AppendixBlob({
                            appendixNumber: "APPENDIX",
                            title: item.name,
                            attachments: attachments,
                        });

                        const appendixBytes = await appendixFile.arrayBuffer();
                        const appendixPdf = await PDFDocument.load(appendixBytes);
                        const appendixPages = await pdfDoc.copyPages(appendixPdf, appendixPdf.getPageIndices());
                        appendixPages.forEach((page) => pdfDoc.addPage(page));
                    }
                }
            }

            setProgressAll(100);

            // Save and download the combined PDF
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ClaimData_Combined_Report.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error creating combined report:', error);
        } finally {
            // Clean up blob URLs created for file attachments
            generatedUrls.forEach(url => URL.revokeObjectURL(url));
            setIsDownloading(false);
            setProgressAll(0);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <header>Category & Items Attachments</header>
                    <a
                        href="/reference_report.pdf" // replace with your actual PDF URL
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'blue', textDecoration: 'underline' }}
                    >View Reference</a>
                </div>
                <Button
                    onClick={handleDownloadAllReports}
                    disabled={isDownloading || category_ids.length === 0}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Generating Combined Report...' : 'Download All Combined Report'}
                </Button>
            </div>
            {/* <pre>{JSON.stringify(category_ids, null, 2)}</pre> */}

            {isDownloading && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Generating Combined Report...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressAll}%` }} />
                    </div>
                </div>
            )}

            <Table className="border border-gray-300 w-full text-sm">
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="px-4 py-2 border">Category</TableHead>
                        <TableHead className="px-4 py-2 border">Items</TableHead>
                        <TableHead className="px-10 py-2 text-center border">Summary Report</TableHead>
                        <TableHead className="px-10 py-2 text-center border">Supporting Document</TableHead>
                        <TableHead className="px-10 py-2 text-center border">Appendix</TableHead>
                        <TableHead className="px-10 py-2 text-center border">Remark</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {category_ids.map((category) =>
                        category.item_ids.map((item, itemIndex) => (
                            <TableRow key={`category-${category.id}-item-${item.id}`}>
                                {/* Show category name only for the first item in each category */}
                                {itemIndex === 0 ? (
                                    <TableCell rowSpan={category.item_ids.length} className="px-4 py-2 border font-semibold align-top">
                                        {category.name}
                                    </TableCell>
                                ) : null}

                                <TableCell className="px-4 py-2 border">{item.name}</TableCell>

                                <TableCell className="px-4 py-2 border text-center">
                                    {item.need_summary_report ? (
                                        generatingIndex === item.id ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <label className="text-sm font-medium">Generating...</label>
                                                    <span className="text-sm text-muted-foreground">{progress}%</span>
                                                </div>
                                                <Progress value={progress} className="h-2 bg-blue-100">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </Progress>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => generateSummaryReport(item.id)}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    View Report
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => downloadSummaryReport(item.id)}
                                                    className="text-xs px-3 py-1"
                                                >
                                                    Download Report
                                                </Button>
                                            </div>
                                        )
                                    ) : (
                                        <span className="text-gray-500">Not Required</span>
                                    )}
                                </TableCell>

                                <TableCell className="px-4 py-2 text-center border">
                                    {item.need_support_doc ? (
                                        <div className="flex flex-col items-center gap-2">
                                            {item.suppport_doc_file?.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {item.suppport_doc_file.map((file, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <a
                                                                href={URL.createObjectURL(file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 underline"
                                                            >
                                                                {file.name}
                                                            </a>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-600"
                                                                onClick={() => {
                                                                    const updatedFiles = item.suppport_doc_file!.filter((_, i) => i !== idx);
                                                                    item.suppport_doc_file = updatedFiles.length ? updatedFiles : null;
                                                                    updateFields({ category_ids: [...category_ids] }); // trigger re-render
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">No Files</span>
                                            )}

                                            <div>
                                                <input
                                                    type="file"
                                                    id={`fileInput-${category.id}-${item.id}`}
                                                    className="hidden"
                                                    multiple
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            const newFiles = Array.from(e.target.files);
                                                            item.suppport_doc_file = [...(item.suppport_doc_file || []), ...newFiles];
                                                            updateFields({ category_ids: [...category_ids] }); // trigger re-render
                                                            e.target.value = ""; // reset input
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`fileInput-${category.id}-${item.id}`}
                                                    className="cursor-pointer text-sm text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Upload File
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">Not Required</span>
                                    )}
                                </TableCell>

                                <TableCell className="px-4 py-2 text-center border">
                                    {item.need_appendix ? (
                                        <div className="flex flex-col items-center gap-2">
                                            {item.appendix_file?.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {item.appendix_file.map((file, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <a
                                                                href={URL.createObjectURL(file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 underline"
                                                            >
                                                                {file.name}
                                                            </a>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-600"
                                                                onClick={() => {
                                                                    const updatedFiles = item.appendix_file!.filter((_, i) => i !== idx);
                                                                    item.appendix_file = updatedFiles.length ? updatedFiles : null;
                                                                    updateFields({ category_ids: [...category_ids] }); // trigger re-render
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">No Files</span>
                                            )}

                                            <div>
                                                <input
                                                    type="file"
                                                    id={`appendixInput-${category.id}-${item.id}`}
                                                    className="hidden"
                                                    multiple
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            const newFiles = Array.from(e.target.files);
                                                            item.appendix_file = [...(item.appendix_file || []), ...newFiles];
                                                            updateFields({ category_ids: [...category_ids] }); // trigger re-render
                                                            e.target.value = ""; // reset input
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`appendixInput-${category.id}-${item.id}`}
                                                    className="cursor-pointer text-sm text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                                                >
                                                    Upload File
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">Not Required</span>
                                    )}
                                </TableCell>

                                <TableCell className="px-4 py-2 border">
                                    <Textarea
                                        placeholder="Enter remark..."
                                        value={item.remark}
                                        onChange={(e) => {
                                            item.remark = e.target.value;
                                            updateFields({
                                                category_ids: [...category_ids],
                                            });
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>

            </Table>
        </div>
    );
}