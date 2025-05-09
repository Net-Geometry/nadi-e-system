import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProfileHeader } from "@/components/profile/components/ProfileHeader";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import BillingOverview from "@/components/site/billing/hook/BillingOverview";

const UtilitiesBilling = () => {
    const userMetadata = useUserMetadata();
    const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
    const userGroup = parsedMetadata?.user_group;
    const userType = parsedMetadata?.user_type;

    if (userGroup === 3 || userGroup === 1 || userGroup === 6 || userType === "super_admin") {
        return (
            <DashboardLayout>
                <BillingOverview/>
            </DashboardLayout>
        );
    }


    if (userGroup === 2 || userGroup === 4 || userGroup === 5 || userGroup === 7) { // MCMC, SSO, Vendor, STAFF, MEMBER
        return (
            <DashboardLayout>
                <div className="space-y-8">
                    <p>You have no permission to this page</p>
                </div>
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

export default UtilitiesBilling;