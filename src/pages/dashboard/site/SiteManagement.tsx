import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import SiteDashboard from "./SiteDashboard";
import SiteDetail from "@/components/site/SiteDetail";
import NoAccess from "@/pages/NoAccess";

const SiteManagement = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;
  const userType = parsedMetadata?.user_type;
  const siteId = parsedMetadata?.group_profile?.site_profile_id;
  // UserGroup: 1 = DUSP
  // UserGroup: 2 = MCMC
  // UserGroup: 3 = TP
  // UserGroup: 4 = SSO
  // UserGroup: 5 = Vendor
  // UserGroup: 6 = Staff
  // UserGroup: 7 = Member
  // UserGroup: 9 = Site
  // UserType: "super_admin" = Super Admin

  if (userType === "super_admin") {
    // Super Admin
    return (
      <div>
        <SiteDashboard />
      </div>
    );
  }

  if (!userGroup) {
    return (
      <div>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (userGroup === 1) {
    // DUSP
    return (
      <div>
        <SiteDashboard />
      </div>
    );
  }

  if (userGroup === 2) {
    // MCMC
    return (
      <div>
        <SiteDashboard />
      </div>
    );
  }

  if (userGroup === 3) {
    // TP
    return (
      <div>
        <SiteDashboard />
      </div>
    );
  }

  if (userGroup === 4) {
    // SSO
    return <SiteDashboard />;
  }

  if (userGroup === 5) {
    // Vendor
    return <NoAccess />;
  }

  if (userGroup === 6) {
    // Staff
    return <NoAccess />;
  }

  if (userGroup === 7) {
    // Member
    return <NoAccess />;
  }

  if (userGroup === 9) {
    // Site
    return (
      <div>
        <SiteDetail siteId={siteId} />
      </div>
    );
  }

  return <NoAccess />;
};

export default SiteManagement;
