"use client";
import React, { useEffect, useState } from 'react';
import PCLayout from './PCLayout';
import PCDetail from './PCDetail';
import SessionList from '../sesiones/Sessionlist';
import { createClient } from '@/utils/supabase/client';
interface PC {
    id: string;
    number: string;
    position: { x: number; y: number };
    status: 'available' | 'occupied' | 'maintenance';
    group: number;
  }
const PCClientWrapper: React.FC = () => {
  const supabase = createClient();
  const [pcs, setPcs] = useState<any[]>([]);
  const [selectedPC, setSelectedPC] = useState<PC | null>(null);
  const [updateSessions, setUpdateSessions] = useState(false); 

  useEffect(() => {
    console.log("PCs updated:", pcs); // Verificar que el estado se actualiza correctamente
  }, [pcs]);
  

  useEffect(() => {
    fetchPCs(); // Cargar todas las PCs al cargar el componente
  }, []);
  const fetchPCs = async () => {
    try {
       const { data, error } = await supabase.from('pcs').select('*');
    if (error) {
      console.error('Error fetching PCs:', error);
    } else {
      setPcs(data || []);
    }
    } catch (error) {
      console.error('Error fetching PCs:', error);
    }
   
  };
   // Función para actualizar el estado de una PC desde PCDetail
   const handleUpdatePCStatus = async (pcId: string, status: string) => {
    try {
      // Actualizar el estado de una PC específica
      const { data, error } = await supabase
        .from('pcs')
        .update({ status })
        .eq('id', pcId)
        .select();
  
      if (error) {
        console.error('Error updating PC status:', error);
      } else {
        console.log(data[0].number, data[0].status);
        
        // Después de actualizar el estado de la PC, vuelve a consultar todas las PCs
        const { data: allPCs, error: fetchError } = await supabase
          .from('pcs')
          .select('*'); // Consulta todas las PCs nuevamente
  
        if (fetchError) {
          console.error('Error fetching all PCs:', fetchError);
        } else {
          setPcs(allPCs || []); // Actualiza el estado con todas las PCs desde la base de datos
          console.log("PCs actualizadas:", allPCs);
  
          // Si la PC ahora está 'available', actualizamos las sesiones
          if (status === 'available') {
            setUpdateSessions((prev) => !prev);  // Forzar la actualización de las sesiones en SessionList
          }
        }
      }
    } catch (error) {
      console.error('Error updating PC status:', error);
    }
  };
  
  const handlePcSelect = (pc: PC) => {
    setSelectedPC(pc);
    console.log(pc);
  };
   // Función para actualizar la posición de una PC desde PCLayout
   const handleUpdatePCPosition = async (pcId: string, newPosition: { x: number, y: number }) => {
    try {
      const { data, error } = await supabase
      .from('pcs')
      .update({ position: newPosition })
      .eq('id', pcId)
      .select();

    if (error) {
      console.error('Error updating PC position:', error);
    } else {
      const updatedPCs = pcs.map((pc) =>
        pc.id === pcId ? { ...pc, position: newPosition } : pc
      );
      setPcs(updatedPCs); // Actualiza el estado global con la nueva posición     
    } 
    } catch (error) {
      console.error('Error updating PC position:', error);
    }
   
  };

  return (
    <div className='flex gap-3 mb-4'>
      <div className='flex-none'>
        <PCLayout pcs={pcs} onPcSelect={handlePcSelect} onUpdatePCPosition={handleUpdatePCPosition}/>
      </div>
      <div className='flex w-1/3 bg-gray-800 text-white p-6 rounded-lg shadow-md  mx-auto'>
      <SessionList selectedPC={selectedPC?.number || null} updateSessions={updateSessions} />
      </div>
      <div className='flex-1 w-1/3 mr-4'>
        <PCDetail selectedPC={selectedPC} onUpdatePCStatus={handleUpdatePCStatus}/>
      </div>
    </div>
  );
};

export default PCClientWrapper;
