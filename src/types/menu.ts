
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  path: string;
  icon?: LucideIcon;
}

export interface MenuGroup {
  label: string;
  route: string;
  items: MenuItem[];
}
