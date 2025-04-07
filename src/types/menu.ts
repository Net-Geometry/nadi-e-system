import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
}

export interface MenuGroup {
  label: string;
  route: string;
  items: MenuItem[];
}