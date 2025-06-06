import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Filter, Search, Check, Edit, ChevronsUpDown, RotateCcw, X, Package, Box, FileText, Upload, Image as ImageIcon } from "lucide-react";
import { useUserMetadata } from "@/hooks/use-user-metadata";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventories, setInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editPrices, setEditPrices] = useState<{[key: string]: string}>({});
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false);
  const [selectedImageItem, setSelectedImageItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sorting states
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Selected filters (pending application)
  const [selectedProductIdFilters, setSelectedProductIdFilters] = useState<string[]>([]);
  const [selectedNameFilters, setSelectedNameFilters] = useState<string[]>([]);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);
  const [selectedPriceFilters, setSelectedPriceFilters] = useState<string[]>([]);
  const [selectedStockFilters, setSelectedStockFilters] = useState<string[]>([]);
  const [selectedBarcodeFilters, setSelectedBarcodeFilters] = useState<string[]>([]);

  // Applied filters (used in actual filtering)
  const [appliedProductIdFilters, setAppliedProductIdFilters] = useState<string[]>([]);
  const [appliedNameFilters, setAppliedNameFilters] = useState<string[]>([]);
  const [appliedCategoryFilters, setAppliedCategoryFilters] = useState<string[]>([]);
  const [appliedPriceFilters, setAppliedPriceFilters] = useState<string[]>([]);
  const [appliedStockFilters, setAppliedStockFilters] = useState<string[]>([]);
  const [appliedBarcodeFilters, setAppliedBarcodeFilters] = useState<string[]>([]);

  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const isSuperAdmin = parsedMetadata?.user_type === "super_admin";
  const isTPSite = parsedMetadata?.user_type === "tp_site";
  const isTPUser =
    parsedMetadata?.user_group_name === "TP" &&
    !!parsedMetadata?.organization_id;

  const formatProductId = (item) => {
    const date = new Date(item.created_at);
    const timestamp = Math.floor(date.getTime() / 1000); // Unix timestamp

    if (item.isService) {
      return `s${timestamp}`;
    }

    return `p${timestamp}`;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedProductIdFilters([]);
    setSelectedNameFilters([]);
    setSelectedCategoryFilters([]);
    setSelectedPriceFilters([]);
    setSelectedStockFilters([]);
    setSelectedBarcodeFilters([]);
    setAppliedProductIdFilters([]);
    setAppliedNameFilters([]);
    setAppliedCategoryFilters([]);
    setAppliedPriceFilters([]);
    setAppliedStockFilters([]);
    setAppliedBarcodeFilters([]);
    setSortField(null);
    setSortDirection(null);
    
    toast({
      title: "Filters reset",
      description: "All filters have been cleared.",
    });
  };

  const hasActiveFilters = 
    appliedProductIdFilters.length > 0 ||
    appliedNameFilters.length > 0 ||
    appliedCategoryFilters.length > 0 ||
    appliedPriceFilters.length > 0 ||
    appliedStockFilters.length > 0 ||
    appliedBarcodeFilters.length > 0;

  const getActiveFilterCount = () => {
    return (
      appliedProductIdFilters.length +
      appliedNameFilters.length +
      appliedCategoryFilters.length +
      appliedPriceFilters.length +
      appliedStockFilters.length +
      appliedBarcodeFilters.length
    );
  };

  // Fetch transactions with items
  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ['inventories', parsedMetadata?.group_profile?.site_profile_id, isSuperAdmin],
    queryFn: async () => {
      // Fetch inventory data
      let inventoryQuery = supabase
        .from('nd_inventory')
        .select(`*, 
          type:nd_inventory_type!type_id(id, name),
          category:nd_inventory_category!category_id(id, name)
        `);
        
      // If not super admin, filter by site_id
      if (!isSuperAdmin) {
        const siteProfileId = parsedMetadata?.group_profile?.site_profile_id || null;
        
        if (!siteProfileId) {
          console.warn("No site_profile_id found in user metadata");
          return [];
        }

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
        inventoryQuery = inventoryQuery.eq('site_id', siteId);
      }

      const { data: inventoryResult, error: inventoryError } = await inventoryQuery;
      
      if (inventoryError) {
        console.error('Error fetching inventory:', inventoryError);
        throw inventoryError;
      }

      const { data: servicesResult, error: servicesError } = await supabase
        .from('nd_category_service')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      const { data: serviceCharges, error: chargesError } = await supabase
        .from('nd_service_charge')
        .select('*');

      if (chargesError) {
        console.error('Error fetching service charges:', chargesError);
        throw chargesError;
      }

      // Transform services data to match inventory structure
      const transformedServices = servicesResult?.map(service => {
        // Find the service charge for this service
        const serviceCharge = serviceCharges?.find(charge => charge.category_id === service.id);
        const price = serviceCharge?.fee || 0;

        return {
          id: `service_${service.id}`, // Prefix to distinguish from inventory items
          name: service.eng,
          description: service.bm,
          price: price,
          quantity: 999,
          barcode: null,
          created_at: service.created_at,
          updated_at: service.updated_at,
          category: { id: 'services', name: 'Services' },
          type: { id: 'service', name: 'Service' },
          isService: true,
          originalServiceId: service.id, // Keep original ID for editing
          image_url: service.image_url
        };
      }) || [];

      // Combine inventory and services
      const combinedData = [...(inventoryResult || []), ...transformedServices];
      
      return combinedData;
    }
  });

  const { data: serviceCharges } = useQuery({
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (item) => {
    if (item.isService) {
      if (isSuperAdmin) {
        setSelectedItem(item);
        // Initialize edit prices for all service charges of this service
        const servicePrices: {[key: string]: string} = {};
        serviceCharges?.filter(charge => charge.category_id === item.originalServiceId)
          .forEach(charge => {
            servicePrices[charge.id.toString()] = charge.fee?.toString() || '';
          });
        setEditPrices(servicePrices);
        setIsEditDialogOpen(true);
      } else if (isTPSite && item.originalServiceId === 5) {
        setSelectedItem(item);
        // Initialize edit prices for binding service charges only
        const servicePrices: {[key: string]: string} = {};
        serviceCharges?.filter(charge => charge.category_id === item.originalServiceId)
          .forEach(charge => {
            servicePrices[charge.id.toString()] = charge.fee?.toString() || '';
          });
        setEditPrices(servicePrices);
        setIsEditDialogOpen(true);
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit this service",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cannot Edit",
        description: "Only services can be edited",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "No item selected",
        variant: "destructive",
      });
      return;
    }

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

      if (selectedItem.isService) {
        // Update multiple service charges
        const updatePromises = Object.entries(editPrices).map(async ([chargeId, priceStr]) => {
          const newPrice = parseFloat(priceStr);
          if (isNaN(newPrice) || newPrice < 0) {
            throw new Error(`Invalid price for service charge ID ${chargeId}`);
          }

          return supabase
            .from('nd_service_charge')
            .update({ 
              fee: newPrice,
              updated_by: userId,
              updated_at: new Date().toISOString()
            })
            .eq('id', parseInt(chargeId));
        });

        const results = await Promise.all(updatePromises);
        
        // Check for errors
        const hasError = results.some(result => result.error);
        if (hasError) {
          throw new Error("Failed to update some service prices");
        }
      } else {
        const singlePrice = editPrices['single'] || '';
        const newPrice = parseFloat(singlePrice);

        if (isNaN(newPrice) || newPrice < 0) {
          toast({
            title: "Error",
            description: "Please enter a valid positive number",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('nd_inventory')
          .update({ 
            price: newPrice,
            updated_by: userId,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedItem.id);

        if (error) {
          throw error;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['inventories'] });

      toast({
        title: "Success",
        description: `Price${selectedItem.isService ? 's' : ''} updated successfully for ${selectedItem.name}`,
        variant: "default",
      });

      setIsEditDialogOpen(false);
      setSelectedItem(null);
      setEditPrices({});

    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update price. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditImage = (item) => {
    if (item.isService && isSuperAdmin) {
      setSelectedImageItem(item);
      setImagePreview(item.image_url || "");
      setIsEditImageDialogOpen(true);
    } else {
      toast({
        title: "Access Denied",
        description: "Only super admins can edit service images",
        variant: "destructive",
      });
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateImage = async () => {
    if (!selectedImageItem) {
      toast({
        title: "Error",
        description: "No item selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingImage(true);
      let imageUrl = selectedImageItem.image_url;

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

      // Upload new image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${selectedImageItem.originalServiceId}_${Date.now()}.${fileExt}`;

        // Delete old image if exists
        if (selectedImageItem.image_url) {
          const oldFileName = selectedImageItem.image_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('service-images')
              .remove([oldFileName]);
          }
        }

        // Upload new image
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('service-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('service-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Update service record
      const { error } = await supabase
        .from('nd_category_service')
        .update({ 
          image_url: imageUrl,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedImageItem.originalServiceId);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['inventories'] });

      toast({
        title: "Success",
        description: "Service image updated successfully",
        variant: "default",
      });

      setIsEditImageDialogOpen(false);
      setSelectedImageItem(null);
      setImageFile(null);
      setImagePreview("");

    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!selectedImageItem || !selectedImageItem.image_url) {
      toast({
        title: "Error",
        description: "No image to remove",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingImage(true);

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

      // Delete image from storage
      const fileName = selectedImageItem.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('service-images')
          .remove([fileName]);
      }

      // Update service record to remove image_url
      const { error } = await supabase
        .from('nd_category_service')
        .update({ 
          image_url: null,
          updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedImageItem.originalServiceId);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['inventories'] });

      toast({
        title: "Success",
        description: "Service image removed successfully",
        variant: "default",
      });

      setImagePreview("");
      setImageFile(null);

    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (inventoryData) {
      setInventories(inventoryData);
      setFilteredInventories(inventoryData);
    }
  }, [inventoryData]);

  useEffect(() => {
    if (!inventories) {
      setFilteredInventories([]);
      return;
    }

    let filtered = [...inventories];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        const productIdMatch = formatProductId(item).toLowerCase().includes(searchLower);
        const nameMatch = item.name?.toLowerCase().includes(searchLower);
        const typeMatch = item.type?.name?.toLowerCase().includes(searchLower);
        const categoryMatch = item.category?.name?.toLowerCase().includes(searchLower);
        const barcodeMatch = item.barcode?.toLowerCase().includes(searchLower);
        const priceMatch = item.price?.toString().includes(searchTerm);
        const stockMatch = item.quantity?.toString().includes(searchTerm);

        return productIdMatch || nameMatch || typeMatch || barcodeMatch || categoryMatch || priceMatch || stockMatch;
      });
    }

    // Apply dropdown filters
    filtered = filtered.filter(item => {
      const productIdMatch = appliedProductIdFilters.length > 0
        ? appliedProductIdFilters.includes(formatProductId(item))
        : true;
      
      const nameMatch = appliedNameFilters.length > 0
        ? appliedNameFilters.includes(item.name || "")
        : true;
      
      const categoryMatch = appliedCategoryFilters.length > 0
        ? appliedCategoryFilters.includes(item.category?.name || "")
        : true;
      
      const priceMatch = appliedPriceFilters.length > 0
        ? appliedPriceFilters.includes(item.price?.toFixed(2) || "")
        : true;
      
      const stockMatch = appliedStockFilters.length > 0
        ? appliedStockFilters.includes(item.quantity?.toString() || "")
        : true;
      
      const barcodeMatch = appliedBarcodeFilters.length > 0
        ? appliedBarcodeFilters.includes(item.barcode || "")
        : true;

      return productIdMatch && nameMatch && categoryMatch && priceMatch && stockMatch && barcodeMatch;
    });

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let valueA, valueB;

        switch (sortField) {
          case "productId":
            valueA = formatProductId(a);
            valueB = formatProductId(b);
            break;
          case "name":
            valueA = a.name || "";
            valueB = b.name || "";
            break;
          case "category":
            valueA = a.category?.name || "";
            valueB = b.category?.name || "";
            break;
          case "price":
            valueA = a.price || 0;
            valueB = b.price || 0;
            break;
          case "quantity":
            valueA = a.quantity || 0;
            valueB = b.quantity || 0;
            break;
          case "barcode":
            valueA = a.barcode || "";
            valueB = b.barcode || "";
            break;
          case "created_at":
            valueA = new Date(a.created_at);
            valueB = new Date(b.created_at);
            break;
          default:
            valueA = a[sortField] || "";
            valueB = b[sortField] || "";
        }

        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
    
    setFilteredInventories(filtered);
  }, [inventories, searchTerm, appliedProductIdFilters, appliedNameFilters, appliedCategoryFilters, appliedPriceFilters, appliedStockFilters, appliedBarcodeFilters, sortField, sortDirection]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Product ID Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <FileText className="h-4 w-4 text-gray-500" />
                Product ID
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search product IDs..." />
                <CommandList>
                  <CommandEmpty>No product IDs found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {inventories && Array.from(
                      new Set(inventories.map(item => formatProductId(item)))
                    ).sort().map((productId) => (
                      <CommandItem
                        key={productId}
                        onSelect={() => {
                          setSelectedProductIdFilters(
                            selectedProductIdFilters.includes(productId)
                              ? selectedProductIdFilters.filter(item => item !== productId)
                              : [...selectedProductIdFilters, productId]
                          );
                        }}
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          selectedProductIdFilters.includes(productId)
                            ? "bg-primary border-primary"
                            : "opacity-50"
                        )}>
                          {selectedProductIdFilters.includes(productId) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {productId}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Product Name Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Package className="h-4 w-4 text-gray-500" />
                Name
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search names..." />
                <CommandList>
                  <CommandEmpty>No names found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {inventories && Array.from(
                      new Set(inventories.map(item => item.name).filter(Boolean))
                    ).sort().map((name) => (
                      <CommandItem
                        key={name}
                        onSelect={() => {
                          setSelectedNameFilters(
                            selectedNameFilters.includes(name)
                              ? selectedNameFilters.filter(item => item !== name)
                              : [...selectedNameFilters, name]
                          );
                        }}
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          selectedNameFilters.includes(name)
                            ? "bg-primary border-primary"
                            : "opacity-50"
                        )}>
                          {selectedNameFilters.includes(name) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Category Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-10"
              >
                <Box className="h-4 w-4 text-gray-500" />
                Category
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {inventories && Array.from(
                      new Set(inventories.map(item => item.category?.name).filter(Boolean))
                    ).sort().map((category) => (
                      <CommandItem
                        key={category}
                        onSelect={() => {
                          setSelectedCategoryFilters(
                            selectedCategoryFilters.includes(category)
                              ? selectedCategoryFilters.filter(item => item !== category)
                              : [...selectedCategoryFilters, category]
                          );
                        }}
                      >
                        <div className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/30",
                          selectedCategoryFilters.includes(category)
                            ? "bg-primary border-primary"
                            : "opacity-50"
                        )}>
                          {selectedCategoryFilters.includes(category) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        {category}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            className="flex items-center gap-2 h-10"
            onClick={handleResetFilters}
          >
            <RotateCcw className="h-4 w-4 text-gray-500" />
            Reset
          </Button>
        </div>

        <Button
          variant="secondary"
          className="flex items-center gap-2 ml-auto"
          onClick={() => {
            setAppliedProductIdFilters(selectedProductIdFilters);
            setAppliedNameFilters(selectedNameFilters);
            setAppliedCategoryFilters(selectedCategoryFilters);
            setAppliedPriceFilters(selectedPriceFilters);
            setAppliedStockFilters(selectedStockFilters);
            setAppliedBarcodeFilters(selectedBarcodeFilters);

            toast({
              title: "Filters applied",
              description: `${getActiveFilterCount()} filters applied`,
            });
          }}
        >
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center mb-4">
          {appliedProductIdFilters.length > 0 && (
            <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
              <span>Product ID: {appliedProductIdFilters.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setAppliedProductIdFilters([]);
                  setSelectedProductIdFilters([]);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {appliedNameFilters.length > 0 && (
            <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
              <span>Name: {appliedNameFilters.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setAppliedNameFilters([]);
                  setSelectedNameFilters([]);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {appliedCategoryFilters.length > 0 && (
            <Badge variant="outline" className="gap-1 px-3 py-1 h-6">
              <span>Category: {appliedCategoryFilters.length}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setAppliedCategoryFilters([]);
                  setSelectedCategoryFilters([]);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("productId")}
                  >
                    <div className="flex items-center">
                      Product ID
                      {sortField === "productId" ? (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Product Name
                      {sortField === "name" ? (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center">
                      Category
                      {sortField === "category" ? (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      {sortField === "price" ? (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("quantity")}
                  >
                    <div className="flex items-center">
                      Stock
                      {sortField === "quantity" ? (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("barcode")}
                  >
                    <div className="flex items-center">
                      Barcode
                      {sortField === "barcode" ? (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Created At
                      {sortField === "created_at" ? (
                        <span className="ml-2">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  {(isSuperAdmin || isTPSite) && (
                    <TableHead>Action</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventories.length > 0 ? (
                  filteredInventories.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{formatProductId(item)}</TableCell>
                      <TableCell>{item.name || 'N/A'}</TableCell>
                      <TableCell>{item.category?.name || 'N/A'}</TableCell>
                      <TableCell>{item.price ? `RM ${item.price.toFixed(2)}` : 'N/A'}</TableCell>
                      <TableCell>{item.quantity || 0}</TableCell>
                      <TableCell>{item.barcode || 'N/A'}</TableCell>
                      <TableCell>
                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      {(isSuperAdmin || (isTPSite && item.isService && item.originalServiceId === 5)) && item.isService && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Price</TooltipContent>
                            </Tooltip>

                            {isSuperAdmin && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditImage(item)}
                                  >
                                    <ImageIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Image</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Price Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.isService ? 'Edit Service Prices' : 'Edit Product Price'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">
                  {selectedItem.isService ? 'Service Name' : 'Product Name'}
                </Label>
                <Input
                  id="itemName"
                  value={selectedItem.name}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              {selectedItem.isService ? (
                // Show all service charges for this service
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Service Options & Prices</Label>
                  {serviceCharges?.filter(charge => charge.category_id === selectedItem.originalServiceId).map((charge, index) => (
                    <div key={charge.id} className="border rounded-lg p-4 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`description-${charge.id}`}>Description</Label>
                        <Input
                          id={`description-${charge.id}`}
                          value={charge.description}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`currentPrice-${charge.id}`}>Current Price</Label>
                        <Input
                          id={`currentPrice-${charge.id}`}
                          value={`RM ${charge.fee?.toFixed(2) || '0.00'}`}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`newPrice-${charge.id}`}>New Price (RM)</Label>
                        <Input
                          id={`newPrice-${charge.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter new price"
                          value={editPrices[charge.id] || ''}
                          onChange={(e) => setEditPrices(prev => ({
                            ...prev,
                            [charge.id]: e.target.value
                          }))}
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show single price for regular products
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currentPrice">Current Price</Label>
                    <Input
                      id="currentPrice"
                      value={`RM ${selectedItem.price?.toFixed(2) || '0.00'}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPrice">New Price (RM)</Label>
                    <Input
                      id="newPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter new price"
                      value={editPrices['single'] || ''}
                      onChange={(e) => setEditPrices(prev => ({...prev, single: e.target.value}))}
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedItem(null);
                setEditPrices({});
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleUpdatePrice}
              disabled={selectedItem?.isService ? 
                Object.keys(editPrices).length === 0 || 
                Object.values(editPrices).some(price => !price || parseFloat(price as string) < 0) :
                !editPrices['single'] || parseFloat(editPrices['single'] as string) < 0
              }
            >
              Update Price{selectedItem?.isService ? 's' : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={isEditImageDialogOpen} onOpenChange={setIsEditImageDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service Image</DialogTitle>
          </DialogHeader>
          {selectedImageItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={selectedImageItem.name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Current Image</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Service preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                      disabled={isUploadingImage}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">No image uploaded</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUpload">Upload New Image</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditImageDialogOpen(false);
                setSelectedImageItem(null);
                setImageFile(null);
                setImagePreview("");
              }}
              disabled={isUploadingImage}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleUpdateImage}
              disabled={isUploadingImage || !imageFile}
            >
              {isUploadingImage ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Update Image
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;