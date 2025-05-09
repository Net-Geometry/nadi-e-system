import { useMaintenanceQueries } from "./maintenance/use-maintenance-queries";

export const useMaintenance = () => {
  // Get all query hooks
  const {
    useMaintenanceRequestsQuery,
    useMaintenanceTypesQuery,
    useSLACategoriesQuery,
  } = useMaintenanceQueries();

  // Export everything together
  return {
    // Query hooks
    useMaintenanceRequestsQuery,
    useMaintenanceTypesQuery,
    useSLACategoriesQuery,
  };
};
