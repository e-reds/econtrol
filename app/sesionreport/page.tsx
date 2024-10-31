import { Hero } from "@/components/Hero";
import ProductsReport from "@/components/Products/ProductsReport";
import SessionsByMonth from "@/components/sesiones/MonthlySessions";
import SessionChart from "@/components/sesiones/SessionChart";
import SessionReport from "@/components/sesiones/SessionReport";
/* import SessionsChart from "@/components/sesiones/SessionsChart"; */
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
              <TabsTrigger value="chart">Gráfico</TabsTrigger>
            </TabsList>
            <TabsContent value="debits">
             <SessionReport />
            </TabsContent>
            <TabsContent value="report">
              <ProductsReport />
            </TabsContent>
            <TabsContent value="chart">
              <SessionsByMonth />
            </TabsContent>
          </Tabs></>
        )
          : <Hero />
      }

    </div>
    );
}