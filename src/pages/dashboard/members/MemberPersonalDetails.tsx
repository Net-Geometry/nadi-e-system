import { DashboardLayout } from "@/components/layout/DashboardLayout";
import MemberProfileSettings from "@/components/profile/MemberProfileSettings";
import { useUserMetadata } from "@/hooks/use-user-metadata";

const MemberPersonalDetails = () => {
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const userGroup = parsedMetadata?.user_group;

  if (userGroup !== 7) {
    return <div>You do not have access to this dashboard.</div>;
  }

  return (
    <DashboardLayout>
      <MemberProfileSettings/>
    </DashboardLayout>
  );
};

export default MemberPersonalDetails;
