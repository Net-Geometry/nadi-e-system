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
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Transactions = () => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [memberProfileId, setMemberProfileId] = useState(null);

  // const { data: transactions, isLoading } = useQuery({
  //   queryKey: ["transactions"],
  //   queryFn: async () => {
  //     const { data, error } = await supabase
  //       .from("transactions")
  //       .select("*")
  //       .order("created_at", { ascending: false });

  //     if (error) throw error;
  //     return data;
  //   },
  // });

  // Fetch transactions with items
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['memberTransactions', memberProfileId],
    queryFn: async () => {
      if (!memberProfileId) return [];

      // Fetch all transactions for this member
      const { data: transactionData, error: transactionError } = await supabase
        .from('nd_pos_transaction')
        .select('*')
        .eq('member_id', memberProfileId)
        .order('created_at', { ascending: false });
      
      if (transactionError) 
        throw transactionError;

      if (!transactionData || transactionData.length === 0) 
        return [];

      // For each transaction, get its items
      const transactionsWithItems = await Promise.all(
        transactionData.map(async (transaction) => {
          const { data: items, error: itemsError } = await supabase
            .from('nd_pos_transaction_item')
            .select('id, quantity, price_per_unit, total_price, item_id')
            .eq('transaction_id', transaction.id);
          
          if (itemsError) 
            console.error('Error fetching items:', itemsError);

          if (!items || items.length === 0) 
            return { ...transaction, items: [], totalPrice: 0 };

          // Fetch inventory details for each item
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const { data: inventoryData, error: inventoryError } = await supabase
                .from('nd_inventory')
                .select('name')
                .eq('id', item.item_id)
                .single();
                
              if (inventoryError) console.error('Error fetching inventory:', inventoryError);
              
              return {
                ...item,
                nd_inventory: inventoryData || { name: 'Unknown item' }
              };
            })
          );
          
          // Calculate total price
          const totalPrice = itemsWithDetails.reduce((sum, item) => sum + (item.total_price || 0), 0);

          return {
            ...transaction,
            items: itemsWithDetails || [],
            totalPrice: totalPrice
          };
        })
      );
      
      return transactionsWithItems;
    },
    enabled: !!memberProfileId, // Only run this query when we have the member profile ID
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Get the member profile ID associated with this user
        const { data, error } = await supabase
          .from('nd_member_profile')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          setMemberProfileId(data.id);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold">Transactions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>RM {transaction.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {/* {JSON.parse(transaction.items).length} items */}
                      {transaction.items.length} item(s)
                      {/* Option: List item names */}
                      <div className="text-xs text-gray-500 mt-1">
                        {transaction.items.map(item => (
                          <div key={item.id}>
                            {item.quantity}x {item.nd_inventory?.name || 'Unknown item'}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Transactions;
