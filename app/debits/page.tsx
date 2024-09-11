import Debits from "@/components/debits/Debits";
import { Hero } from "@/components/Hero";
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
            <Debits/>
        )
        : <Hero />
      }
            
        </div>
    );
}