import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/utils/supabase/client';  // Asegúrate de importar tu cliente Supabase

interface PC {
  id: string;
  number: string;
  position: { x: number; y: number };
  status: 'available' | 'occupied' | 'maintenance';
  group: number;
  sessionId?: string;
}

interface MoveSessionPopoverProps {
  selectedPC: PC;
  moveSessionToPC: (targetPC: PC) => void;
}

const MoveSessionPopover: React.FC<MoveSessionPopoverProps> = ({ selectedPC, moveSessionToPC }) => {
  const [pcs, setPcs] = useState<PC[]>([]);
  const [loading, setLoading] = useState(false); // Estado para controlar el estado de carga
  const supabase = createClient();

  // Función para consultar las PCs disponibles
  const fetchPCs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pcs').select('*').eq('status', 'available');
      if (error) {
        console.error('Error fetching PCs:', error);
      } else {
        setPcs(data || []);
      }
    } catch (error) {
      console.error('Error fetching PCs:', error);
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  };

  // Función que se dispara al abrir el popover
  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchPCs(); // Ejecuta la consulta cuando el popover se abre
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange} >
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md">
          Mover PC
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-3 bg-gray-900 text-white ">
        <h3 className="text-md font-mono font-semibold text-gray-400 mb-2">
          Mover {selectedPC.number}
        </h3>

        {/* Muestra un mensaje de carga mientras se obtienen los datos */}
        {loading ? (
          <p className="text-sm text-gray-500">Cargando PCs...</p>
        ) : (
          <ScrollArea className="h-70 p-2  ">
            {pcs.length > 0 ? (
                <div className='grid grid-cols-5 gap-2'>
             { pcs
                .sort((a, b) => {
                  // Extraer el número de la PC eliminando el prefijo "PC"
                  const numA = parseInt(a.number.replace("PC", ""), 10);
                  const numB = parseInt(b.number.replace("PC", ""), 10);
                  return numA - numB; // Ordenar de menor a mayor
                })
                .map((pc) => (
                  <Button
                    key={pc.id}
                    onClick={() => moveSessionToPC(pc)}
                    variant="ghost"
                    className="w-full h-12 mt-2 px-1 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-md flex justify-center items-center"
                  >
                    <span className='text-xs text-black text-semibold'>{pc.number}</span>
                  </Button>
                ))}
                </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No hay PCs disponibles.</p>
            )}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MoveSessionPopover;
