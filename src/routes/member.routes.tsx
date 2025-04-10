
import { RouteObject } from "react-router-dom";
import PersonalDetails from "@/pages/dashboard/members/PersonalDetails";
import Registration from "@/pages/dashboard/members/Registration";
import ActivityLogs from "@/pages/dashboard/members/ActivityLogs";
import MemberManagement from "@/pages/dashboard/members/MemberManagement";

export const memberRoutes: RouteObject[] = [
  {
    path: "/dashboard/members",
    element: <MemberManagement />,
  },
  {
    path: "/dashboard/members/details",
    element: <PersonalDetails />,
  },
  {
    path: "/dashboard/members/registration",
    element: <Registration />,
  },
  {
    path: "/dashboard/members/activity",
    element: <ActivityLogs />,
  },
];
