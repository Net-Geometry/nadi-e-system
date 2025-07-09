import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Download, Trash2, Loader2 } from "lucide-react";
import { Progress } from "@radix-ui/react-progress";
import { Textarea } from "@/components/ui/textarea";
import useClaimCategorySimple from "../../hook/use-claim-categoy-simple";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { updateClaimReport, updateRemark, uploadAttachment } from "../../tp/hooks/edit-reports-claim";
import { deleteAttachment } from "../../hook/upload-attachment";
import { PDFDocument } from "pdf-lib";
import FrontPage from "../../template/component/FrontPage";
import Appendix from "../../template/component/Appendix";
import { generateReportByItemId } from "../../hook/getGenerateReport";


interface ReportEditTabProps {
    claimData: any;
    onDataChange: (hasChanges: boolean) => void;
    refetch: () => void;
}

const ReportEditTab: React.FC<ReportEditTabProps> = ({ claimData, onDataChange, refetch }) => {
    const { categories } = useClaimCategorySimple();
    const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progressAll, setProgressAll] = useState(0);

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    // Helper function to map claimData.requests to category_ids format
    const mapRequestsToCategoryIds = (requests: any[], categories: any[]) => {
        return requests.map(request => {
            // Find the category from the categories list to get the name
            const categoryInfo = categories.find(cat => cat.id === request.id);

            return {
                id: request.id,
                name: request.name,
                item_ids: request.items.map((requestItem: any) => ({
                    id: requestItem.item.id,
                    request_id: requestItem.id,
                    name: requestItem.item.name,
                    need_support_doc: requestItem.item.need_support_doc,
                    need_summary_report: requestItem.item.need_summary_report,
                    need_appendix: requestItem.item.need_appendix,
                    site_ids: requestItem.item.site_ids,
                    remark: requestItem.item.remark,
                    suppport_doc_file: requestItem.item.suppport_doc_file,
                    summary_report_file: requestItem.item.summary_report_file,
                    appendix_file: requestItem.item.appendix_file
                }))
            };
        });
    };

    const [formData, setFormData] = useState({
        category_ids: [] as any[], // Will be populated from requests
    });

    const [originalData, setOriginalData] = useState({
        category_ids: [] as any[],
    });

    // Initialize formData and originalData when categories are loaded
    useEffect(() => {
        if (categories.length > 0 && claimData.requests) {
            const mappedCategoryIds = mapRequestsToCategoryIds(claimData.requests, categories);

            setFormData(prev => ({
                ...prev,
                category_ids: mappedCategoryIds
            }));

            // Update originalData as well for comparison
            setOriginalData({
                category_ids: mappedCategoryIds
            });
        }
    }, [categories, claimData.requests]);

    // Check if form data has changed
    useEffect(() => {
        const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
        onDataChange(hasChanges);
    }, [formData, originalData, onDataChange]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateReportForItem = async (itemId: number) => {
        let targetItem = null;
        let categoryIndex = -1;
        let itemIndex = -1;

        // Find the category and item in formData
        for (let i = 0; i < formData.category_ids.length; i++) {
            const category = formData.category_ids[i];
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
        const category = formData.category_ids[categoryIndex];
        const firstTrueItem = category.item_ids.find((itm) => itm.need_summary_report);
        const firstTrueItemId = firstTrueItem?.id;

        const reportData = {
            claimType: claimData.claim_type,
            quater: String(claimData.quarter),
            startDate: claimData.start_date,
            endDate: claimData.end_date,
            tpFilter: claimData.tp_dusp_id.id,
            phaseFilter: claimData.phase_id.id,
            duspFilter: claimData.tp_dusp_id.parent_id.id,
            dusplogo: claimData.tp_dusp_id.parent_id.logo_url,
            nadiFilter: targetItem.site_ids,
            header: itemId === firstTrueItemId,
        };

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
        while (newProgress <= 80) {
            const increment = Math.floor(Math.random() * 10) + 39;
            newProgress = Math.min(newProgress + increment, 100);
            setProgress(newProgress);
            if (newProgress > 80) break;
            await new Promise(resolve => setTimeout(resolve, 500));
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
            await new Promise(resolve => setTimeout(resolve, 500));
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
            console.error('Error downloading report:', error);
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

            // Simulate progress
            let newProgress = 0;
            const totalCategories = formData.category_ids.length;
            const num1 = Math.floor(totalCategories * 0.8);
            const num2 = totalCategories - num1;

            const increment1 = num1 === 0 ? 0 : 80 / num1;
            const increment2 = num2 === 0 ? 0 : 20 / num2;

            // Generate and add summary reports with supporting documents
            for (const category of formData.category_ids) {
                for (const item of category.item_ids) {
                    if (item.need_summary_report) {
                        setProgressAll(Math.min(newProgress, 80));
                        newProgress += increment1;

                        const reportFile = await generateReportForItem(item.id);

                        if (reportFile) {
                            const reportBytes = await reportFile.arrayBuffer();
                            const reportPdf = await PDFDocument.load(reportBytes);
                            const reportPages = await pdfDoc.copyPages(reportPdf, reportPdf.getPageIndices());
                            reportPages.forEach((page) => pdfDoc.addPage(page));
                        }

                        // Add supporting documents for this item right after its summary report

                    }
                }
            }

            // Add all appendix after items
            for (const category of formData.category_ids) {
                for (const item of category.item_ids) {
                    if (item.appendix_file?.length > 0) {
                        setProgressAll(Math.min(newProgress, 100));
                        newProgress += increment2;

                        // Handle both File objects and existing files with paths
                        const fileAttachments = [];
                        const pathAttachments = [];

                        for (const file of item.appendix_file) {
                            if (file instanceof File) {
                                fileAttachments.push({
                                    file: file,
                                    name: file.name,
                                    description: `Appendix for ${item.name}`,
                                });
                            } else if (file.file_path) {
                                pathAttachments.push({
                                    path: file.file_path,
                                    description: `Appendix for ${item.name}`,
                                });
                            }
                        }

                        let appendixFile = null;

                        if (pathAttachments.length > 0) {
                            // Use Appendix for file paths
                            appendixFile = await Appendix({
                                appendixNumber: "APPENDIX",
                                title: item.name,
                                attachments: pathAttachments,
                            });
                        }

                        if (appendixFile) {
                            const appendixBytes = await appendixFile.arrayBuffer();
                            const appendixPdf = await PDFDocument.load(appendixBytes);
                            const appendixPages = await pdfDoc.copyPages(appendixPdf, appendixPdf.getPageIndices());
                            appendixPages.forEach((page) => pdfDoc.addPage(page));
                        }
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
    const handleSave = async () => {
        setLoading(true);
        try {
            // Step 1: Update claim report
            await updateClaimReport(claimData.id);

            // Step 2: Update remarks for all items
            for (const category of formData.category_ids) {
                for (const item of category.item_ids) {
                    await updateRemark(item.request_id, item.remark || "");
                }
            }

            // Step 3: Handle file deletions - compare original vs current and delete missing files
            for (let categoryIndex = 0; categoryIndex < originalData.category_ids.length; categoryIndex++) {
                const originalCategory = originalData.category_ids[categoryIndex];
                const formCategory = formData.category_ids.find(cat => cat.id === originalCategory.id);

                if (!formCategory) continue;

                for (let itemIndex = 0; itemIndex < originalCategory.item_ids.length; itemIndex++) {
                    const originalItem = originalCategory.item_ids[itemIndex];
                    const formItem = formCategory.item_ids.find(itm => itm.id === originalItem.id);

                    if (!formItem) continue;

                    // Check for deleted support documents
                    if (originalItem.suppport_doc_file?.length > 0) {
                        for (const originalFile of originalItem.suppport_doc_file) {
                            // Check if this file exists in current form data
                            const fileStillExists = formItem.suppport_doc_file?.some(
                                (formFile: any) => formFile.id === originalFile.id
                            );

                            if (!fileStillExists && originalFile.id) {
                                await deleteAttachment(originalFile.id);
                            }
                        }
                    }

                    // Check for deleted appendix files
                    if (originalItem.appendix_file?.length > 0) {
                        for (const originalFile of originalItem.appendix_file) {
                            // Check if this file exists in current form data
                            const fileStillExists = formItem.appendix_file?.some(
                                (formFile: any) => formFile.id === originalFile.id
                            );

                            if (!fileStillExists && originalFile.id) {
                                await deleteAttachment(originalFile.id);
                            }
                        }
                    }
                }
            }

            // Step 4: Upload new support documents
            for (const category of formData.category_ids) {
                for (const item of category.item_ids) {
                    if (item.suppport_doc_file?.length > 0) {
                        for (const file of item.suppport_doc_file) {
                            // Only upload if it's a File object (new file), not an existing one with id
                            if (file instanceof File) {
                                await uploadAttachment(
                                    file,
                                    claimData.tp_dusp_id,
                                    claimData.year,
                                    claimData.ref_no,
                                    item.request_id,
                                    1 // claimTypeId for supporting document
                                );
                            }
                        }
                    }
                }
            }

            // Step 5: Upload new appendix files
            for (const category of formData.category_ids) {
                for (const item of category.item_ids) {
                    if (item.appendix_file?.length > 0) {
                        for (const file of item.appendix_file) {
                            // Only upload if it's a File object (new file), not an existing one with id
                            if (file instanceof File) {
                                await uploadAttachment(
                                    file,
                                    claimData.tp_dusp_id,
                                    claimData.year,
                                    claimData.ref_no,
                                    item.request_id,
                                    4 // claimTypeId for appendix
                                );
                            }
                        }
                    }
                }
            }

            // Success feedback
            toast({
                title: "Success",
                description: "Changes saved successfully!",
            });

            // Refresh data
            queryClient.invalidateQueries({ queryKey: ["fetchClaimById"] });

            // Reset changes state
            onDataChange(false);

            // Update originalData to match current formData (after successful save)
            refetch();

        } catch (error) {
            console.error("Error saving changes:", error);
            toast({
                title: "Error",
                description: "Failed to save changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData(originalData);
        onDataChange(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Edit Claim Application (Draft)</h2>
                <div className="space-x-2">
                    <Button variant="outline" onClick={handleReset}>
                        Revert
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </div>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </div>

            {/* <pre>{JSON.stringify(claimData.requests, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(formData.category_ids, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(originalData.category_ids, null, 2)}</pre> */}

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
                    disabled={isDownloading || formData.category_ids.length === 0}
                    className="flex items-center gap-2"
                >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Generating Combined Report...' : 'Download All Combined Report'}
                </Button>
            </div>

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
                    {formData.category_ids.map((category) =>
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
                                                                href={file.file_path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 underline"
                                                            >
                                                                View File {idx + 1}
                                                            </a>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-600"
                                                                onClick={() => {
                                                                    const updatedCategoryIds = formData.category_ids.map(cat =>
                                                                        cat.id === category.id
                                                                            ? {
                                                                                ...cat,
                                                                                item_ids: cat.item_ids.map(itm =>
                                                                                    itm.id === item.id
                                                                                        ? {
                                                                                            ...itm,
                                                                                            suppport_doc_file: itm.suppport_doc_file?.filter((_, i) => i !== idx)
                                                                                        }
                                                                                        : itm
                                                                                )
                                                                            }
                                                                            : cat
                                                                    );
                                                                    handleInputChange('category_ids', updatedCategoryIds);
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
                                                            const updatedCategoryIds = formData.category_ids.map(cat =>
                                                                cat.id === category.id
                                                                    ? {
                                                                        ...cat,
                                                                        item_ids: cat.item_ids.map(itm =>
                                                                            itm.id === item.id
                                                                                ? {
                                                                                    ...itm,
                                                                                    suppport_doc_file: [...(itm.suppport_doc_file || []), ...newFiles]
                                                                                }
                                                                                : itm
                                                                        )
                                                                    }
                                                                    : cat
                                                            );
                                                            handleInputChange('category_ids', updatedCategoryIds);
                                                            e.target.value = "";
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
                                                                href={file.file_path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 underline"
                                                            >
                                                                View File {idx + 1}
                                                            </a>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-red-600"
                                                                onClick={() => {
                                                                    const updatedCategoryIds = formData.category_ids.map(cat =>
                                                                        cat.id === category.id
                                                                            ? {
                                                                                ...cat,
                                                                                item_ids: cat.item_ids.map(itm =>
                                                                                    itm.id === item.id
                                                                                        ? {
                                                                                            ...itm,
                                                                                            appendix_file: itm.appendix_file?.filter((_, i) => i !== idx)
                                                                                        }
                                                                                        : itm
                                                                                )
                                                                            }
                                                                            : cat
                                                                    );
                                                                    handleInputChange('category_ids', updatedCategoryIds);
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
                                                            const updatedCategoryIds = formData.category_ids.map(cat =>
                                                                cat.id === category.id
                                                                    ? {
                                                                        ...cat,
                                                                        item_ids: cat.item_ids.map(itm =>
                                                                            itm.id === item.id
                                                                                ? {
                                                                                    ...itm,
                                                                                    appendix_file: [...(itm.appendix_file || []), ...newFiles]
                                                                                }
                                                                                : itm
                                                                        )
                                                                    }
                                                                    : cat
                                                            );
                                                            handleInputChange('category_ids', updatedCategoryIds);
                                                            e.target.value = "";
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
                                        value={item.remark || ""}
                                        onChange={(e) => {
                                            const updatedCategoryIds = formData.category_ids.map(cat =>
                                                cat.id === category.id
                                                    ? {
                                                        ...cat,
                                                        item_ids: cat.item_ids.map(itm =>
                                                            itm.id === item.id
                                                                ? {
                                                                    ...itm,
                                                                    remark: e.target.value
                                                                }
                                                                : itm
                                                        )
                                                    }
                                                    : cat
                                            );
                                            handleInputChange('category_ids', updatedCategoryIds);
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
};

export default ReportEditTab;