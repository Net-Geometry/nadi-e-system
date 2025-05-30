import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import "@/fonts/Verdana-normal.js";
import "@/fonts/VerdanaBd-bold.js";
import { MaintenanceRequest } from "@/types/maintenance";
import { footerNadiDocs, headerNadiDocs } from "./utils";

type MaintenanceReportProps = {
  maintenanceRequest: MaintenanceRequest;
};

const GenerateMaintenanceReportPM = ({
  maintenanceRequest,
}: MaintenanceReportProps) => {
  const FONT_SIZE = 8;
  const HEADER_BG_COLOR: [number, number, number] = [220, 220, 220];

  const generatePDF = async () => {
    const CURRENT_DATE = new Date();

    const doc = new jsPDF();

    await headerNadiDocs(doc);
    footerNadiDocs(doc, CURRENT_DATE);

    const rows1 = [
      [
        {
          content: "PREVENTIVE MAINTENANCE",
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
          content: "AHMAD BIN ABU",
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
          content: "NUR SITI",
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
          content: "012-3456789",
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

    footerNadiDocs(doc, CURRENT_DATE);

    autoTable(doc, {
      startY: 20,
      head: [["NO.", "PICTURE", "REMARKS"]],
      body: [
        ["1.", "", ""],
        ["2.", "", ""],
        ["3.", "", ""],
      ],
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
    });

    doc.save("all-in-one-table.pdf");
  };

  return (
    <Button type="button" className="w-full" onClick={generatePDF}>
      Generate Report
    </Button>
  );
};

export default GenerateMaintenanceReportPM;
