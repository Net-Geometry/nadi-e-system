import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Products = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold">Products</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products?.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Price: ${product.price}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Barcode: {product.barcode}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Products;
