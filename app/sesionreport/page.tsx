import { Hero } from "@/components/Hero";
import SessionReport from "@/components/sesiones/SessionReport";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    return (
        <div>
             {
        session ? (
            <SessionReport/>
        )
        : <Hero />
      }
            
        </div>
    );
}