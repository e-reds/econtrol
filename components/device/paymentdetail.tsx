import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { IconDotsCircleHorizontal } from '@tabler/icons-react';

const supabase = createClient();

interface PaymentDetailProps {
  sessionid: string;
  yape?: number;
  plin?: number;
  cash?: number;
}

export default function PaymentDetail({ sessionid, yape = 0, plin = 0, cash = 0 }: PaymentDetailProps) {
  const [yapeAmount, setYapeAmount] = useState(yape);
  const [plinAmount, setPlinAmount] = useState(plin);
  const [cashAmount, setCashAmount] = useState(cash);
  const [isSaving, setIsSaving] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Función para obtener los valores actualizados de la sesión
  const fetchSessionPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('yape, plin, cash')
        .eq('id', sessionid)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setYapeAmount(data.yape || 0);
        setPlinAmount(data.plin || 0);
        setCashAmount(data.cash || 0);
      }
    } catch (error) {
      console.error('Error fetching session payments:', error);
    }
  };

  // Actualiza los campos de pago en la base de datos
  const updateSessionPayments = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('sessions')
        .update({
          yape: yapeAmount,
          plin: plinAmount,
          cash: cashAmount,
        })
        .eq('id', sessionid);

      if (error) {
        throw error;
      }

      console.log('Payments updated successfully');
    } catch (error) {
      console.error('Error updating payments:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cada vez que se abra el Popover, se consulta la sesión para traer los valores actualizados
  const handlePopoverOpenChange = (open: boolean) => {
    setIsPopoverOpen(open);
    if (open) {
      fetchSessionPayments();
    }
  };

  return (
    <Popover onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <IconDotsCircleHorizontal className='cursor-pointer hover:text-blue-600'/>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-slate-900 rounded-lg shadow-lg">
        <div className="space-y-4">
          <div className='flex justify-between gap-2'>
            <Label htmlFor="yape" className="text-slate-300 mt-2 w-1/3">Yape</Label>
            <Input
              id="yape"
              type="number"
              value={yapeAmount}
              onChange={(e) => setYapeAmount(Number(e.target.value))}
              className=" bg-slate-700 text-slate-100 placeholder-slate-400 h-8"
            />
          </div>
          <div className='flex justify-between gap-2'>
            <Label htmlFor="plin" className="text-slate-300 mt-3 w-1/3">Plin</Label>
            <Input
              id="plin"
              type="number"
              value={plinAmount}
              onChange={(e) => setPlinAmount(Number(e.target.value))}
              className="mt-1 bg-slate-700 text-slate-100 placeholder-slate-400 h-8"
            />
          </div>
          <div className='flex justify-between gap-2'>
            <Label htmlFor="cash" className="text-slate-300 mt-3 w-1/3">Cash</Label>
            <Input
              id="cash"
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(Number(e.target.value))}
              className="mt-1 bg-slate-700 text-slate-100 placeholder-slate-400 h-8"
            />
          </div>
          <Button
            onClick={updateSessionPayments}
            disabled={isSaving}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
