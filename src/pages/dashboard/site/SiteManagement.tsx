import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, Clock, PauseCircle, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { SiteList } from "@/components/site/SiteList";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SiteFormDialog } from "@/components/site/SiteFormDialog";
import { fetchSites } from "@/components/site/component/site-utils";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { useNavigate } from "react-router-dom";

const SiteDashboard = () => {
  const { user } = useAuth();
  const userMetadata = useUserMetadata();
  const navigate = useNavigate();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const [siteId, setSiteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const fetchSiteId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("User is undefined");
          return;
        }
        const user_id = user.id;
        const { data, error } = await supabase
          .from("nd_staff_contract")
          .select("site_id")
          .eq("user_id", user_id)
          .single();
        if (error) throw error;
        setSiteId(data.site_id);
      } catch (error) {
        console.error("Error fetching site ID:", error);
      }
    };

    if (parsedMetadata?.user_type?.startsWith("staff")) {
      fetchSiteId();
    } else {
      setShouldRender(true);
    }
  }, [parsedMetadata]);

  useEffect(() => {
    if (parsedMetadata?.user_type?.startsWith("staff") && siteId) {
      navigate(`/site/${siteId}`);
    } else if (parsedMetadata?.user_type === "super_admin" || parsedMetadata?.user_type?.startsWith("tp")) {
      setShouldRender(true);
    }
  }, [parsedMetadata, siteId, navigate]);

  const organizationId =
    parsedMetadata?.user_type === "super_admin" && parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;

  const { data: siteStats, isLoading } = useQuery({
    queryKey: ['site-stats', organizationId],
    queryFn: () => fetchSites(organizationId),
    enabled: !!organizationId,
  });

  if (!shouldRender) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Site Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage site</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Site
          </Button>
        </div>
        <div className="flex flex-col md:flex-row flex-wrap gap-4">
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Site</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Operation</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 1).length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 2).length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Temporarily Close</CardTitle>
              <PauseCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 3).length || 0}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Permanently Close</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteStats?.filter(site => site.active_status === 4).length || 0}</div>
            </CardContent>
          </Card>
        </div>
        <SiteList />
        <SiteFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    </DashboardLayout>
  );
};

export default SiteDashboard;