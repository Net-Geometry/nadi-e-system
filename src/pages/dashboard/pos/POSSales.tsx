import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Inventory } from "@/types/inventory";
import { Plus, Clock, ShoppingCart, Box, User, Search, CreditCard, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";

const POSSales = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  // const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);

  const { data: inventorys, isLoading: loadingInventorys } = useQuery({
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

  // Fetch members data
  // const { data: membersData, isLoading: loadingMembersData } = useQuery({
  //   queryKey: ["members", searchTerm, sortField, sortDirection, currentPage],
  //   queryFn: async () => {
  //     let query = supabase
  //       .from("profiles")
  //       .select("*", { count: 'exact' })
  //       .eq('user_type', 'member')

  //     if (searchTerm) {
  //       query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  //     }

  //     if (sortField && sortDirection) {
  //       query = query.order(sortField, { ascending: sortDirection === "asc" });
  //     } else {
  //       query = query.order('created_at', { ascending: false });
  //     }

  //     query = query.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

  //     const { data, error, count } = await query;

  //     if (error) {
  //       console.error("Error fetching members:", error);
  //       throw error;
  //     }

  //     return { data: data as Profile[], count: count || 0 };
  //   },
  // });

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    console.log('hariz search');
  };

  useEffect(() => {
    if (isQuantityDialogOpen) {
      console.log("hariz open");
    }
  }, [isQuantityDialogOpen]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold">Sales</h1>
      </div>

      <div className="flex w-full">
        <Card className="w-6/12 p-4 rounded-lg shadow flex flex-col min-h-[600px]">
        
          <div className="flex w-full">
            <form onSubmit={handleSearch} className="flex items-center w-full gap-2">
              <User className="h-7 w-7" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button>
                <Search className="h-6 w-6 text-gray-600" />
              </button>
            </form>
          </div>

          <div className="flex flex-col mt-4 gap-2">
            <span className="flex justify-between items-center">              
              <p className="text-md">Points earned</p>
              <p className="text-md font-semibold">4200 points</p>
            </span>
            <span className="flex justify-between items-center">              
              <p className="text-md">Visits</p>
              <p className="text-md font-semibold">19</p>
            </span>
          </div>

          <div className="flex-grow my-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    H001
                  </TableCell>
                  <TableCell>Desk</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>60.00</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        // onClick={() => {
                        //   setIsEditDialogOpen(true);
                        //   setSelectedItem(inventory);
                        // }}
                        onClick={() => alert("Delete!")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <span className="flex justify-between items-center">              
              <p className="text-md">Subtotal:</p>
              <p className="text-md">RM 0.00</p>
            </span>
            <span className="flex justify-between items-center">              
              <p className="text-md">Tax (6%):</p>
              <p className="text-md">RM 0.00</p>
            </span>
            <span className="flex justify-between items-center">              
              <p className="text-md font-semibold">Total:</p>
              <p className="text-md font-semibold">RM 0.00</p>
            </span>
            <Button 
              className="mt-1 font-bold"
              onClick={() => alert("Pay!")}
            >
              <CreditCard className="h-5 w-5" /> Pay Now
            </Button>
          </div>
        </Card>

        <div className="w-6/12 px-6 grid grid-cols-3 gap-4 h-fit">
          {inventorys?.map((inventory) => (
            <button 
              key={inventory.id} 
              // onClick={() => {
              //   setIsQuantityDialogOpen(true);
              //   setSelectedItem(inventory);
              // }}
              onClick={() => alert("Quantity Modal Open!")}
              className="w-full h-[150px]"
            >
              <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-[150px]">
                <Box className="h-5 w-5 mb-1" />
                <p className="text-sm font-semibold">{inventory.name}</p>
                <p className="text-sm font-semibold text-gray-600">RM {inventory.price}.00</p>
              </Card>
            </button>
          ))}
          <button 
            // onClick={() => {
            //   setIsQuantityDialogOpen(true);
            //   setSelectedItem(inventory);
            // }}
            onClick={() => alert("Cart Modal")}
            className="w-full h-[150px]"
          >
            <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-full">
              <ShoppingCart className="h-5 w-5" />
              <p className="text-sm font-semibold">Cart</p>
            </Card>
          </button>
          <button 
            // onClick={() => {
            //   setIsQuantityDialogOpen(true);
            //   setSelectedItem(inventory);
            // }}
            onClick={() => alert("History Modal")}
            className="w-full h-[150px]"
          >
            <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-full">
              <Clock className="h-5 w-5" />
              <p className="text-sm font-semibold">History</p>
            </Card>
          </button>
          <button 
            // onClick={() => {
            //   setIsQuantityDialogOpen(true);
            //   setSelectedItem(inventory);
            // }}
            onClick={() => alert("New Sale Modal")}
            className="w-full h-[150px]"
          >
            <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-full">
              <Plus className="h-5 w-5" />
              <p className="text-sm font-semibold">New Sale</p>
            </Card>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default POSSales;