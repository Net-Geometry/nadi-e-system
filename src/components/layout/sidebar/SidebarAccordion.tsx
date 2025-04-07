
import { Link, useLocation } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SidebarMenu } from "@/components/ui/sidebar";
import { MenuItem } from "@/types/menu";
import { useSidebar } from "@/hooks/use-sidebar";
import { getAccordionIcon } from "@/utils/sidebar-icons";
import { sidebarStyles } from "@/utils/sidebar-styles";
import { SidebarItem } from "./SidebarItem";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SidebarAccordionProps {
  label: string;
  items: MenuItem[];
}

export const SidebarAccordion = ({ label, items }: SidebarAccordionProps) => {
  const location = useLocation();
  const { state, isMobile } = useSidebar();
  const isActive = items.some(item => location.pathname.startsWith(item.path));
  const AccordionIcon = getAccordionIcon(label);
  const isCollapsed = state === "collapsed" && !isMobile;

  // If sidebar is collapsed and not mobile, render a simpler version
  if (isCollapsed) {
    return (
      <div className="mb-2 relative group">
        <div 
          className={cn(
            "py-2 px-2 flex justify-center text-sm font-medium text-white rounded-md transition-all duration-200 hover:bg-white/10",
            isActive && "bg-white/20"
          )}
        >
          <AccordionIcon className={sidebarStyles.iconWrapper} />
        </div>
        
        {/* Floating submenu on hover */}
        <div className="absolute left-full top-0 ml-2 bg-[#000033] rounded-md shadow-lg w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2 text-white font-medium border-b border-white/10">{label}</div>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                path={item.path}
                icon={item.icon}
                isCollapsed={false}
              />
            ))}
          </SidebarMenu>
        </div>
      </div>
    );
  }

  // Regular accordion for expanded state or mobile
  return (
    <Accordion 
      type="single" 
      collapsible 
      className="mb-2"
      defaultValue={isActive ? label : undefined}
    >
      <AccordionItem value={label} className="border-none">
        <AccordionTrigger 
          className={cn(
            sidebarStyles.accordionTrigger,
            isActive && sidebarStyles.accordionTriggerActive
          )}
        >
          <div className="flex items-center gap-3 min-w-0 w-full justify-start">
            <AccordionIcon className={sidebarStyles.iconWrapper} />
            <span className="truncate flex-1 text-left">{label}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className={cn("pb-1 pl-11", sidebarStyles.menuContentBackground, "rounded-md my-1")}>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                path={item.path}
                icon={item.icon}
                isCollapsed={false}
                isInWhiteBackground={true}
              />
            ))}
          </SidebarMenu>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
