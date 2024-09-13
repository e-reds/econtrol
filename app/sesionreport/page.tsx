import { Hero } from "@/components/Hero";
import ProductsReport from "@/components/Products/ProductsReport";
import SessionReport from "@/components/sesiones/SessionReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    return (
      <div className="container mx-auto pt-4">
      {
        session ? (
          <><Tabs defaultValue="account" className="container">
            <TabsList>
              <TabsTrigger value="debits">Ventas</TabsTrigger>
              <TabsTrigger value="report">Productos</TabsTrigger>
            </TabsList>
            <TabsContent value="debits">
             <SessionReport />
            </TabsContent>
            <TabsContent value="report">
              <ProductsReport />
            </TabsContent>
          </Tabs></>
        )
          : <Hero />
      }

    </div>
    );
}