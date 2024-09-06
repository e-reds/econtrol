import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Clientlist } from './Clientlist';
import { Productlist } from './Productlist';
import { IconSquareLetterX } from '@tabler/icons-react';
import { ScrollArea } from '@radix-ui/react-scroll-area';
interface PC {
  id: string;
  number: string;
  position: { x: number; y: number };
  group: number;
  status: 'available' | 'occupied' | 'maintenance';
}

interface Session {
  id: string;
  client_id: string;
  pc_number: string;
  start_time?: string;
  end_time?: string;
  mode?: string;
  total_amount?: number;
  pc_id: string;
  status: 'active' | 'inactive';
}

interface Consumption {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface PCDetailProps {
  selectedPC: PC | null;
  onUpdatePCStatus: (pcId: string, status: string) => void;
}

const PCDetail: React.FC<PCDetailProps> = ({ selectedPC, onUpdatePCStatus }) => {
  const supabase = createClient();
  const [status, setStatus] = useState<'available' | 'occupied' | 'maintenance'>('available');
  const [clientId, setClientId] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [currentClient, setCurrentClient] = useState<any | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (selectedPC) {
      console.log(selectedPC);
      setStatus(selectedPC.status);
      fetchCurrentSession(selectedPC.id);
    }
  }, [selectedPC]);

  useEffect(() => {
    if (currentSession) {
      fetchClients();
    }
  }, [currentSession]);

  useEffect(() => {
    calculateTotalAmount();
  }, [consumptions]);

  const fetchCurrentSession = async (pcId: string) => {
   try {
     const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('pc_id', pcId)
      .eq('status', 'active')
      .maybeSingle();
    if (error) {
      console.error('Error fetching current session:', error);
    } else {
      setCurrentSession(data);
      setClientId(data?.client_id || '');
      if (data) {
        console.log(data.id);
        fetchConsumptions(data.id);
      } else {
        setConsumptions([]);
      }
    }
   } catch (error) {
     console.error('Error fetching current session:', error);
   }
   
  };

  const fetchConsumptions = async (sessionId: string) => {
    try {
       const { data, error } = await supabase
      .from('consumptions')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error fetching consumptions:', error);
    } else {
      console.log(data);
      setConsumptions(data || []);
    }
    } catch (error) {
      console.error('Error fetching consumptions:', error);
    }
   
  };

  const fetchClients = async () => {
    try {
       const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single();
    if (error) console.error('Error fetching clients:', error);
    else setCurrentClient(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
   
  };

  const handleOpenSession = async () => {
    if (!selectedPC || !clientId) return;
try {
  const { data, error } = await supabase
      .from('sessions')
      .insert({
        client_id: clientId,
        pc_number: selectedPC.number,
        start_time: new Date().toISOString(),
        pc_id: selectedPC.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error opening session:', error);
    } else {
      setStatus('occupied');
      onUpdatePCStatus(selectedPC.id, 'occupied');
      setCurrentSession(data);
      alert(`Session opened for client ${clientId} on PC ${selectedPC.number}`);
      fetchConsumptions(data.id);
    }
} catch (error) {
  console.error('Error opening session:', error);
}
    
  };
  const handleUpdatePCStatus = async (status: string) => {
    try {
      const { data, error } = await supabase
      .from('pcs')
      .update({ status: status })
      .eq('id', selectedPC?.id)
      .select()
    } catch (error) {
      console.error('Error updating PC status:', error);
    }
    
  }
  const handleCloseSession = async () => {
    if (!selectedPC || !currentSession) return;
try {
   const { error } = await supabase
      .from('sessions')
      .update({
        end_time: new Date().toISOString(),
        total_amount: totalAmount,
        status: 'inactive',
      })
      .eq('id', currentSession.id);

    if (error) {
      console.error('Error closing session:', error);
    } else {
      setStatus('available');
      onUpdatePCStatus(selectedPC.id, 'available');
      setCurrentSession(null);
      setConsumptions([]);
      alert(`Session closed for client ${currentSession.client_id} on PC ${selectedPC.number}`);
    }
} catch (error) {
  console.error('Error closing session:', error);
}
   
  };

  const handleRemoveConsumption = async (consumptionId: string) => {
    try {
      const { error } = await supabase
      .from('consumptions')
      .delete()
      .eq('id', consumptionId);

    if (error) {
      console.error('Error removing consumption:', error);
    } else {
      setConsumptions(consumptions.filter(c => c.id !== consumptionId));
    }
    } catch (error) {
      console.error('Error removing consumption:', error);
    }
    
  };

  const handleUpdateQuantity = async (consumptionId: string, newQuantity: number) => {
    try {
       const { error } = await supabase
      .from('consumptions')
      .update({ quantity: newQuantity })
      .eq('id', consumptionId);

    if (error) {
      console.error('Error updating quantity:', error);
    } else {
      setConsumptions(consumptions.map(c => c.id === consumptionId ? { ...c, quantity: newQuantity } : c));
    }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
   
  };

  const calculateTotalAmount = () => {
    const total = consumptions.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    setTotalAmount(total);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto h-full">
      <p className="text-lg font-semibold">
        <strong>PC:</strong> {selectedPC?.number}
      </p>

      <div className="mt-6">
        {status === 'available' && !currentSession ? (
          <>
            <Clientlist clientId={clientId} setClientId={setClientId} />
            <button
              onClick={handleOpenSession}
              disabled={!clientId}
              className={`mt-4 w-full py-2 px-4 text-white rounded-md ${clientId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'}`}
            >
              Aceptar
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleCloseSession}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Terminar
              </button>
              <Productlist
                sessionId={currentSession?.id || ''}
                group={selectedPC?.group || 1} 
                onProductAdded={() => fetchConsumptions(currentSession?.id || '')}
              />
            </div>

            {currentSession && currentSession.id !== null && (
              <div className="mt-6 bg-gray-700 p-4 rounded-lg shadow-inner">
                <p>Cliente:<span className='text-blue-500 ml-2'><strong>{currentClient?.name || 'Loading...'}</strong></span> </p>
                <p>Inicio: <span className='text-blue-500 ml-2 text-xs'>{new Date(currentSession.start_time || '').toLocaleString()}</span></p>
                {currentSession.end_time && (
                  <p><strong>End Time:</strong> {new Date(currentSession.end_time).toLocaleString()}</p>
                )}
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2">Productos Consumidos</h3>
              <ul className="space-y-1">

                <ScrollArea className="max-h-[400px] overflow-y-auto rounded-md p-4 shadow-sm bg-gray-500">
                  {consumptions.map((consumption) => (
                    <li
                      key={consumption.id}
                      className="flex justify-between items-center bg-gray-700 p-2 rounded-md shadow text-xs mb-1"
                    >
                      <span>{consumption.product_name} - {consumption.quantity} x S/ {consumption.price.toFixed(2)}</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={consumption.quantity}
                          onChange={(e) => handleUpdateQuantity(consumption.id, parseInt(e.target.value))}
                          className="w-12 text-center bg-gray-800 border border-gray-600 rounded-md p-1"
                        />

                        <IconSquareLetterX onClick={() => handleRemoveConsumption(consumption.id)} className='cursor-pointer hover:text-red-500' />
                      </div>
                    </li>
                  ))}
              </ScrollArea>
            </ul>
            <p className="text-sm  mt-4">
              Monto total: <strong className='text-blue-500'>S/ {totalAmount}</strong> 
            </p>
          </div>
      </>
        )}
    </div>
    </div >
  );
  
};

export default PCDetail;