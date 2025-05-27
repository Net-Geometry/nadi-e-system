import React, { useEffect } from "react";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { useSiteProfilesByIds } from "./hooks/use-generate-claim-report";

type ItemData = {
  id: number;
  name: string;
  need_summary_report: boolean;
  summary_report_file: File | null;
  site_ids: number[];
};

type CategoryData = {
  id: number;
  name: string;
  item_ids: ItemData[];
};

type ClaimData = {
  category_ids: CategoryData[];
};

type ClaimReportGeneratorProps = {
  site_profile_ids: number[];
  category_ids: CategoryData[];
  onReportsGenerated: (reports: { item_name: string; report_file: File }[]) => void;
};

export function ClaimReportGenerator({
  site_profile_ids,
  category_ids,
  onReportsGenerated,
}: ClaimReportGeneratorProps) {
  const { siteProfiles, isLoading, error } = useSiteProfilesByIds(site_profile_ids);

  useEffect(() => {
    if (!siteProfiles || isLoading || error) return;

    const generateDummyReports = async () => {
      const reports: { item_name: string; report_file: File }[] = [];

      for (const category of category_ids) {
        for (const item of category.item_ids) {
          if (item.need_summary_report) {
            const doc = new jsPDF();

            // Add a title for the item
            doc.text(`Summary Report for ${item.name}`, 14, 20);

            // Define table columns and rows
            const tableColumn = ["Full Name", "Ref ID (MCMC)", "Ref ID (TP)", "Active"];
            const tableRows = siteProfiles.map((profile) => [
              profile.fullname,
              profile.refid_mcmc,
              profile.refid_tp,
              profile.is_active ? "Yes" : "No",
            ]);

            // Add the table to the PDF
            autoTable(doc, {
              head: [tableColumn],
              body: tableRows,
              startY: 30,
            });

            // Generate the PDF as a Blob
            const pdfBlob = doc.output("blob");
            const file = new File([pdfBlob], `${item.name}_Summary_Report.pdf`, {
              type: "application/pdf",
            });

            // Add the generated file to the reports array
            reports.push({
              item_name: item.name,
              report_file: file,
            });
          }
        }
      }

      // Pass the generated reports back to the parent component
      onReportsGenerated(reports);
    };

    generateDummyReports();
  }, [siteProfiles, category_ids, isLoading, error, onReportsGenerated]);

  return <p>Generating reports...</p>;
}