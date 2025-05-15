import { MaintenanceStatus, SLACategories } from "@/types/maintenance";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";

export const getMaintenanceStatusIcon = (status: MaintenanceStatus) => {
  switch (status) {
    case MaintenanceStatus.Submitted:
      return <FileText className="h-5 w-5 text-gray-500" />;
    case MaintenanceStatus.Approved:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case MaintenanceStatus.Issued:
      return <Clock className="h-5 w-5 text-blue-500" />;
    case MaintenanceStatus.InProgress:
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case MaintenanceStatus.Completed:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case MaintenanceStatus.Incompleted:
      return <XCircle className="h-5 w-5 text-red-500" />;
    case MaintenanceStatus.Rejected:
      return <XCircle className="h-5 w-5 text-red-500" />;
    case MaintenanceStatus.Deffered:
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

export const getMaintenanceStatusClass = (
  status: MaintenanceStatus
): string => {
  switch (status) {
    case MaintenanceStatus.Submitted:
      return "bg-gray-200 text-gray-900 hover:bg-gray-300";
    case MaintenanceStatus.Approved:
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case MaintenanceStatus.Issued:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case MaintenanceStatus.InProgress:
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case MaintenanceStatus.Completed:
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case MaintenanceStatus.Incompleted:
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case MaintenanceStatus.Rejected:
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case MaintenanceStatus.Deffered:
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-200 text-gray-900 hover:bg-gray-300";
  }
};

export const getSLACategoryClass = (sla: SLACategories): string => {
  switch (sla?.name) {
    case "Critical":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "High":
      return "bg-orange-200 text-orange-800 hover:bg-orange-300";
    case "Moderate":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "Low":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-200 text-gray-900 hover:bg-gray-300";
  }
};
