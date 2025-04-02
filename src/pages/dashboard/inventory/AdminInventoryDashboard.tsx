import { InventoryDetailsList } from "@/components/inventory/InventoryDetailsList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const AdminInventoryDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
          </div>
        </div>
        <InventoryDetailsList />
      </div>
    </DashboardLayout>
  );
};

export default AdminInventoryDashboard;
