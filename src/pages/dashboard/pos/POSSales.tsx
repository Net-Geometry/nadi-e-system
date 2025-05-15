import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";

import { Inventory } from "@/types/inventory";
import { Transaction } from "@/types/transaction";
// import { Profile } from "@/types/auth";

import { Check, ChevronsUpDown, User, Search, CreditCard, Trash2, Plus, Clock, ShoppingCart, Box, QrCode, Banknote } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { useEffect, useState, useMemo } from "react";

const POSSales = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false);
  const [isResetConfirmDialogOpen, setIsResetConfirmDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isShowCashPayment, setIsShowCashPayment] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [cashAmount, setCashAmount] = useState<number>();
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<Array<{
    id: string | number;
    code: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>>([]);

  // Fetch inventory data
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
  const { data: membersData, isLoading: loadingMembersData } = useQuery({
    queryKey: ["members", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("nd_member_profile")
        .select("*", { count: 'exact' })
        // .eq('user_type', 'member')

      if (searchTerm) {
        query = query.or(`fullname.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,identity_no.ilike.%${searchTerm}%`)
      }

      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching members:", error);
        throw error;
      }

      return { data: data, count: count || 0 };
    },
  });

  // const [inventoryQuantity, setInventoryQuantity] = useState<string>(
  //   String(inventorys?.quantity || "")
  // );

  const resetSale = () => {
    setCartItems([]);
    setSelectedMember(null);
    setSearchTerm("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value || "");
  };

  const handleQuantityChange = (value: number) => {
    if (selectedItem && value >= 1 && value <= selectedItem.quantity) {
      setItemQuantity(value);
    }
  };

  const handleSubmitQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === selectedItem.id);
      
      if (existingItemIndex >= 0) {
        // Calculate how many more items can be added based on what's already in cart
        const currentQtyInCart = cartItems[existingItemIndex].quantity;
        const availableQtyToAdd = selectedItem.quantity - currentQtyInCart;
        
        // If there's not enough quantity available, show an error
        if (availableQtyToAdd < itemQuantity) {
          toast({
            title: "Fail to add inventory",
            description: "The inventory quantity has reached max.",
            variant: "destructive",
          });
          return;
        }

        // Update quantity if item already exists
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex].quantity += itemQuantity;
        updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
        setCartItems(updatedItems);

        toast({
          title: "Inventory updated successfully",
          description: "The inventory has been updated in the cart.",
          variant: "success",
        });
      } else {
        // Add new item to cart
        const newItem = {
          id: selectedItem.id,
          code: '-',
          name: selectedItem.name,
          quantity: itemQuantity,
          price: selectedItem.price,
          total: itemQuantity * selectedItem.price
        };
        setCartItems([...cartItems, newItem]);

        toast({
          title: "Inventory added successfully",
          description: "The inventory has been added in the cart.",
          variant: "success",
        });
      }
      
      setIsQuantityDialogOpen(false);
    }
  };

  const handleRemoveCartItem = (itemId: string | number) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));

    toast({
      title: "Inventory removed successfully",
      description: "The inventory has been removed in the cart.",
      variant: "success",
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  // const calculateTax = (subtotal: number) => {
  //   return subtotal * 0.06;
  // };

  const calculateTotal = (subtotal: number, tax: number) => {
    return subtotal + tax;
  };

  const subtotal = useMemo(() => {
    return calculateSubtotal();
  }, [cartItems]);

  // const tax = useMemo(() => {
  //   return calculateTax(subtotal);
  // }, [subtotal]);

  const total = useMemo(() => {
    return calculateTotal(subtotal, 0);
  }, [subtotal, 0]);

  const handlePaymentQR = () => {
    setIsPayDialogOpen(false);
    handlePaySales();
  }

  const handlePaymentCash = () => {
    setIsShowCashPayment(true);
  }

  const handlePaySales = async () => {
    try {
      let userId = null;
      try {
        const storedUserMetadata = localStorage.getItem('user_metadata');
        if (storedUserMetadata) {
          const userData = JSON.parse(storedUserMetadata);
          userId = userData.group_profile?.user_id || null;
        }
      } catch (error) {
        console.error("Error retrieving user data from localStorage:", error);
      }

      const transactionData = {
        member_id: selectedMember?.id || null,
        type: isShowCashPayment ? 'cash' : 'qr',
        transaction_date: new Date().toISOString(),
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_by: null,
        updated_at: null
      }

      const { data: transactionResult, error: insertTransactionError } = await supabase
        .from("nd_pos_transaction")
        .insert([transactionData])
        .select(); // To select the data to get the ID

      if (insertTransactionError) {
        throw insertTransactionError;
      }

      // Get the transaction ID
      const transactionId = transactionResult?.[0]?.id;

      if (!transactionId) {
        throw new Error("Failed to get transaction ID");
      }

      for (const item of cartItems) {
        const transactionItemData = {
          transaction_id: transactionId,
          quantity: item.quantity,
          price_per_unit: item.price,
          total_price: item.total,
          item_id: item.id,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_by: null,
          updated_at: null
        };

        const { error: insertTransactionItemError } = await supabase
          .from("nd_pos_transaction_item")
          .insert([transactionItemData]);

        if (insertTransactionItemError) {
          throw insertTransactionItemError;
        }

        const { data: inventoryData, error: getInventoryError } = await supabase
          .from("nd_inventory")
          .select("quantity")
          .eq("id", item.id)
          .single();

        if (getInventoryError) {
          throw getInventoryError;
        }

        const currentQuantity = inventoryData.quantity;
        const newQuantity = currentQuantity - item.quantity;

        if (newQuantity < 0) {
          throw new Error(`Not enough inventory for ${item.name}. Available: ${currentQuantity}`);
        }

        // Update the inventory
        const { error: updateInventoryError } = await supabase
          .from("nd_inventory")
          .update({ 
            quantity: newQuantity,
            updated_by: userId,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id);

        if (updateInventoryError) {
          throw updateInventoryError;
        }

        console.log(`Updated inventory for item ${item.id}: ${currentQuantity} → ${newQuantity}`);
      }

      setIsReceiptDialogOpen(true);
      resetSale();
    } catch (error) {
      console.error("Error processing payment:", error);

      toast({
        title: "Payment failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if(isQuantityDialogOpen && selectedItem) {
      setItemQuantity(1);
    }

    if(isPayDialogOpen) {
      setIsShowCashPayment(false);
      setCashAmount(0);
    }
  }, [isQuantityDialogOpen, selectedItem, isPayDialogOpen]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold">Sales</h1>
      </div>

      <div className="flex w-full">
        <Card className="w-6/12 p-4 rounded-lg shadow flex flex-col min-h-[600px]">
        
          <div className="flex w-full">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedMember
                    ? `${selectedMember.full_name || ''} - ${selectedMember.email || ''}`
                    : "Select member..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false} className="w-full">
                  <CommandInput 
                    placeholder="Search members..." 
                    value={searchTerm}
                    onValueChange={handleSearchChange}
                    className="h-9"
                  />
                  <CommandList className="max-h-64 overflow-auto">
                    {loadingMembersData ? (
                      <div className="py-6 text-center text-sm">Loading members...</div>
                    ) : (membersData?.data || []).length === 0 ? (
                      <CommandEmpty>No members found.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {(membersData?.data || []).map((member) => (
                          <CommandItem
                            key={member.id}
                            value={member.id?.toString()}
                            onSelect={() => {
                              setSelectedMember(member);
                              setSearchTerm(member.full_name || "");
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedMember?.id === member.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">{member.fullname || 'No name'}</div>
                              <div className="text-xs text-muted-foreground">
                                {member.email || 'No email'} {member.identity_no ? `(${member.identity_no})` : ''}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col mt-4 gap-2">
            <span className="flex justify-between items-center">              
              <p className="text-md">Points earned</p>
              <p className="text-md font-semibold">0 points</p>
            </span>
            <span className="flex justify-between items-center">              
              <p className="text-md">Visits</p>
              <p className="text-md font-semibold">0 visits</p>
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
                {cartItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No items in cart
                    </TableCell>
                  </TableRow>
                ) : (
                  cartItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveCartItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <span className="flex justify-between items-center">              
              <p className="text-md">Subtotal:</p>
              <p className="text-md">RM {subtotal.toFixed(2)}</p>
            </span>
            <span className="flex justify-between items-center">              
              <p className="text-md">Tax (6%):</p>
              {/* <p className="text-md">RM {tax.toFixed(2)}</p> */}
              <p className="text-md">RM 0.00</p>
            </span>
            <span className="flex justify-between items-center">              
              <p className="text-md font-semibold">Total:</p>
              <p className="text-md font-semibold">RM {total.toFixed(2)}</p>
            </span>
            <Button 
              className="mt-1 font-bold"
              onClick={() => setIsPayDialogOpen(true)}
              disabled={cartItems.length === 0}
            >
              <CreditCard className="h-5 w-5" /> Pay Now
            </Button>
          </div>
        </Card>

        <div className="w-6/12 px-6 grid grid-cols-3 gap-4 h-fit">
          {inventorys?.map((inventory) => (
            <button 
              key={inventory.id} 
              onClick={() => {
                setIsQuantityDialogOpen(true);
                setSelectedItem(inventory);
              }}
              className="w-full h-[150px]"
            >
              <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-[150px]">
                <Box className="h-5 w-5 mb-1" />
                <p className="text-sm font-semibold">{inventory.name}</p>
                <p className="text-sm font-semibold text-gray-600">RM {inventory.price}.00</p>
              </Card>
            </button>
          ))}
          {/* <button 
            onClick={() => alert("Cart Modal")}
            className="w-full h-[150px]"
          >
            <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-full">
              <ShoppingCart className="h-5 w-5" />
              <p className="text-sm font-semibold">Cart</p>
            </Card>
          </button>
          <button 
            onClick={() => alert("History Modal")}
            className="w-full h-[150px]"
          >
            <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-full">
              <Clock className="h-5 w-5" />
              <p className="text-sm font-semibold">History</p>
            </Card>
          </button> */}
          <button 
            onClick={() => {
              if (cartItems.length > 0 || selectedMember) {
                setIsResetConfirmDialogOpen(true);
              } else {
                resetSale();
              }
            }}
            className="w-full h-[150px]"
          >
            <Card className="px-6 py-8 flex flex-col items-center justify-center gap-2 h-full">
              <Plus className="h-5 w-5" />
              <p className="text-sm font-semibold">New Sale</p>
            </Card>
          </button>
        </div>

        {/* Quantity Inventory Dialog */}
        <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
          <DialogContent className="sm:max-w-2/3 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-2">
              <DialogTitle>
                {selectedItem?.name}
              </DialogTitle>
              <DialogDescription>
                Choose quantity
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitQuantity} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuantityChange(itemQuantity - 1)}
                    disabled={itemQuantity <= 1}
                  >
                    <span className="text-xl font-bold">-</span>
                  </Button>
                  
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    className="mx-2 w-24 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={itemQuantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    min={1}
                    max={selectedItem?.quantity}
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleQuantityChange(itemQuantity + 1)}
                    disabled={selectedItem && itemQuantity >= selectedItem.quantity}
                  >
                    <span className="text-xl font-bold">+</span>
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Available: <span className="font-semibold">{selectedItem?.quantity || 0}</span> units
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                Add
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={isResetConfirmDialogOpen} onOpenChange={setIsResetConfirmDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start New Sale?</DialogTitle>
              <DialogDescription>
                This will clear the current cart and customer selection. Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsResetConfirmDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  resetSale();
                  setIsResetConfirmDialogOpen(false);
                }}
              >
                Start New Sale
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pay Dialog */}
        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          {isShowCashPayment 
          ? (
            <DialogContent className="sm:max-w-md">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="cashAmount">Payment Amount:</Label>
                  <Input 
                    id="cashAmount" 
                    type="number" 
                    placeholder="Enter amount" 
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={cashAmount}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value);
                      setCashAmount(amount);
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-md">Total Amount:</Label>
                  <p className="text-md font-bold">RM {total.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-md">Balance:</Label>
                  <p className="text-md font-bold">RM { cashAmount ? (cashAmount - total).toFixed(2) : 0}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsShowCashPayment(false)}
                >
                  Back
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    setIsPayDialogOpen(false);
                    handlePaySales();
                  }}
                  disabled={cashAmount < total || !cashAmount}
                >
                  Confirm Payment
                </Button>
              </div>
            </DialogContent>
          ) : (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Payment Method</DialogTitle>
                <DialogDescription>
                  Choose your payment method.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center gap-4 my-4">
                <Button 
                  className="flex flex-col w-fit h-fit items-center justify-center py-5 px-9 gap-4"
                  variant="outline" 
                  onClick={() => handlePaymentQR()}
                >
                  <QrCode className="!h-12 !w-12" /> QR
                </Button>
                <Button 
                  className="flex flex-col w-fit h-fit items-center justify-center py-5 px-9 gap-4"
                  variant="outline"
                  onClick={() => handlePaymentCash()}
                >
                  <Banknote className="!h-12 !w-12" /> Cash
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Payment successful!</DialogTitle>
              <DialogDescription>
                Your transaction has been completed.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center gap-4 my-4">
              <Button 
                className="flex flex-col w-fit h-fit items-center justify-center py-5 px-9 gap-4"
                variant="default" 
                onClick={() => setIsReceiptDialogOpen(false)}
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default POSSales;