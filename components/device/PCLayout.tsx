import React, { useState, useEffect, useRef, useCallback } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { createClient } from '@/utils/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { IconDragDrop } from '@tabler/icons-react';


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
  start_time?: string;
  end_time?: string;
  mode?: string;
  total_amount?: number;
  pc_id: string;
  status: 'active' | 'inactive';
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
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [pcs, setPcs] = useState<PC[]>(initialPcs);

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
    fetchCurrentSession(pc.id);
    console.log(currentSession?.id);
  }, [onPcSelect]);

  const fetchCurrentSession = useCallback(async (pcId: string) => {
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
      }
    } catch (error) {
      console.error('Error fetching current session:', error);
    }
  }, [supabase]);



  return (
    <div className="ml-4 bg-gray-800 text-white rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">PC Layout</h2>
        <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg">
          <Switch checked={dragEnabled} onCheckedChange={setDragEnabled} />
          <IconDragDrop size={20} className="text-white" />
        </div>
      </div>

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
                  <span className="font-bold text-lg">{pc.number}</span>
                 
                </div>
              </Draggable>
            ))}

          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PCLayout;