import React from "react";
import { Badge } from "@/components/ui/badge"; // Import Badge component

interface GeneralTabProps {
  claimData: {
    id: number;
    year: number;
    quarter: number;
    month: number;
    ref_no: string;
    date_paid: string;
    payment_status: boolean;
    claim_type: string;
    claim_status: { id: number; name: string };
    tp_dusp_id: {
      id: string;
      name: string;
      parent_id: { id: string; name: string };
    };
  };
}

const GeneralTab: React.FC<GeneralTabProps> = ({ claimData }) => {
  const {
    id,
    year,
    quarter,
    month,
    ref_no,
    date_paid,
    claim_type,
    payment_status,
    claim_status,
    tp_dusp_id,
  } = claimData;

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
      default:
        return "secondary";
    }
  };

  return (
    <div >
      <h2 className="text-lg font-bold mb-4">General Claim Information</h2>

      <table className="table-auto w-full border-collapse border border-gray-300">
        <tbody>
          {/* <tr className="border-b">
            <th className="text-left p-2 font-medium">ID</th>
            <td className="p-2">{id}</td>
          </tr> */}
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Year</th>
            <td className="p-2">{year ?? "N/A"}</td>
          </tr>
          {claim_type !== "YEARLY" && (
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Quarter</th>
              <td className="p-2">{quarter ? `Q${quarter}` : "N/A"}</td>
            </tr>
          )}
          {claim_type !== "YEARLY" && claim_type !== "QUARTERLY" && (
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Month</th>
              <td className="p-2">
                {month ? new Date(0, month - 1).toLocaleString('default', { month: 'long' }) : "N/A"}
              </td>
            </tr>
          )}
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Reference Number</th>
            <td className="p-2">{ref_no ?? "N/A"}</td>
          </tr>
          <tr className="border-b">
            <th className="text-left p-2 font-medium">TP DUSP</th>
            <td className="p-2">
              {tp_dusp_id?.name ?? "N/A"} ({tp_dusp_id?.parent_id.name ?? "N/A"})
            </td>
          </tr>
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Payment Status</th>
            <td className="p-2">
              <Badge variant={payment_status ? "success" : "warning"}>
                {payment_status ? "Paid" : "Unpaid"}
              </Badge>
            </td>
          </tr>
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Date Paid</th>
            <td className="p-2">
              {date_paid ? new Date(date_paid).toLocaleDateString() : "N/A"}
            </td>
          </tr>
          <tr className="border-b">
            <th className="text-left p-2 font-medium">Claim Status</th>
            <td className="p-2">
              <Badge variant={getStatusBadgeVariant(claim_status?.name)}>
                {claim_status?.name ?? "N/A"}
              </Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GeneralTab;