
import {
  LayoutDashboard,
  Users,
  Settings,
  MessageSquare,
  Wallet,
  FileCheck,
  Briefcase,
  ShoppingCart,
  Box,
  DollarSign,
  List,
  ChartBar,
  LucideIcon,
  Building2,
  GitBranch,
  CheckSquare,
  BarChart,
  Shield,
} from "lucide-react";

export const getAccordionIcon = (label: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    "Admin Console": Shield,
    "Member Management": Users,
    "Service Module": Settings,
    "Community": MessageSquare,
    "Financial": Wallet,
    "Compliance": FileCheck,
    "HR Management": Briefcase,
    "POS Management": ShoppingCart,
    "Asset Management": Box,
    "Finance Management": DollarSign,
    "Programmes Management": List,
    "Report Management": ChartBar,
    "Site Management": Building2,
    "Workflow Management": GitBranch,
  };
  return iconMap[label] || LayoutDashboard;
};
