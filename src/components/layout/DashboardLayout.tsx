
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { state, isMobile, openMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Add body overflow class when mobile sidebar is open to prevent scrolling
  useEffect(() => {
    if (isMobile && openMobile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMobile, openMobile]);

  return (
    <SidebarProvider>
      <div className="relative min-h-screen flex w-full bg-background">
        {/* Overlay for mobile */}
        {isMobile && openMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => useSidebar().setOpenMobile(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={cn(
          "z-50",
          isMobile && "fixed"
        )}>
          <DashboardSidebar />
        </div>
        
        {/* Main content */}
        <div 
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            !isMobile && isCollapsed ? "ml-[72px]" : "",
            !isMobile && !isCollapsed ? "ml-[280px]" : "",
            isMobile ? "ml-0 w-full" : ""
          )}
        >
          <DashboardNavbar />
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <div className="container mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
