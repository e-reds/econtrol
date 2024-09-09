import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { createClient } from '@/utils/supabase/client';
import { IconDeviceFloppy, IconDotsCircleHorizontal  } from '@tabler/icons-react';
import PaymentDetail from './paymentdetail';

const supabase = createClient();

interface ResumenPagoProps {
  montoTotal: number;
  adelantos: number;
  totalAPagar: number;
  sessionid: string;
  observation?: string;
  yape?: number;
  plin?: number;
  cash?: number;
}

export default function TotalsAmount({
  montoTotal = 1000,
  adelantos = 200,
  totalAPagar = 800,
  sessionid = '',
  observation = '',
  yape = 0,
  plin = 0,
  cash = 0
}: ResumenPagoProps) {
  const [observaciones, setObservaciones] = useState(observation);
  const [isSaving, setIsSaving] = useState(false); // Para manejar el estado de guardado

  const updateSessionObservation = async (sessionId: string, observation: string) => {
    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('sessions')
        .update({ observation })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      console.log('Observation updated successfully');
      setIsSaving(false);
      return data;
    } catch (error) {
      console.error('Error updating observation:', error);
      setIsSaving(false);
      throw error;
    }
  };

  const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservaciones(e.target.value);
  };

  const handleSaveObservation = async () => {
    if (observaciones.trim() !== '' && sessionid) {
      try {
        await updateSessionObservation(sessionid, observaciones.trim());
        console.log('Observation updated');
      } catch (error) {
        console.error('Failed to update observation:', error);
      }
    }
  };

  useEffect(() => {
    setObservaciones(observation);
  }, [observation]);

  return (
    <div className="bg-slate-900 p-2 rounded-lg shadow-lg max-w-4xl mx-auto mt-2">
      <h2 className="text-sm font-mono text-slate-100">Resumen de Pago</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-4 font-mono text-sm">
        <div className="bg-slate-600 p-4 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Monto Total</span>
            <span className="text-right text-white font-bold">{`S/ ${montoTotal.toFixed(2)}`}</span>
          </div>
        </div>
        <div className="bg-slate-600 p-4 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Adelanto</span>
            <span className="text-right text-green-400 font-bold">{`S/ ${adelantos.toFixed(2)}`}</span>
          </div>
        </div>
        <div className="bg-slate-600 p-4 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Total Cobrar</span>
            <span className="text-right text-red-400 font-bold">{`S/ ${totalAPagar.toFixed(2)}`}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between ...">       
        <div className="text-slate-300 mb-2  mt-2 font-mono">Observaciones</div>
        {montoTotal > 0 && 
         <div className="text-slate-300 mb-2 mt-2 font-mono order-last flex gap-1">Info <PaymentDetail sessionid={sessionid} yape={yape} plin={plin} cash={cash} />
        </div>
        }       
      </div>
      <div className="mt flex items-center">
        <div className="relative w-full flex">
          <Textarea
            id="observaciones"
            placeholder="Agregar observaciones..."
            value={observaciones}
            onChange={handleObservationChange}
            className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
            rows={2}
          />
          <button
            onClick={handleSaveObservation}
            disabled={isSaving}
            className={`absolute right-2 top-2 p-2 text-slate-100 hover:text-blue-400 transition ${isSaving ? 'cursor-not-allowed' : ''
              }`}
            aria-label="Guardar observaciones"
          >
            <IconDeviceFloppy className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
