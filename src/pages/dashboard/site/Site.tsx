import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SiteDetail from "@/components/site/SiteDetail";
import { SettingsLoading } from "@/components/settings/SettingsLoading";
import { useSiteId } from "@/hooks/use-site-id";

const Site = () => {
  const siteId = useSiteId();

  if (!siteId) {
    return <SettingsLoading />;
  }

  return (
    <DashboardLayout>
      <SiteDetail siteId={siteId} />
    </DashboardLayout>
  );
};

export default Site;