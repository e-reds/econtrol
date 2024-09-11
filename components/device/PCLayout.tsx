import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { createClient } from '@/utils/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { IconDragDrop, IconList, IconMap } from '@tabler/icons-react';

interface PC {
  id: string;
  number: string;
  position: { x: number; y: number };
  status: 'available' | 'occupied' | 'maintenance';
  group: number;
  sessionId?: string;
}

interface Session {
  id: string;
  client_id: string;
  pc_number: string;
  pc_id: string;
  status: 'active' | 'inactive';
}

interface Client {
  id: string;
  name: string;
  nickname?: string;
}

interface PCLayoutProps {
  pcs: PC[];
  onPcSelect: (pc: PC) => void;
  onUpdatePCPosition: (pcId: string, newPosition: { x: number; y: number }) => void;
}

const PCLayout: React.FC<PCLayoutProps> = ({ pcs: initialPcs, onPcSelect, onUpdatePCPosition }) => {
  const [scale, setScale] = useState(1);
  const [dragEnabled, setDragEnabled] = useState(false);
  const [selectedPC, setSelectedPC] = useState<PC | null>(null);
  const [pcs, setPcs] = useState<PC[]>(initialPcs);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map'); // Controla el modo de visualización
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const GRID_SIZE = 100;

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / 1000;
      const scaleY = clientHeight / 800;
      setScale(Math.min(scaleX, scaleY));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    setPcs(initialPcs);
  }, [initialPcs]);

  // Fetch sessions and clients data
  useEffect(() => {
    const fetchSessionsAndClients = async () => {
      try {
        // Fetch active sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('status', 'active');

        if (sessionsError) throw sessionsError;
        setSessions(sessionsData || []);

        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*');

        if (clientsError) throw clientsError;
        setClients(clientsData || []);
      } catch (error) {
        console.error('Error fetching sessions and clients:', error);
      }
    };

    fetchSessionsAndClients();
  }, [supabase]);

  // Helper function to get client name
  const getClientNameForPC = (pcId: string) => {
    const activeSession = sessions.find(session => session.pc_id === pcId && session.status === 'active');
    if (activeSession) {
      const client = clients.find(client => client.id === activeSession.client_id);
      return client ? (client.nickname || client.name) : null; // Return nickname if available, otherwise name
    }
    return null;
  };
// Ordenar PCs por el número
const sortedPcs = [...pcs].sort((a, b) => {
  const numA = parseInt(a.number.replace(/\D/g, ''), 10); // Extraer solo los números
  const numB = parseInt(b.number.replace(/\D/g, ''), 10);
  return numA - numB; // Comparar numéricamente
});

  const alignToGrid = useCallback((position: { x: number; y: number }) => ({
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
  }), [GRID_SIZE]);

  const onDragStop = useCallback((id: string) => (e: DraggableEvent, data: DraggableData) => {
    const newPosition = alignToGrid({ x: data.x, y: data.y });
    onUpdatePCPosition(id, newPosition);
  }, [alignToGrid, onUpdatePCPosition]);

  const handlePcClick = useCallback((pc: PC) => {
    onPcSelect(pc);
    setSelectedPC(pc);
  }, [onPcSelect]);

  return (
    <div className="ml-4 bg-gray-800 text-white rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">PCS</h2>
        <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg">
          {/* Botón para alternar entre vista de mapa y lista */}
          <button
            className="bg-gray-600 p-2 rounded-md flex items-center"
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? <IconList size={20} /> : <IconMap size={20} />}
          </button>
          <Switch checked={dragEnabled} onCheckedChange={setDragEnabled} />
          <IconDragDrop size={20} className="text-white" />
        </div>
      </div>

      {/* Modo de visualización condicional: lista o mapa */}
      {viewMode === 'map' ? (
        <div ref={containerRef} className="w-[40vw] h-[80vh] relative overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: '70vw',
                height: '800px',
                position: 'absolute',
              }}
            >
              {pcs.map((pc) => (
                <Draggable
                  key={pc.id}
                  position={pc.position}
                  onStop={onDragStop(pc.id)}
                  bounds="parent"
                  grid={[GRID_SIZE, GRID_SIZE]}
                  disabled={!dragEnabled}
                >
                  <div
                    className={`pc-item pc-status-${pc.status} w-[90px] h-[90px] absolute flex flex-col justify-center items-center text-sm rounded-lg cursor-${dragEnabled ? 'move' : 'pointer'} select-none shadow-md transition-colors duration-300 p-2`}
                    style={{
                      backgroundColor:
                        pc.status === 'available' ? '#4A90E2' :
                          pc.status === 'occupied' ? '#FFB74D' : '#E57373',
                      color: 'white',
                    }}
                    onClick={() => handlePcClick(pc)}
                  >
                    {/* Número de la PC */}
                    <span className={pc.status === 'occupied' ? 'font-bold text-lg text-gray-900' : 'text-white font-bold text-lg' }>{pc.number}</span>
                    {/* Mostrar nombre del cliente si la PC está ocupada */}
                    {pc.status === 'occupied' && (
                      <span className="text-sm font-medium font-mono text-gray-900 mt-1 truncate">
                        {getClientNameForPC(pc.id) || 'Cargando...'}
                      </span>
                    )}
                  </div>
                </Draggable>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="w-[40vw]">
        {/* Vista de lista de PCs */}
        <table className="min-w-full divide-y divide-gray-700">
          <thead className='bg-gray-700'>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">PC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Grupo</th>
            </tr>
          </thead>
        </table>
        <ScrollArea className="h-[70vh]">
          <table className="min-w-full divide-y divide-gray-700">

            <tbody className="divide-y divide-gray-700">
              {sortedPcs.map((pc) => (
                <tr key={pc.id} className="hover:bg-gray-700 cursor-pointer" onClick={() => handlePcClick(pc)}>
                  <td className="p-1 whitespace-nowrap text-sm font-medium text-white">{pc.number}</td>
                  <td className={pc.status === 'available' ? 'p-1 whitespace-nowrap text-sm text-gray-500' : 'p-1 whitespace-nowrap text-sm text-yellow-500'}>
                   {/*  {pc.status === 'available' ? 'Disponible' :
                      pc.status === 'occupied' ? 'Ocupado' : 'Mantenimiento'} */}
                      {getClientNameForPC(pc.id) || 'Disponible'}
                  </td>
                  <td className="p-1 whitespace-nowrap text-sm text-gray-400">{pc.group}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>
      )}
    </div>
  );
};

export default PCLayout;
