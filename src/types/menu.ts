import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  path: string;
}

export interface MenuGroup {
  label: string;
  route: string;
  items: MenuItem[];
}
