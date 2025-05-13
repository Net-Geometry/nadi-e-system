import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { XOctagon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const AdminNoAccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate("/site-management", { replace: true });
        }, 5000); // 5 seconds

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <DashboardLayout>
            <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-background p-8 text-center">
                <Container>
                    <XOctagon className="w-16 h-16 text-red-600 mb-4 mx-auto" />
                    <h1 className="text-3xl font-bold mb-2">
                        You don&apos;t have access to the NADI Dashboard. To access it, go to <strong>Menu &gt; Site Management &gt; View Site</strong>.
                    </h1>
                    <p className="mb-4 text-muted-foreground">
                        You will be redirected to the dashboard shortly.
                    </p>
                </Container>
            </div>
        </DashboardLayout>
    );
};

export default AdminNoAccess;
