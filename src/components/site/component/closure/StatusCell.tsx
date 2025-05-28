import React from "react";
import { Badge } from "../../../ui/badge";

interface StatusCellProps {
  item: any;
}

const StatusCell: React.FC<StatusCellProps> = ({ item }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "pending approval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getStatusColor(
        item.nd_closure_status?.name
      )} border-0 font-medium`}
    >
      {item.nd_closure_status?.name || "Unknown"}
    </Badge>
  );
};

export default StatusCell;
