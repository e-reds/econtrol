"use client";

import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar el componente ScrollArea

interface ProductlistProps {
  sessionId: string;
  group: number;
  onProductAdded: () => void;
}

export function Productlist({ sessionId, group, onProductAdded }: ProductlistProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedProductId, setSelectedProductId] = React.useState("");
  const [products, setProducts] = React.useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const supabase = createClient();

  React.useEffect(() => {
    fetchProducts();
  }, [group]);

  const fetchProducts = async () => {
    try {
       const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`group.eq.${group},group.eq.1`);

    if (error) console.error("Error fetching products:", error);
    else {
      setProducts(data || []);
      setFilteredProducts(data || []);
    }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
   
  };

  const addProductToSession = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
try {
  const { error } = await supabase.from("consumptions").insert({
      session_id: sessionId,
      product_name: product.name,
      quantity: 1,
      price: product.price,
    });

    if (error) {
      console.error("Error adding product to session:", error);
    } else {
      onProductAdded();
    }
} catch (error) {
  console.error("Error adding product to session:", error);
}
    
  };

  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      const lowercaseQuery = query.toLowerCase();
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredProducts(filtered);
      console.log("filtered", filtered);
    },
    [products]
  );

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        variant={"ghost"}
        className="w-full justify-between bg-gray-900 text-white hover:bg-gray-900/60"
      >
        {selectedProductId
          ? products.find((product) => product.id === selectedProductId)?.name
          : "Buscar Producto..."}
        <span className="ml-2">▼</span>
      </Button>
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-900 rounded-md shadow-lg p-2">
          <Input
            type="text"
            placeholder="Buscar producto..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 "
          />
         
            {filteredProducts.length > 0 ? (
               <ScrollArea className="h-60 mt-3"> {/* No es necesario aplicar overflow-y-auto manualmente */}
              <div>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      setSelectedProductId(product.id);
                      addProductToSession(product.id);
                      setOpen(false);
                    }}
                    className="p-2 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors duration-200 rounded-md"
                  >
                    {product.name}
                  </div>
                  
                ))}
              </div>
              </ScrollArea>
            ) : (
              <div className="p-2 text-gray-500">No hay productos.</div>
            )}
         
        </div>
      )}
    </div>
  );
}
