
import React, { useRef, useEffect } from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { sidebarStyles } from "@/utils/sidebar-styles";

interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile } = useSidebar();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [resizeObserver] = React.useState(() => {
      if (typeof ResizeObserver === "undefined") return null;
      return new ResizeObserver((entries) => {
        if (!entries.length) return;
        const currentRef = sidebarRef.current;
        if (currentRef) {
          requestAnimationFrame(() => {
            if (currentRef) {
              currentRef.style.height = `${entries[0].contentRect.height}px`;
            }
          });
        }
      });
    });

    useEffect(() => {
      const sidebar = sidebarRef.current;
      if (!sidebar || !resizeObserver) return;

      resizeObserver.observe(sidebar);
      return () => {
        resizeObserver.disconnect();
      };
    }, [resizeObserver]);

    return (
      <div
        ref={(node) => {
          sidebarRef.current = node;
          if (ref) {
            if (typeof ref === "function") {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        className={cn(
          "sidebar fixed top-0 bottom-0 z-40 flex flex-col transition-all duration-300 shadow-md",
          sidebarStyles.sidebarBackground,
          side === "left" ? "left-0" : "right-0",
          state === "collapsed" && !isMobile ? "w-[72px]" : "w-[280px]",
          isMobile && "transform",
          isMobile && !openMobile && "-translate-x-full",
          isMobile && openMobile && "translate-x-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Sidebar.displayName = "Sidebar";
