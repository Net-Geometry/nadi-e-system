import { DashboardLayout } from "@/components/layout/DashboardLayout";
import SiteDetail from "@/components/site/SiteDetail";
import { useSiteProfileId } from "@/hooks/use-site-profile-id";
import { useUserMetadata } from "@/hooks/use-user-metadata";

const Site = () => {
  const siteId = useSiteProfileId();

  if (!siteId) {
    return (
      <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
    );
  }

  return (
      <SiteDetail siteId={siteId} />
  );
};

export default Site;
