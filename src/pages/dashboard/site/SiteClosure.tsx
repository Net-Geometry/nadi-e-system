import { DashboardLayout } from "@/components/layout/DashboardLayout";
import ClosurePage from "@/components/site/component/ClosurePage";
import { useUserMetadata } from "@/hooks/use-user-metadata";

const SiteClosure = () => {
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

    return(
    <DashboardLayout>
        <ClosurePage siteId={null} />
    </DashboardLayout>
    );
};


export default SiteClosure;