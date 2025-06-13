import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { useSiteManager } from "@/components/site/hook/use-site-staff";
import { Button } from "@/components/ui/button";
import "@/fonts/Verdana-normal.js";
import "@/fonts/VerdanaBd-bold.js";
import { useVendorManager } from "@/hooks/use-vendor";
import { MaintenanceRequest } from "@/types/maintenance";
import {
  footerNadiDocs,
  getBase64ImageWithSize,
  headerNadiDocs,
} from "./utils";

type MaintenanceReportProps = {
  maintenanceRequest: MaintenanceRequest;
};

const GenerateMaintenanceReportCM = ({
  maintenanceRequest,
}: MaintenanceReportProps) => {
  const FONT_SIZE = 8;
  const HEADER_BG_COLOR: [number, number, number] = [220, 220, 220];

  const vendorManager = useVendorManager(maintenanceRequest?.vendor?.id);
  const siteManager = useSiteManager(maintenanceRequest?.asset?.site?.id);

  const generatePDF = async () => {
    const CURRENT_DATE = new Date();

    const doc = new jsPDF();

    await headerNadiDocs(
      doc,
      maintenanceRequest.asset?.site?.dusp_tp?.parent?.logo_url
    );
    footerNadiDocs(doc, CURRENT_DATE);

    const rows1 = [
      [
        {
          content: "CORRECTIVE MAINTENANCE SHEET",
          colSpan: 4,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: HEADER_BG_COLOR,
            font: "VerdanaBd",
          },
        },
      ],
      [
        {
          content: "SITE DETAILS",
          colSpan: 4,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: HEADER_BG_COLOR,
            font: "VerdanaBd",
          },
        },
      ],
      [
        {
          content: "SITE NAME",
          colSpan: 1,
          styles: {
            fontStyle: "bold",
            halign: "left",
            font: "VerdanaBd",
          },
        },
        {
          content: maintenanceRequest?.asset?.site?.sitename,
          colSpan: 1,
          styles: {
            fontStyle: "normal",
            halign: "left",
            font: "Verdana",
          },
        },
        {
          content: "DOCKET NO",
          colSpan: 1,
          styles: {
            fontStyle: "bold",
            halign: "left",
            font: "VerdanaBd",
          },
        },
        {
          content: maintenanceRequest?.no_docket,
          colSpan: 1,
          styles: {
            fontStyle: "normal",
            halign: "left",
            font: "Verdana",
          },
        },
      ],
      [
        {
          content: "PHASE",
          colSpan: 1,
          styles: {
            fontStyle: "bold",
            halign: "left",
            font: "VerdanaBd",
          },
        },
        {
          content: maintenanceRequest?.asset?.site?.nd_phases?.name,
          colSpan: 1,
          styles: {
            fontStyle: "normal",
            halign: "left",
            font: "Verdana",
          },
        },
        {
          content: "DOCKET DATE/TIME",
          colSpan: 1,
          styles: {
            fontStyle: "bold",
            halign: "left",
            font: "VerdanaBd",
          },
        },
        {
          content: format(
            maintenanceRequest?.created_at,
            "dd/MM/yyyy hh:mm:ss a"
          ),
          colSpan: 1,
          styles: {
            fontStyle: "normal",
            halign: "left",
            font: "Verdana",
          },
        },
      ],
      [
        {
          content: "FAULTY CATEGORY",
          styles: {
            fontStyle: "bold",
            halign: "left",
            font: "VerdanaBd",
          },
        },
        {
          content: "CEILING SURFING AREA MELENGKUNG & REPAINT DINDING (MERAH)",
          colSpan: 3,
          styles: {
            fontStyle: "normal",
            halign: "left",
            font: "Verdana",
          },
        },
      ],
      [
        {
          content: "FAULTY DESCRIPTION",
          styles: {
            fontStyle: "bold",
            halign: "left",
            font: "VerdanaBd",
          },
        },
        {
          content: "CEILING SURFING AREA MELENGKUNG & REPAINT DINDING (MERAH)",
          colSpan: 3,
          styles: {
            fontStyle: "normal",
            halign: "left",
            font: "Verdana",
          },
        },
      ],
    ];

    autoTable(doc, {
      startY: 50,
      body: rows1,
      theme: "grid",
      styles: {
        fontSize: FONT_SIZE,
        cellPadding: 2,
        valign: "middle",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      margin: { left: 15, right: 15 },
    });

    const rows2 = [
      [
        {
          content: "VENDOR ACTION",
          colSpan: 2,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: HEADER_BG_COLOR,
            font: "VerdanaBd",
          },
        },
      ],
      [
        {
          content: "ACTION DATE/TIME",
        },
        {
          content: "20/12/2024",
        },
      ],
      [
        {
          content: "ACTUAL FAULT",
        },
        {
          content: "",
        },
      ],
      [
        {
          content: "RESTORATION ACTION",
          styles: {
            minCellHeight: 20,
            valign: "top",
          },
        },
        {
          content: "REPAINT (MERAH) & MENGIKAT SEMULA SYILING YANG MELENGKUNG",
          styles: {
            minCellHeight: 20,
            valign: "top",
          },
        },
      ],
      [
        {
          content: "RESTORATION STATUS",
        },
        {
          content: "",
        },
      ],
      [
        {
          content: "NEW ACTION TAKEN",
        },
        {
          content: "",
        },
      ],
      [
        {
          content: "COMMENT / CONCLUSION",
          styles: {
            minCellHeight: 30,
            valign: "top",
          },
        },
        {
          content: "",
          styles: {
            minCellHeight: 30,
            valign: "top",
          },
        },
      ],
      [
        {
          content: "RECOMMENDATION (IF ANY)",
        },
        {
          content: "",
        },
      ],
    ];

    autoTable(doc, {
      startY: 100, // example Y start, adjust as needed
      body: rows2,
      theme: "grid",
      styles: {
        fontSize: FONT_SIZE,
        cellPadding: 2,
        valign: "middle",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: {
          cellWidth: "auto",
          halign: "left",
          fontStyle: "bold",
          font: "VerdanaBd",
        },
        1: {
          cellWidth: "wrap",
          halign: "left",
          fontStyle: "normal",
          font: "Verdana",
        },
      },
      tableWidth: "auto",
      didDrawCell: (data) => {
        if (data.column.index === 1 && data.row.index === 4) {
          const cellX = data.cell.x;
          const cellY = data.cell.y;
          const cellHeight = data.cell.height;

          const checkboxSize = 4;
          const checkboxX1 = cellX + 5;
          const checkboxY = cellY + (cellHeight - checkboxSize) / 2;
          const checkboxX2 = checkboxX1 + checkboxSize + 30;

          // Draw checkbox 1 (COMPLETED)
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.2);
          doc.rect(checkboxX1, checkboxY, checkboxSize, checkboxSize);

          // Draw checkbox 2 (PENDING)
          doc.rect(checkboxX2, checkboxY, checkboxSize, checkboxSize);

          const showCompletedTick = true; // change as needed
          const showPendingTick = false; // change as needed

          doc.setFont("ZapfDingbats");
          doc.setFontSize(FONT_SIZE + 4);

          if (showCompletedTick) {
            doc.text("3", checkboxX1 + 0.5, checkboxY + checkboxSize - 0.5);
          }

          if (showPendingTick) {
            doc.text("3", checkboxX2 + 0.5, checkboxY + checkboxSize - 0.5);
          }

          // Add labels
          doc.setFont("Verdana", "normal");
          doc.setFontSize(FONT_SIZE);
          doc.setTextColor(0, 0, 0);
          doc.text(
            "COMPLETED",
            checkboxX1 + checkboxSize + 5,
            checkboxY + checkboxSize - 1
          );
          doc.text(
            "PENDING",
            checkboxX2 + checkboxSize + 5,
            checkboxY + checkboxSize - 1
          );
        }
      },
    });

    // VENDOR and NADI INFORMATION
    const vendorInfoRows = [
      [
        {
          content: "VENDOR INFORMATION",
          colSpan: 2,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: HEADER_BG_COLOR,
            font: "VerdanaBd",
          },
        },
      ],
      [
        {
          content: "NAME",
        },
        {
          content: vendorManager?.fullname.toUpperCase(),
        },
      ],
      [
        {
          content: "COMPANY",
        },
        {
          content: maintenanceRequest?.vendor?.business_name,
        },
      ],
      [
        {
          content: "CONTACT NO.",
        },
        {
          content: maintenanceRequest?.vendor?.phone_number,
        },
      ],
      [
        {
          content: "DATE",
        },
        {
          content: "01 JAN 2025",
        },
      ],
      [
        {
          content: "SIGN & STAMP",
        },
        {
          content: "",
          styles: {
            minCellHeight: 35,
          },
        },
      ],
    ];

    const nadiInfoRows = [
      [
        {
          content: "NADI INFORMATION",
          colSpan: 2,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fillColor: HEADER_BG_COLOR,
            font: "VerdanaBd",
          },
        },
      ],
      [
        {
          content: "NAME",
        },
        {
          content: siteManager?.nd_staff_profile?.fullname.toUpperCase(),
        },
      ],
      [
        {
          content: "DESIGNATION",
        },
        {
          content: "MANAGER",
        },
      ],
      [
        {
          content: "CONTACT NO.",
        },
        {
          content: siteManager?.nd_staff_profile?.mobile_no,
        },
      ],
      [
        {
          content: "DATE",
        },
        {
          content: "01 JAN 2025",
        },
      ],
      [
        {
          content: "SIGN & STAMP",
        },
        {
          content: "",
          styles: {
            minCellHeight: 35,
          },
        },
      ],
    ];

    // 1. VENDOR INFORMATION
    autoTable(doc, {
      startY: 200,
      margin: { left: 15 },
      body: vendorInfoRows,
      theme: "grid",
      tableWidth: 87,
      styles: {
        fontSize: FONT_SIZE,
        cellPadding: 2,
        valign: "middle",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      columnStyles: {
        0: {
          cellWidth: 30,
          halign: "left",
          fontStyle: "bold",
          font: "VerdanaBd",
          fillColor: HEADER_BG_COLOR,
        },
        1: {
          cellWidth: "wrap",
          halign: "left",
          fontStyle: "normal",
          font: "Verdana",
        },
      },
      didDrawPage: (data) => {
        // 2. NADI INFORMATION
        autoTable(doc, {
          startY: 200,
          margin: { left: 108 },
          body: nadiInfoRows,
          theme: "grid",
          tableWidth: 87,
          styles: {
            fontSize: FONT_SIZE,
            cellPadding: 2,
            valign: "middle",
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.3,
          },
          columnStyles: {
            0: {
              cellWidth: 30,
              halign: "left",
              fontStyle: "bold",
              font: "VerdanaBd",
              fillColor: HEADER_BG_COLOR,
            },
            1: {
              cellWidth: "wrap",
              halign: "left",
              fontStyle: "normal",
              font: "Verdana",
            },
          },
        });
      },
    });

    // add Page 2
    doc.addPage();

    footerNadiDocs(doc, CURRENT_DATE);

    autoTable(doc, {
      startY: 10,
      body: [
        [
          {
            content: "APPENDIX",
            styles: {
              halign: "center",
              fontStyle: "bold",
              fillColor: HEADER_BG_COLOR,
              font: "VerdanaBd",
            },
          },
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: FONT_SIZE,
        cellPadding: 2,
        valign: "middle",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      margin: { left: 15, right: 15 },
      tableWidth: "auto",
    });

    const appendixRows: unknown[] = [];
    const imageCache: Record<
      number,
      { dataUrl: string; width: number; height: number }
    > = {};
    const rowHeights: number[] = [];

    if (maintenanceRequest?.updates?.length > 0) {
      for (let i = 0; i < maintenanceRequest.updates.length; i++) {
        const update = maintenanceRequest.updates[i];

        if (update.attachment) {
          try {
            const imageData = await getBase64ImageWithSize(update.attachment);
            const drawWidth = 85 - 4;
            const scaledHeight =
              (imageData.height / imageData.width) * drawWidth;

            imageCache[i] = imageData;
            rowHeights[i] = scaledHeight + 8; // add small buffer for padding
          } catch (e) {
            imageCache[i] = undefined;
            rowHeights[i] = 50;
          }
        } else {
          imageCache[i] = undefined;
          rowHeights[i] = 50;
        }
        appendixRows.push([
          `${i + 1}.`,
          {
            content: "",
            styles: {
              minCellHeight: rowHeights[i],
            },
          },
          update.description || "No description",
        ]);
      }
    } else {
      appendixRows.push(["1.", "", ""]);
      appendixRows.push(["2.", "", ""]);
      appendixRows.push(["3.", "", ""]);
    }

    autoTable(doc, {
      startY: 20,
      head: [["NO.", "PICTURE", "REMARKS"]],
      body: appendixRows,
      theme: "grid",
      styles: {
        fontSize: FONT_SIZE,
        font: "Verdana",
        cellPadding: 2,
        valign: "middle",
        halign: "center",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      headStyles: {
        font: "VerdanaBd",
        fontStyle: "bold",
        fillColor: HEADER_BG_COLOR,
      },
      bodyStyles: {
        minCellHeight: 50,
      },
      margin: { left: 15, right: 15 },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 85 },
        2: { cellWidth: 85 },
      },
      didDrawCell: (data) => {
        const columnIndex = data.column.index;
        const rowIndex = data.row.index;

        if (data.section === "body" && columnIndex === 1) {
          const imageData = imageCache[rowIndex];
          if (!imageData) return;

          const { dataUrl, width: imgWidth, height: imgHeight } = imageData;

          const padding = 4;
          const targetWidth = 85 - padding;
          const aspectRatio = imgHeight / imgWidth;

          const drawWidth = targetWidth;
          const drawHeight = drawWidth * aspectRatio;

          const x = data.cell.x + (data.cell.width - drawWidth) / 2;
          const y = data.cell.y + (data.cell.height - drawHeight) / 2;

          try {
            doc.addImage(dataUrl, "JPEG", x, y, drawWidth, drawHeight);
          } catch (err) {
            console.warn(`Image rendering failed at row ${rowIndex + 1}:`, err);
          }
        }
      },
    });

    doc.save(`CM Report - ${maintenanceRequest?.no_docket}.pdf`);
  };

  return (
    <Button type="button" className="w-full" onClick={generatePDF}>
      Generate Report
    </Button>
  );
};

export default GenerateMaintenanceReportCM;
