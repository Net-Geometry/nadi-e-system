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
import { sidebarStyles, iconColors } from "@/utils/sidebar-styles";
import { SidebarItem } from "./SidebarItem";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronRight } from "lucide-react";

interface SidebarAccordionProps {
  label: string;
  items: MenuItem[];
}

export const SidebarAccordion = ({ label, items }: SidebarAccordionProps) => {
  const location = useLocation();
  const { state, isMobile } = useSidebar();
  const isActive = items.some((item) =>
    location.pathname.startsWith(item.path)
  );
  const isActiveExact = items.some((item) => location.pathname === item.path);
  const AccordionIcon = getAccordionIcon(label);
  const isCollapsed = state === "collapsed" && !isMobile;

  // Get the color for this accordion from our iconColors map
  const iconColor = iconColors[label as keyof typeof iconColors] || "#6E41E2";

  // If sidebar is collapsed and not mobile, render a simpler version
  if (isCollapsed) {
    return (
      <div className="mb-2 relative group">
        <div
          className={cn(
            sidebarStyles.collapsedIconWrapper,
            "hover:bg-gray-50 hover:scale-110 transition-transform duration-200 dark:hover:bg-gray-800/80",
            isActive && "bg-gray-50 dark:bg-gray-800/90"
          )}
        >
          <div className="relative">
            {isActive && (
              <div
                className={cn(
                  "absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full",
                  "bg-primary"
                )}
              />
            )}
            <AccordionIcon
              className={sidebarStyles.iconWrapper}
              color={iconColor}
            />
          </div>
        </div>

        {/* Floating submenu on hover */}
        <div className="absolute left-full top-0 ml-2 bg-white dark:bg-gray-900 rounded-md shadow-lg w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100 dark:border-gray-700">
          <div className="p-2 text-gray-700 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700">
            {label}
          </div>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                path={item.path}
                icon={item.icon}
                isCollapsed={false}
                iconColor={iconColor}
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
      <AccordionItem
        value={label}
        className={cn(
          "border-none",
          isActive && sidebarStyles.accordionWrapper
        )}
      >
        <AccordionTrigger
          className={cn(
            sidebarStyles.accordionTrigger,
            "hover:scale-105 transition-transform duration-200",
            isActive && sidebarStyles.accordionTriggerActive,
            isActiveExact && "text-primary"
          )}
          iconComponent={({ open }) =>
            open ? (
              <ChevronUp className="h-5 w-5 text-gray-400 dark:text-gray-300 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-300 transition-transform duration-200" />
            )
          }
        >
          <div className="flex items-center gap-3 min-w-0 w-full">
            <div className="relative">
              {isActive && (
                <div
                  className={cn(
                    "absolute -left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full",
                    "bg-primary"
                  )}
                />
              )}
              <AccordionIcon
                className={cn("h-5 w-5 flex-shrink-0")}
                color={iconColor}
              />
            </div>
            <span className="truncate flex-1 min-h-[1.25rem] leading-tight line-clamp-2">
              {label}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-1 pt-1 pl-6">
          <SidebarMenu>
            {items.map((item) => (
              <SidebarItem
                key={item.title}
                title={item.title}
                path={item.path}
                icon={item.icon}
                isCollapsed={false}
                iconColor={iconColor}
              />
            ))}
          </SidebarMenu>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
