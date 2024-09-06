"use client";
import React, { useState, useEffect, useRef } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { createClient } from '@/utils/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button"; // Asumimos que hay un componente de botón disponible
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { IconDragDrop } from '@tabler/icons-react';
interface PC {
  id: string;
  number: string;
  position: { x: number; y: number };
  status: 'available' | 'occupied' | 'maintenance';
  group: number;
}

interface PCLayoutProps {
  pcs: PC[];
  onPcSelect: (pc: PC) => void;
  onUpdatePCPosition: (pcId: string, newPosition: { x: number; y: number }) => void;
}

const PCLayout: React.FC<PCLayoutProps> = ({ pcs, onPcSelect, onUpdatePCPosition }) => {
  const [scale, setScale] = useState(1);
  const [dragEnabled, setDragEnabled] = useState(false); // Estado para habilitar/deshabilitar el arrastre
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const GRID_SIZE = 100; // Tamaño de la cuadrícula virtual

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Asegurarnos de ajustar el tamaño al cargar
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const scaleX = containerWidth / 1000; // Asumimos un ancho base de 1000px
      const scaleY = containerHeight / 800; // Asumimos un alto base de 800px
      setScale(Math.min(scaleX, scaleY));
    }
  };

  // Alineación automática a la cuadrícula
  const alignToGrid = (position: { x: number; y: number }) => {
    const x = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
    const y = Math.round(position.y / GRID_SIZE) * GRID_SIZE;
    return { x, y };
  };

  const onDragStop = (id: string) => (e: DraggableEvent, data: DraggableData) => {
    // Alineamos la posición a la cuadrícula más cercana
    const newPosition = alignToGrid({ x: data.x, y: data.y });

    // Llama a la función del padre para actualizar la posición
    onUpdatePCPosition(id, newPosition);
  };

  const handlePcClick = (pc: PC) => {
    onPcSelect(pc);
  };

  const toggleDrag = () => {
    setDragEnabled((prev) => !prev);
  };

  return (
    <div className="ml-4 bg-gray-200 rounded-lg p-4 shadow-lg bg-gray-800 text-white">
      <div className="flex justify-between items-center mb-4">        
        <h2 className="text-lg font-semibold"></h2>
        <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg">
          <Switch checked={dragEnabled} onCheckedChange={toggleDrag}  >
            {dragEnabled ? 'Desactivar Arrastrar' : 'Activar Arrastrar'}
          </Switch>

          <Label htmlFor="airplane-mode"><IconDragDrop size={20} className='text-white' /></Label>
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          width: '40vw',
          height: '80vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
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
                grid={[GRID_SIZE, GRID_SIZE]} // Aseguramos que el movimiento sea suave en la cuadrícula
                disabled={!dragEnabled} // Desactivar arrastrar si `dragEnabled` es falso
              >
                <div
                  className={`pc-item pc-status-${pc.status} bg-gray-100`}
                  style={{
                    width: '90px',
                    height: '90px',
                    position: 'absolute',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    borderRadius: '8px',
                    cursor: dragEnabled ? 'move' : 'pointer',
                    userSelect: 'none',
                    backgroundColor:
                      pc.status === 'available' ? '#4A90E2' :
                        pc.status === 'occupied' ? '#FFB74D' : '#E57373',
                    color: 'white',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.3s ease',
                  }}
                  onClick={() => handlePcClick(pc)}
                >
                  {pc.number}
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
