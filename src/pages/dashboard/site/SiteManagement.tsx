import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileHeader } from "@/components/profile/components/ProfileHeader";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import SiteDashboard from "./SiteDashboard";
import Site from "./Site";
import SiteDetail from "@/components/site/SiteDetail";

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



  if (userType === "super_admin") { // Super Admin
    return (
      <DashboardLayout>
        <SiteDashboard />
      </DashboardLayout>
    );
  }

  if (!userGroup) { 
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (userGroup === 1) { // DUSP
    return (
      <DashboardLayout>
        <SiteDashboard />
      </DashboardLayout>
    );
  }
  
  if (userGroup === 2) { // MCMC
    return (
      <DashboardLayout>
        <SiteDashboard />
      </DashboardLayout>
    );
  }
  
  if (userGroup === 3) { // TP
    return (
      <DashboardLayout>
        <SiteDashboard />
      </DashboardLayout>
    );
  }

  if (userGroup === 4) { // SSO
    return (
      <DashboardLayout>
        <SiteDashboard />
      </DashboardLayout>
    );
  }

  if (userGroup === 5) { // Vendor
    return (
      <DashboardLayout>
        <SiteDashboard />
      </DashboardLayout>
    );
  }

  if (userGroup === 6) { // Staff
    return (
      <DashboardLayout>
        <Site />
      </DashboardLayout>
    );
  }

  if (userGroup === 7) { // Member
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <p>You have no permission to this page</p>
        </div>
      </DashboardLayout>
    );
  }

  if (userGroup === 9) { // Site
    return (
      <DashboardLayout>
        <SiteDetail siteId={siteId} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ProfileHeader />
      <div className="space-y-8">
        <p>User type not recognized.</p>
      </div>
    </DashboardLayout>
  );
};

export default SiteManagement;