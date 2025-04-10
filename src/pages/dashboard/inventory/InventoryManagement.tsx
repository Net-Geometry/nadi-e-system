import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDashboard } from "@/hooks/use-user-dashboard";
import { AlertCircle } from "lucide-react";
import AdminInventoryDashboard from "./AdminInventoryDashboard";
import InventoryDashboard from "./InventoryDashboard";

const InventoryManagement = () => {
  const { userType, isLoading, error } = useUserDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-[250px]" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load asset management: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Render the appropriate asset management page based on user type
  if (typeof userType === "string") {
    if (userType.startsWith("tp") || userType.startsWith("staff")) {
      return <AdminInventoryDashboard />;
    }
  }

  return <InventoryDashboard />;
};

export default InventoryManagement;
