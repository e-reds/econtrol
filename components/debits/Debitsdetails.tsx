import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconListDetails } from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface DebitsdetailsProps {
  debts_id: number; // Recibe el debts_id como prop para filtrar los registros
}

interface DebitDetail {
  created_at: string;
  debts_id: number;
  details: string;
  amount: number;
  payment_method: string;
}

export function Debitsdetails({ debts_id }: DebitsdetailsProps) {
  const [debitDetails, setDebitDetails] = useState<DebitDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchDebitsDetails = async () => {
      setLoading(true);
      let { data: debits_details, error } = await supabase
        .from('debits_details')
        .select('*')
        .eq('debts_id', debts_id); // Filtrar por debts_id

      if (error) {
        console.error("Error fetching debits details:", error);
        setLoading(false);
        return;
      }

      setDebitDetails(debits_details || []);
      setLoading(false);
    };

    fetchDebitsDetails();
  }, [debts_id]);

  // Calcular la sumatoria de amount
  const totalAmount = debitDetails.reduce((sum, detail) => sum + detail.amount, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"}>
          <IconListDetails size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-4 bg-gray-800 rounded-md shadow-lg">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-lg">Abonos</h4>
            <p className="text-sm text-muted-foreground">
              Mostrando abonos registrados
            </p>
          </div>

          {/* Mostrar un área de scroll para los detalles */}
          <ScrollArea className="max-h-48 border-t border-b">
            {loading ? (
              <p>Cargando...</p>
            ) : (
              debitDetails.length > 0 ? (
                debitDetails.map((detail) => (
                  <div
                    key={detail.created_at}
                    className="p-2 border-b gap-2 grid grid-cols-4 text-xs fort-mono"
                  >
                    <div className="flex flex-col">
                      <Label className="text-xs text-muted-foreground">Fecha:</Label>
                      <span>{format(new Date(detail.created_at), 'yyyy-MM-dd')}</span>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-xs text-muted-foreground">Monto:</Label>
                      <span className="font-bold text-green-600">S/{detail.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-xs text-muted-foreground">Método:</Label>
                      <span>{detail.payment_method}</span>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-xs text-muted-foreground">Detalles:</Label>
                      <span>{detail.details || "Ninguno"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay detalles disponibles</p>
              )
            )}
          </ScrollArea>

          {/* Footer con la sumatoria */}
          <div className="p-2 bg-gray-900 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Total Abonado:</span>
              <span className="font-bold text-lg text-green-600">S/{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
