import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectOne } from "@/components/ui/SelectOne";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";

import { Inventory } from "@/types/inventory";
import { Transaction } from "@/types/transaction";
// import { Profile } from "@/types/auth";

import { User, Search, CreditCard, Trash2, Plus, QrCode, Banknote, Minus, Receipt, FileText, Printer } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUserMetadata } from "@/hooks/use-user-metadata";

import { useEffect, useState, useMemo } from "react";

const POSSales = () => {
  const [searchItem, setSearchItem] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isPaymentAmountDialogOpen, setIsPaymentAmountDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [cashAmount, setCashAmount] = useState<number>();
  const [remarks, setRemarks] = useState<string>("");
  const [siteName, setSiteName] = useState("Unknown Site");
  const [creatorName, setCreatorName] = useState("Unknown");
  const [receipt, setReceipt] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<(string | number | null)>('cash');
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    selectedServiceId: null,
    numberOfPages: 1,
    subtotal: 0
  });
  const [printingItem, setPrintingItem] = useState<Inventory | null>(null);
  const [editingCartItemIndex, setEditingCartItemIndex] = useState<number | null>(null);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [selectedSearchFilter, setSelectedSearchFilter] = useState<'all' | 'items' | 'services'>('all');
  const { toast } = useToast();

  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const isTPUser =
    parsedMetadata?.user_group_name === "TP" &&
    !!parsedMetadata?.organization_id;

  const [cartItems, setCartItems] = useState<Array<{
    id: string | number;
    type_id: string | number;
    name: string;
    quantity: number;
    price: number;
    total: number;
    barcode: string | number;
    description?: string;
    isPrintingService?: boolean;
    image_url?: string;
    isService?: boolean;
    serviceId?: number;
  }>>([]);

  const paymentMethodOption = [
    { id: 'cash', label: 'Cash' },
    { id: 'qr', label: 'QR' }
  ];

  const formatInvoiceId = (createdAt) => {
    const date = new Date(createdAt);
    const timestamp = Math.floor(date.getTime() / 1000); // Unix timestamp
    return `t${timestamp}`;
  };

  // Fetch inventory data
  const { data: inventorys, isLoading: loadingInventorys } = useQuery({
    queryKey: ['inventorys', searchItem, selectedSearchFilter, parsedMetadata?.group_profile?.site_profile_id, isSuperAdmin],
    queryFn: async () => {
      // If searching for services, fetch from nd_category_service table
      if (selectedSearchFilter === 'services') {
        let serviceQuery = supabase
          .from('nd_category_service')
          .select('*, image_url');

        if (searchItem && searchItem.length > 0) {
          serviceQuery = serviceQuery.or(`bm.ilike.%${searchItem}%,eng.ilike.%${searchItem}%`);
        } else {
          serviceQuery = serviceQuery.limit(10);
        }

        serviceQuery = serviceQuery.order('created_at', { ascending: false });
        const { data: serviceData, error: serviceError } = await serviceQuery;

        if (serviceError) {
          console.error("Error fetching services:", serviceError);
          throw serviceError;
        }

        // Transform service data to match inventory structure
        const transformedServices = serviceData?.map(service => ({
          id: service.id,
          name: service.eng,
          description: service.bm,
          price: 0,
          quantity: 999, // Services don't have stock limits
          category_id: 1, // Mark as service
          type_id: 2, // Digital service
          barcode: null,
          image_url: service.image_url,
          nd_inventory_attachment: []
        })) || [];

        return transformedServices;
      }

      let query = supabase
        .from('nd_inventory')
        .select(`
          *,
          nd_inventory_attachment!left(file_path)
        `)
        .is('deleted_at', null);

      // If not super admin, filter by site_id
      if (!isSuperAdmin) {
        const siteProfileId = parsedMetadata?.group_profile?.site_profile_id || null;
        
        if (!siteProfileId) {
          console.warn("No site_profile_id found in user metadata");
          return [];
        }

        // Get the site_id from nd_site table using site_profile_id
        const { data: siteData, error: siteError } = await supabase
          .from('nd_site')
          .select('id')
          .eq('site_profile_id', siteProfileId)
          .single();

        if (siteError || !siteData) {
          console.error("Error fetching site:", siteError);
          return [];
        }

        const siteId = siteData.id;
        query = query.eq('site_id', siteId);
      }

      if (selectedSearchFilter === 'items') {
        query = query.or('category_id.neq.1,category_id.is.null');
      }

      if (searchItem && searchItem.length > 0) {
        query = query.or(`name.ilike.%${searchItem}%,description.ilike.%${searchItem}%,barcode.ilike.%${searchItem}%`);
      } else if (selectedSearchFilter === 'all') {
        query = query.limit(10);
      }

      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching inventories:", error);
        throw error;
      }

      // Process the data to include the first image
      const processedData = data?.map(item => ({
        ...item,
        image_url: item.nd_inventory_attachment?.[0]?.file_path || null
      })) || [];
      
      return processedData;
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

  const { data: serviceCharges, isLoading: loadingServiceCharges } = useQuery({
    queryKey: ['serviceCharges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nd_service_charge')
        .select('*')
        .order('id');

      if (error) {
        console.error("Error fetching service charges:", error);
        throw error;
      }

      return data || [];
    },
  });

  const resetSale = () => {
    setCartItems([]);
    setSelectedMember(null);
    setSearchTerm("");
    setSelectedPaymentMethod('cash');
    setRemarks("");
  };

  const resetPrintOptions = () => {
    setPrintOptions({
      selectedServiceId: null,
      numberOfPages: 1,
      subtotal: 0
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchItem(value || "");
  };

  const getInventoryStock = (itemId: string | number) => {
    const inventoryItem = inventorys?.find(inv => inv.id === itemId);
    return inventoryItem ? inventoryItem.quantity : 0;
  }

  const updateCartItemQuantity = (itemId: string | number, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Find the cart item to check if it's a service
    const cartItem = cartItems.find(item => item.id === itemId);
    if (!cartItem) return;

    // For services, allow unlimited quantity updates
    if (cartItem.isService) {
      const updatedItems = cartItems.map(item => {
        if(item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price
          };
        }
        return item;
      });
      setCartItems(updatedItems);
      return;
    }

    // For physical items, check inventory
    const inventoryItem = inventorys?.find(inv => inv.id === itemId);
    if(!inventoryItem) return;

    if(newQuantity > inventoryItem.quantity) {
      toast({
        title: "Quantity limit exceeded",
        description: `Only ${inventoryItem.quantity} items available in stock.`,
        variant: "destructive",
      });
      return;
    }

    const updatedItems = cartItems.map(item => {
      if(item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price
        };
      }
      return item;
    });

    setCartItems(updatedItems);
  }

  const addToCart = (inventory: Inventory) => {
    if (inventory) {
      // Check if it's a printing service
      if (inventory.category_id === 1) {
        setPrintingItem({
          ...inventory,
          image_url: inventory.image_url
        });
        setIsPrintDialogOpen(true);
        return;
      }

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === inventory.id);
      
      if (existingItemIndex >= 0) {
        // Calculate how many more items can be added based on what's already in cart
        const currentQtyInCart = cartItems[existingItemIndex].quantity;
        const availableQtyToAdd = inventory.quantity - currentQtyInCart;
        
        // If there's not enough quantity available, show an error
        if (availableQtyToAdd < itemQuantity) {
          toast({
            title: `Fail to add ${inventory.name}`,
            description: `${inventory.name} quantity has reached max.`,
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
          title: `${inventory.name} updated successfully`,
          description: `${inventory.name} has been updated in the cart.`,
          variant: "success",
        });
      } else {
        // Add new item to cart
        const newItem = {
          id: inventory.id,
          type_id: inventory.type_id,
          barcode: inventory.barcode,
          name: inventory.name,
          quantity: itemQuantity,
          price: inventory.price,
          total: itemQuantity * inventory.price,
          image_url: inventory.image_url,
          isService: selectedSearchFilter === 'services'
        };
        setCartItems([...cartItems, newItem]);

        toast({
          title: `${inventory.name} added successfully`,
          description: `${inventory.name} has been added in the cart.`,
          variant: "success",
        });
      }
      setSearchItem("");
    }
  };

  const handleRemoveCartItem = (itemId: string | number, itemName: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));

    toast({
      title: `${itemName} removed successfully`,
      description: `${itemName} has been removed in the cart.`,
      variant: "success",
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = (subtotal: number) => {
    return subtotal;
  };

  const subtotal = useMemo(() => {
    return calculateSubtotal();
  }, [cartItems]);

  const total = useMemo(() => {
    return calculateTotal(subtotal);
  }, [subtotal, 0]);

  const handlePayment = () => {
    if(cartItems.length === 0) {
      toast({
        title: 'Please add items to the cart',
      });
      return;
    }
    setIsPaymentAmountDialogOpen(true);
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
        type: selectedPaymentMethod,
        transaction_date: new Date().toISOString(),
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_by: null,
        updated_at: null,
        remarks: remarks || null,
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
          item_id: item.isService ? null : item.id,
          service_id: item.isService ? (item.serviceId || item.id) : null,
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

        if (!item.isService) {
          const { data: inventoryData, error: getInventoryError } = await supabase
            .from("nd_inventory")
            .select("quantity")
            .eq("id", item.id)
            .single();

          if (getInventoryError) {
            console.warn(`Could not fetch inventory for item ${item.id}, might be a service`);
          } else {
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
        }
      }

      setReceipt({
        id: formatInvoiceId(transactionResult[0].created_at),
        date: transactionResult[0].transaction_date,
        items: cartItems,
        customer: selectedMember,
        paymentMethod: selectedPaymentMethod,
        remarks: remarks,
        subtotal: subtotal,
        tax: 0,
        total: total,
        paymentAmount: cashAmount,
        balance: cashAmount - total,
        creatorName: creatorName,
        siteName: siteName
      });

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

  const formatReceiptDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePrintOptionsChange = (field: string, value: any) => {
    setPrintOptions(prev => {
      const updated = { ...prev, [field]: value };
      
      // Calculate subtotal based on selected service and quantity
      if (field === 'selectedServiceId' || field === 'numberOfPages') {
        const selectedService = serviceCharges?.find(charge => charge.id === 
          (field === 'selectedServiceId' ? value : prev.selectedServiceId));
        
        if (selectedService) {
          const quantity = field === 'numberOfPages' ? value : prev.numberOfPages;
          updated.subtotal = parseFloat((selectedService.fee * quantity).toFixed(2));
        }
      }
      
      return updated;
    });
  };

  const addPrintingToCart = () => {
    if (printingItem) {
      const selectedService = serviceCharges?.find(charge => charge.id === printOptions.selectedServiceId);
      const description = selectedService ? `${selectedService.description} × ${printOptions.numberOfPages}` : '';
      
      const newItem = {
        id: printingItem.id,
        type_id: printingItem.type_id,
        barcode: printingItem.barcode,
        name: printingItem.name,
        description: description,
        quantity: 1,
        price: printOptions.subtotal,
        total: printOptions.subtotal,
        isPrintingService: true,
        image_url: printingItem.image_url,
        isService: true,
        serviceId: printOptions.selectedServiceId
      };
      
      if (editingCartItemIndex !== null && editingCartItemIndex >= 0) {
        const updatedCartItems = [...cartItems];
        updatedCartItems[editingCartItemIndex] = newItem;
        setCartItems(updatedCartItems);
        
        toast({
          title: `${printingItem.name} updated successfully`,
          variant: "success",
        });
        
        setEditingCartItemIndex(null);
      } 
      // If adding a new item
      else {
        setCartItems([...cartItems, newItem]);
        
        toast({
          title: `${printingItem.name} added successfully`,
          variant: "success",
        });
      }
      
      setIsPrintDialogOpen(false);
      setPrintingItem(null);
      setSearchItem("");
      resetPrintOptions();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative.flex-1')) {
        setShowSearchOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if(!isPaymentAmountDialogOpen) {
      setCashAmount(null);
    }
  }, [isPaymentAmountDialogOpen]);

  useEffect(() => {
    const fetchSiteName = async () => {
      if (!isSuperAdmin && parsedMetadata?.group_profile?.site_profile_id) {
        try {
          const { data: siteProfileData, error } = await supabase
            .from('nd_site_profile')
            .select('sitename')
            .eq('id', parsedMetadata.group_profile.site_profile_id)
            .single();

          if (!error && siteProfileData) {
            setSiteName(siteProfileData.sitename);
          }
        } catch (error) {
          console.error("Error fetching site name:", error);
        }
      }
    };

    fetchSiteName();
  }, [parsedMetadata?.group_profile?.site_profile_id, isSuperAdmin]);

  useEffect(() => {
    const fetchCreatorName = async () => {
      try {
        const storedUserMetadata = localStorage.getItem('user_metadata');
        if (storedUserMetadata) {
          const userData = JSON.parse(storedUserMetadata);
          const userId = userData.group_profile?.user_id;
          
          if (userId) {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', userId)
              .single();

            if (!error && profileData?.full_name) {
              setCreatorName(profileData.full_name);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching creator name:", error);
      }
    };

    fetchCreatorName();
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">POS Management</h1>
          <p className="text-muted-foreground">Manage point of sale transactions</p>
        </div>
      </div>

      <div className="flex w-full space-x-6 mt-6">
        
        <div className="w-8/12 space-y-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter item name or scan barcode"
              value={searchItem}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowSearchOptions(true)}
              className="pl-9"
            />

            {/* Search Filter Options */}
            {showSearchOptions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10">
                <div className="p-2 space-y-1">
                  <div 
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedSearchFilter === 'all' ? 'bg-blue-50 text-blue-700' : ''}`}
                    onClick={() => {
                      setSelectedSearchFilter('all');
                      setShowSearchOptions(false);
                    }}
                  >
                    <span className="text-sm font-medium">All Items</span>
                  </div>
                  <div 
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedSearchFilter === 'items' ? 'bg-blue-50 text-blue-700' : ''}`}
                    onClick={() => {
                      setSelectedSearchFilter('items');
                      setShowSearchOptions(false);
                    }}
                  >
                    <span className="text-sm font-medium">Items (Electronics, Accessories, Stationery, Computer)</span>
                  </div>
                  <div 
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedSearchFilter === 'services' ? 'bg-blue-50 text-blue-700' : ''}`}
                    onClick={() => {
                      setSelectedSearchFilter('services');
                      setShowSearchOptions(false);
                    }}
                  >
                    <span className="text-sm font-medium">Services</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Card className="p-4 rounded-lg shadow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {inventorys && inventorys.length > 0 ? (
                inventorys.map((inventory) => (
                <Card key={inventory.id} className="hover:cursor-pointer border hover:border-[#5147dd]" onClick={() => addToCart(inventory)}>
                  <img 
                    src={inventory.image_url || "/200x200.svg"} 
                    alt={inventory.name} 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/200x200.svg";
                    }}
                  />
                  <div className="p-2">
                    <p className="font-medium text-sm truncate">{inventory.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-semibold">RM{inventory.price}</span>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        addToCart(inventory);
                      }}>
                        +
                      </Button>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{inventory.type_id == 1 ? 'Physical' : 'Digital'}</span>
                      <span>Stock: {inventory.quantity}</span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {searchItem ? `No items found matching "${searchItem}"` : 'No items available'}
              </div>
            )}
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Qty.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      No items in cart
                    </TableCell>
                  </TableRow>
                ) : (
                  cartItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <img 
                            src={item.image_url || "/200x200.svg"} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.src = "/200x200.svg";
                            }}
                          />
                          <div className="space-y-1">
                            <div className="font-medium">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Category: {item.type_id == 1 ? 'Physical' : 'Digital'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Barcode: {item.barcode ? item.barcode : '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Stock: {item.isService ? 'Unlimited' : getInventoryStock(item.id)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">RM{item.price}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col justify-end space-y-2">
                          <div className="space-x-2">
                            <Button variant="secondary" className="w-8 h-8 text-[14px] p-0 inline-flex hover:bg-[#5147dd] hover:text-white border"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button variant="secondary" className="w-8 h-8 text-[14px] p-0 inline-flex hover:bg-[#5147dd] hover:text-white border"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                              disabled={!item.isService && item.quantity >= getInventoryStock(item.id)}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                          <div>
                            {item.isPrintingService && item.description && (
                              <Button variant="secondary" className="text-xs py-0 px-2 inline-flex hover:bg-[#5147dd] hover:text-white border"
                                onClick={() => {
                                  // Find the index of this item in the cart
                                  const itemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
                                  if (itemIndex !== -1) {
                                    setEditingCartItemIndex(itemIndex);
                                    
                                    // Find the selected service ID from the description
                                    const selectedService = serviceCharges?.find(charge => 
                                      item.description?.includes(charge.description)
                                    );
                                    
                                    // Extract quantity from description
                                    const quantityMatch = item.description?.match(/×\s*(\d+)/);
                                    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
                                    
                                    setPrintOptions({
                                      selectedServiceId: selectedService?.id || null,
                                      numberOfPages: quantity,
                                      subtotal: item.price
                                    });
                                    
                                    setPrintingItem({
                                      id: item.id,
                                      type_id: item.type_id,
                                      name: item.name,
                                      barcode: item.barcode,
                                      price: item.price,
                                      quantity: item.quantity,
                                      image_url: item.image_url,
                                      category_id: 1
                                    } as Inventory);
                                    
                                    setIsPrintDialogOpen(true);
                                  }
                                }}
                              >
                                <Printer className="h-5 w-5" /> {item.description}
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">RM{item.total}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveCartItem(item.id, item.name)}
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
          </Card>
        </div>

        <Card className="w-4/12 p-6 rounded-lg shadow flex flex-col">

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="" className="text-sm font-medium">Find Customer</label>
              <div className="relative flex-1">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Customer dropdown */}
              {searchTerm && membersData?.data && membersData.data.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md bg-background">
                  {membersData.data.map((member) => (
                    <div
                      key={member.id}
                      className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedMember(member);
                        setSearchTerm("");
                      }}
                    >
                      <div className="font-medium text-sm">{member.fullname || 'No name'}</div>
                      <div className="text-xs text-muted-foreground">{member.email || 'No email'}</div>
                      <div className="text-xs text-muted-foreground">{member.identity_no || 'No ID'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium mb-1">Customer</h3>
                  {selectedMember ? (
                    <div>
                      <p className="text-sm font-medium">{selectedMember.fullname || 'No name'}</p>
                      <p className="text-xs text-muted-foreground">{selectedMember.email || 'No email'}</p>
                      <p className="text-xs text-muted-foreground">{selectedMember.identity_no || 'No ID'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No customer selected</p>
                  )}
                </div>
                {selectedMember && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMember(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Items</span>
                <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-medium border-t pt-2 mt-4">
                <span>Total</span>
                <span>RM {total.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label htmlFor="" className="block text-sm font-medium mb-1">Remarks</label>
              <textarea name="" id="remarks" placeholder="Add any notes about this sale" 
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background 
                placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-20"
              ></textarea>
            </div>

            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Payment Method</p>
              <SelectOne
                options={paymentMethodOption}
                value={selectedPaymentMethod}
                onChange={setSelectedPaymentMethod}
                placeholder="Select payment method"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button onClick={handlePayment}><CreditCard className="h-5 w-5"/> Payment</Button>
            <Button onClick={() => setIsReceiptDialogOpen(true)} disabled={!receipt}><Receipt className="h-5 w-5" /> Receipt</Button>
          </div>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={isPaymentAmountDialogOpen} onOpenChange={setIsPaymentAmountDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Payment Amount:</Label>
                <Input 
                  id="cashAmount" 
                  type="number" 
                  placeholder="Enter payment amount" 
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={cashAmount}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value);
                    setCashAmount(amount);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm">Total Amount:</p>
                  <p className="text-sm font-semibold">RM {total.toFixed(2)}</p>
                </div>
                {!cashAmount ? (
                  <div></div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Balance:</p>
                    <p className={`text-sm font-semibold ${
                      cashAmount && (cashAmount - total) < 0 
                        ? 'text-danger' 
                        : 'text-success'
                    }`}>
                      RM { cashAmount ? (cashAmount - total).toFixed(2) : 0}
                      </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsPaymentAmountDialogOpen(false)}
              >
                Back
              </Button>
              <Button 
                variant="default"
                onClick={() => {
                  setIsPaymentAmountDialogOpen(false);
                  handlePaySales();
                }}
                disabled={cashAmount < total || !cashAmount}
              >
                Confirm Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Receipt Dialog */}
        <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2"><FileText className="h-5 w-5"/> Receipt</DialogTitle>
            </DialogHeader>
            {receipt && (
              <div className="space-y-4 py-4">
                {/* Receipt Header */}
                <div className="text-center border-b pb-4">
                  <h3 className="font-bold text-lg">NADI 2.0 POS</h3>
                  <p className="text-sm text-muted-foreground">Kuala Lumpur, Malaysia</p>
                </div>

                {/* Transaction Info */}
                <div className="border-b pb-2 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Invoice No:</p>
                    <p className="text-sm">{receipt.id}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Date:</p>
                    <p className="text-sm">{formatReceiptDate(receipt.date)}</p>
                  </div>

                  {/* Customer Info - Only show if customer exists */}
                  {receipt.customer && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Customer:</p>
                      <p className="text-sm">{receipt.customer.fullname || 'Walk-in Customer'}</p>
                    </div>
                  )}

                  {/* Site Info */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Site:</p>
                    <p className="text-sm">{receipt.siteName}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Handled By:</p>
                    <p className="text-sm">{receipt.creatorName}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Items:</p>
                  {receipt.items.map((item, index) => (
                    <div key={index} className="flex flex-col gap-3 pb-2">
                      <div className="grid grid-cols-8">
                        <div className="flex col-span-5 gap-2">
                          <img 
                            src={item.image_url || "/200x200.svg"} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/200x200.svg";
                            }}
                          />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            {item.isPrintingService && item.description && (
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-right">{item.quantity}x</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-right">RM {item.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>RM {receipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (0%):</span>
                    <span>RM {receipt.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total:</span>
                    <span>RM {receipt.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-2 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{receipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Amount:</span>
                    <span>RM {receipt.paymentAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance:</span>
                    <span className="text-success">RM {receipt.balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Remarks */}
                {receipt.remarks && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium">Remarks:</p>
                    <p className="text-sm text-muted-foreground">{receipt.remarks}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-sm border-t pt-4">
                  <p>Thank you for your purchase!</p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="secondary"
                className="border print:hidden"
                onClick={handlePrint}
              >
                <Printer className="h-5 w-5"/>
                Print
              </Button>
              <Button 
                variant="default" 
                onClick={() => setIsReceiptDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Service Options Dialog */}
        <Dialog open={isPrintDialogOpen} onOpenChange={(open) => {
          setIsPrintDialogOpen(open);
          if (!open) {
            setEditingCartItemIndex(null);
            resetPrintOptions();
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Service Options</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-sm font-medium">Service: {printingItem?.name}</Label>
                {printingItem?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{printingItem.description}</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Available Options</Label>
                <div className="space-y-2 mt-2">
                  {serviceCharges?.filter(charge => charge.category_id === printingItem?.id).map((charge) => (
                    <div key={charge.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`service-${charge.id}`}
                        checked={printOptions.selectedServiceId === charge.id}
                        onChange={() => handlePrintOptionsChange('selectedServiceId', charge.id)}
                        className="h-4 w-4 rounded-full"
                      />
                      <Label htmlFor={`service-${charge.id}`} className="flex-1">
                        {charge.description} - RM{charge.fee.toFixed(2)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Quantity</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handlePrintOptionsChange('numberOfPages', Math.max(1, printOptions.numberOfPages - 1))}
                    disabled={printOptions.numberOfPages <= 1}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    className="text-center"
                    value={printOptions.numberOfPages}
                    onChange={(e) => handlePrintOptionsChange('numberOfPages', parseInt(e.target.value) || 1)}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handlePrintOptionsChange('numberOfPages', printOptions.numberOfPages + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t font-medium">
                <span>Subtotal:</span>
                <span>RM{printOptions.subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsPrintDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={addPrintingToCart}>
                Add Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default POSSales;