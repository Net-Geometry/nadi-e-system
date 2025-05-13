import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import NoAccess from "@/pages/NoAccess";
import InsuranceOverview from "@/components/site/insurance/InsuranceOverview";

const Insurance = () => {
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
        <InsuranceOverview />
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
        <InsuranceOverview />
      </DashboardLayout>
    );
  }
  
  if (userGroup === 2) { // MCMC
    return (
      <DashboardLayout>
        <InsuranceOverview />
      </DashboardLayout>
    );
  }
  
  if (userGroup === 3) { // TP
    return (
      <DashboardLayout>
        <InsuranceOverview />
      </DashboardLayout>
    );
  }

  if (userGroup === 4) { // SSO
    return (
      <NoAccess />
    );
  }

  if (userGroup === 5) { // Vendor
    return (
      <NoAccess />
    );
  }

  if (userGroup === 6) { // Staff
    return (
      <NoAccess />
    );
  }

  if (userGroup === 7) { // Member
    return (
      <NoAccess />
    );
  }

  if (userGroup === 9) { // Site
    return (
      <DashboardLayout>
        <InsuranceOverview />
      </DashboardLayout>
    );
  }

  return (
    <NoAccess />
  );
};

export default Insurance;