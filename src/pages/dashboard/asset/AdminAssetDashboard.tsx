import { AssetList } from "@/components/assets/AssetList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const AdminAssetDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Asset Management</h1>
          </div>
        </div>
        <AssetList />
      </div>
    </DashboardLayout>
  );
};

export default AdminAssetDashboard;
