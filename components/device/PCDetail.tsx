import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Clientlist } from './Clientlist';
import { Productlist } from './Productlist';
import MoveSessionPopover from './MoveSessionPopover';
import { CustomAlert } from '@/components/ui/customalert';
import TotalsAmount from './TotalsAmount';
import { ConsumOptions } from './Consumoptions';
import { CloseSession } from './CloseSession';
import { Button } from '@/components/ui/button';
import { IconSquarePlus } from '@tabler/icons-react';
import { Addclient } from './Addclient';
import Swal from 'sweetalert2';
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
  start_time: string;
  end_time?: string;
  mode: string;
  total_amount?: number;
  pc_id: string;
  status: string;
  advance_payment?: number;
  observation?: string;
  optional_client?: string;
  yape?: number;
  plin?: number;
  cash?: number;
  debt?: number;
  money_advance?: number;
}

interface Consumption {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  paid: boolean;
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
  const [totalAdvancePayment, setTotalAdvancePayment] = useState<number>(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const moveSessionToPC = async (targetPC: PC) => {
    if (!selectedPC || !currentSession?.id) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ pc_number: targetPC.number, pc_id: targetPC.id })
        .eq('id', currentSession.id);

      if (error) throw error;
      // Actualiza el estado de ambas PCs de forma secuencial
      onUpdatePCStatus(selectedPC.id, 'available');  // Marca la PC original como disponible
      onUpdatePCStatus(targetPC.id, 'occupied');     // Marca la PC de destino como ocupada     
      setCurrentSession(null);
      setStatus('available');
    } catch (err) {
      console.error('Error moving session:', err);
    }
  }

  const handleOpenSession = async () => {
    if (!selectedPC || !clientId) return;

    // Verifica si ya hay una sesión activa
    if (currentSession) {
      Swal.fire({
        icon: 'error',
        title: 'Ya hay una sesión activa',
        text: 'No se puede abrir una nueva sesión. Avise al administrador si ve este problema.',
        confirmButtonText: 'Aceptar'
      })
        return; // Salir si ya hay una sesión activa
    }

    setIsLoading(true); // Activar estado de carga

    try {
        // Verificar en la base de datos si ya existe una sesión activa para este PC
        const { data: existingSession, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('pc_id', selectedPC.id)
        .eq('status', 'active')
        .maybeSingle();
        if (sessionError) {
          Swal.fire({
            icon: 'error',
            title: 'Error al verificar la sesión',
            text: 'No se puede abrir una nueva sesión. Avise al administrador si ve este problema. '+sessionError.message+selectedPC.id,
            confirmButtonText: 'Aceptar'
          })
            console.error('Error checking existing session:', sessionError.message);
            return;
        }

        if (existingSession) {
            Swal.fire({
                icon: 'error',
                title: 'Ya hay una sesión activa',
                text: 'No se puede abrir una nueva sesión. Avise al administrador si ve este problema.',
                confirmButtonText: 'Aceptar'
            })
            return; // Salir si ya hay una sesión activa
        }

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
            fetchConsumptions(data.id);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error al abrir la sesión',
            text: 'No se puede abrir una nueva sesión. Avise al administrador si ve este problema.' + error,
            confirmButtonText: 'Aceptar'
        })
    } finally {
        setIsLoading(false); // Desactivar estado de carga
    }
  };

  const handleCloseSession = async () => {
    console.log(currentSession);
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
        /* alert(`Session closed for client ${currentSession.client_id} on PC ${selectedPC.number}`); */
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }

  };
  const handleOpenAlert = async () => {
    if (!selectedPC || !currentSession) return;
    setIsAlertOpen(true);
  }
  const handleDeleteSession = async () => {
    console.log(currentSession);
    if (!selectedPC || !currentSession) return;

    try {
      const { error: consumptionsError } = await supabase
        .from('consumptions')
        .delete()
        .eq('session_id', currentSession.id);

      if (consumptionsError) {
        throw consumptionsError;
      }

      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', currentSession.id);

      if (sessionError) {
        throw sessionError;
      }

      setStatus('available');
      onUpdatePCStatus(selectedPC.id, 'available');
      setCurrentSession(null);
      setConsumptions([]);
      console.log(`Session closed for client ${currentSession.client_id} on PC ${selectedPC.number}`);
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

  const handleUpdateQuantity = async (consumptionId: string, newQuantity: number, consumption: Consumption) => {
    try {
      const { error } = await supabase
        .from('consumptions')
        .update({ quantity: newQuantity, amount: newQuantity * consumption.price })
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
  const handleUpdatePaid = async (consumptionId: string, paid: boolean) => {
    try {
      // 1. Actualizar el campo 'paid' en la tabla 'consumptions'
      const { error: updateError } = await supabase
        .from('consumptions')
        .update({ paid: paid })
        .eq('id', consumptionId);

      if (updateError) {
        console.error('Error updating paid:', updateError);
        return; // Salir si hay un error
      }

      // 2. Actualizar el estado local
      setConsumptions(consumptions.map(c => c.id === consumptionId ? { ...c, paid: paid } : c));

      // 3. Calcular la suma de los amounts para la misma session_id
      console.log(currentSession?.id);
      const { data: consumptionData, error: fetchError } = await supabase
        .from('consumptions')
        .select('amount')
        .eq('session_id', currentSession?.id)
        .eq('paid', true);

      if (fetchError) {
        console.error('Error fetching consumptions:', fetchError);
        return; // Salir si hay un error
      }
      console.log(consumptionData);

      // Sumar los amounts
      const totalAdvancePayment = consumptionData.reduce((sum, consumption) => sum + consumption.amount, 0);
      console.log(totalAdvancePayment);



      const { error: updateSessionError } = await supabase
        .from('sessions')
        .update({ advance_payment: totalAdvancePayment })
        .eq('id', currentSession?.id);
      if (updateSessionError) {
        console.error('Error updating advance_payment:', updateSessionError);
      }
      else {
        let { data: sessions, error: sessionError } = await supabase
          .from('sessions')
          .select("*")

          // Filters
          .eq('id', currentSession?.id)
          .single();
        if (sessionError) {
          console.error('Error fetching sessions:', sessionError);
          return;
        } else {
          setCurrentSession(sessions);

        }
      }


    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };


  const calculateTotalAmount = () => {
    const total = consumptions.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
    setTotalAmount(total);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto h-full">
      <p className="text-lg font-semibold">
        Consumos de {selectedPC?.number}
      </p>
      <div className='flex justify-center'>
        <div className="mt-6 w-full">
          {status === 'available' && !currentSession ? (
            <>
              <div className='flex flex-row gap-2'>
                <div className='w-full'><Clientlist clientId={clientId} setClientId={setClientId} /></div>
                <div><Addclient/></div>
              </div>
              <button
                onClick={handleOpenSession}
                disabled={!clientId || isLoading} // Deshabilitar si está cargando
                className={`mt-4 w-full py-2 px-4 text-white rounded-md ${clientId && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'}`}
              >
                {isLoading ? 'Cargando...' : 'Aceptar'} {/* Cambiar texto mientras carga */}
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-between space-x-2 mb-4">
                <CloseSession
                  currentSession={currentSession}
                  selectedPC={selectedPC}
                  totalAmount={totalAmount}
                  totalAdvancePayment={currentSession?.advance_payment || 0}
                  onUpdatePCStatus={onUpdatePCStatus}
                  setStatus={setStatus}
                  setCurrentSession={setCurrentSession}
                  setConsumptions={setConsumptions}
                />
                {/*  <button
                  onClick={handleCloseSession}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  Terminar
                </button> */}
                <button
                  className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                  onClick={handleOpenAlert}
                >
                  Cancelar
                </button>
                {selectedPC && (
                  <MoveSessionPopover selectedPC={selectedPC} moveSessionToPC={moveSessionToPC} />
                )}
                <CustomAlert
                  title='Estas seguro de borrar esta sesión?'
                  isOpen={isAlertOpen}
                  setIsOpen={setIsAlertOpen}
                  onConfirm={handleDeleteSession}
                />
              </div>


              <Productlist
                sessionId={currentSession?.id || ''}
                group={selectedPC?.group || 1}
                onProductAdded={() => fetchConsumptions(currentSession?.id || '')}
              />
              {currentSession && currentSession.id !== null && (
                <div className="mt-6 bg-gray-700 p-4 rounded-lg shadow-inner ">
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

                  <ConsumOptions consumptions={consumptions} handleUpdatePaid={handleUpdatePaid} handleUpdateQuantity={handleUpdateQuantity} handleRemoveConsumption={handleRemoveConsumption} />
                </ul>
                <TotalsAmount montoTotal={totalAmount} adelantos={currentSession?.advance_payment || 0} totalAPagar={totalAmount - (currentSession?.advance_payment || 0)} sessionid={currentSession?.id || ''} observation={currentSession?.observation || ''} />
                {/* <p className="text-sm mt-4">
                  Monto total: <strong className="text-blue-500">S/ {totalAmount.toFixed(2)}</strong>
                </p>
                <p className="text-sm mt-2">
                  Adelantos: <strong className="text-green-500">S/ {currentSession?.advance_payment?.toFixed(2) || "0.00"}</strong>
                </p>
                <p className="text-sm mt-2">
                  Total a Cobrar: <strong className="text-red-500">
                    S/ {((totalAmount || 0) - (currentSession?.advance_payment || 0)).toFixed(2)}
                  </strong>
                </p> */}

              </div>
            </>
          )}
        </div>
      </div>

    </div >
  );

};

export default PCDetail;
