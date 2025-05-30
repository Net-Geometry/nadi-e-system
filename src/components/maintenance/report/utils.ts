import { MaintenanceDocketType } from "@/types/maintenance";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

export function footerNadiDocs(doc: jsPDF, date: Date) {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  const leftText = "This document is system-generated from NADI e-System.";
  const rightText = "Generated on " + format(date, "dd/MM/yyyy hh:mm:ss a");

  doc.setFont("Verdana", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100);

  doc.text(leftText, 15, pageHeight - 15);

  const rightTextWidth = doc.getTextWidth(rightText);
  const rightTextX = pageWidth - 15 - rightTextWidth;

  doc.text(rightText, rightTextX, pageHeight - 15);
}

export async function headerNadiDocs(doc: jsPDF) {
  const getBase64Image = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const [mcmcLogo, imageB] = await Promise.all([
    getBase64Image(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/MCMC_Logo.png/1088px-MCMC_Logo.png"
    ),
    getBase64Image("https://picsum.photos/200?random=2"),
  ]);

  doc.addImage(mcmcLogo, "JPEG", 15, 10, 30, 30);
  doc.addImage(imageB, "JPEG", 165, 10, 30, 30);

  doc.setFont("VerdanaBd", "bold");
  doc.setFontSize(12);
  doc.text("THE NATIONAL INFORMATION", 105, 25, { align: "center" });
  doc.text("DISSEMINATION CENTRE (NADI)", 105, 30, { align: "center" });
}

export const generateDocketNumber = (
  type: MaintenanceDocketType,
  now: Date,
  formData?: FormData,
  maintenanceTypeId?: number
) => {
  /**
   * Docket number generation
   * Format: XYYYYMMDDHHMMSSTT
   *
   * X: 1 -> cm, 2 -> pm
   * YYYY: year
   * MM: month
   * DD: day
   * HH: hour
   * MM: minute
   * SS: second
   * TT: type_id
   */

  const maintenanceType =
    maintenanceTypeId ?? Number(formData?.get("maintenanceType"));

  const docketNumber =
    (type === MaintenanceDocketType.Corrective ? "1" : "2") +
    now.getFullYear() +
    ("0" + (now.getMonth() + 1)).slice(-2) +
    ("0" + now.getDate()).slice(-2) +
    ("0" + now.getHours()).slice(-2) +
    ("0" + now.getMinutes()).slice(-2) +
    ("0" + now.getSeconds()).slice(-2) +
    ("0" + Number(maintenanceType ?? "")).slice(-2);

  return docketNumber;
};
