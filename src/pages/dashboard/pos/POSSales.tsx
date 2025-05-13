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
import { Plus, Clock, ShoppingCart, Box } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const POSSales = () => {
  // const { data: transactions, isLoading } = useQuery({
  //   queryKey: ['transactions'],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from('transactions')
  //       .select('*')
  //       .order('created_at', { ascending: false });
      
  //     if (error) throw error;
  //     return data;
  //   },
  // });

  const { data: inventorys, isLoading } = useQuery({
    queryKey: ['inventorys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nd_inventory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  console.log("hariz", inventorys);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold">Sales</h1>
      </div>

      <div className="flex w-full">
        <Card className="w-5/12 p-4 rounded-lg shadow">
          <div>header atas search ic / member / name</div>
          <div>info point dgn visits</div>
          <div>table</div>
          <div>info payment and button payment</div>
        </Card>
        <div className="w-7/12 px-4 flex flex-wrap gap-4">
          <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 w-[130px]">
            <Box className="h-5 w-5 mb-1" />
            <p className="text-sm font-semibold">Shirts</p>
            <p className="text-sm font-semibold text-gray-600">RM 29.90</p>
          </Card>
          <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 w-[130px]">
            <ShoppingCart className="h-5 w-5" />
            <p className="text-sm font-semibold">Cart</p>
          </Card>
          <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 w-[130px]">
            <Clock className="h-5 w-5" />
            <p className="text-sm font-semibold">History</p>
          </Card>
          <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 w-[130px]">
            <Plus className="h-5 w-5" />
            <p className="text-sm font-semibold">New Sale</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default POSSales;