import Debits from "@/components/debits/Debits";
import { Hero } from "@/components/Hero";
import { createClient } from "@/utils/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Reports from "@/components/debits/Reports";

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
              <TabsTrigger value="debits">Por Cliente</TabsTrigger>
              <TabsTrigger value="report">Reporte General</TabsTrigger>
            </TabsList>
            <TabsContent value="debits">
              <Debits />
            </TabsContent>
            <TabsContent value="report">
              <Reports />
            </TabsContent>
          </Tabs></>
        )
          : <Hero />
      }

    </div>
  );
}