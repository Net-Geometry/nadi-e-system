import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const PUDO = () => {
  

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold">PUDO</h1>
      </div>

    </DashboardLayout>
  );
};

export default PUDO;