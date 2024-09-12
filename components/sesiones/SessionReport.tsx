"use client";
import React, { useState, useMemo, useEffect } from 'react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import { toZonedTime } from 'date-fns-tz';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Interfaces para definir la estructura de los datos
interface Client {
  id: string;
  name: string;
}

interface Session {
  id: string;
  client_id: string;
  pc_number: string;
  start_time: string;
  end_time?: string;
  status: string;
  total_amount?: number;
  advance_payment?: number;
  observation?: string;
  yape?: number;
  plin?: number;
  cash?: number;
}

interface Debit {
  id: string;
  client_id: string;
  amount: number;
  created_at: string;
  status: boolean;
}

export default function SessionReport() {
  // Estados para manejar los filtros y datos
  const [globalFilter, setGlobalFilter] = useState('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [debits, setDebits] = useState<Debit[]>([]);
  const [loading, setLoading] = useState(true);

  // Inicializar el cliente de Supabase
  const supabase = createClient();

  // Función para obtener los débitos
  const fetchDebits = async () => {
    const startDateISO = new Date(`${startDate}T00:00:00Z`).toISOString();
    const endDateISO = new Date(`${endDate}T23:59:59Z`).toISOString();
    try {
      let { data, error } = await supabase
        .from('debits')
        .select('*')
        .gte('created_at', startDateISO)
        .lte('created_at', endDateISO)
        .eq('status', false);
      if (error) {            
        console.error(error);
      } else {
        setDebits(data || []);
      }
    } catch (error) {
      console.error('Error fetching debits:', error);
    }
  };

  // Función para obtener los clientes
  const fetchClients = async () => {
    try {
      let { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  };

  // Función para obtener las sesiones
  const fetchSessions = async () => {
    try {
      let { data, error } = await supabase.from('sessions').select('*').eq('status', 'inactive');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  };

  // Efecto para cargar los datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsData, sessionsData] = await Promise.all([fetchClients(), fetchSessions()]);
        setClients(clientsData);
        setSessions(sessionsData);
        await fetchDebits();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Efecto para actualizar los débitos cuando cambian las fechas
  useEffect(() => {
    fetchDebits();
  }, [startDate, endDate]);

  // Enriquecer las sesiones con el nombre del cliente
  const enrichedSessions = useMemo(() => {
    return sessions.map(session => {
      const client = clients.find(c => c.id === session.client_id);
      return {
        ...session,
        clientName: client?.name || 'Desconocido',
      };
    });
  }, [sessions, clients]);

  // Filtrar los IDs de los clientes basados en la búsqueda global
  const filteredClientIds = useMemo(() => {
    return clients
      .filter(client => client.name.toLowerCase().includes(globalFilter.toLowerCase()))
      .map(client => client.id);
  }, [clients, globalFilter]);

  // Filtrar las sesiones basadas en las fechas y los IDs de los clientes filtrados
  const filteredSessions = useMemo(() => {
    const startDatePeru = toZonedTime(new Date(startDate), 'America/Lima');
    const endDatePeru = toZonedTime(new Date(endDate), 'America/Lima');

    return enrichedSessions
      .filter(session => {
        const sessionStartDate = toZonedTime(new Date(session.start_time), 'America/Lima');
        return sessionStartDate >= startDatePeru && sessionStartDate <= endDatePeru;
      })
      .filter(session => filteredClientIds.includes(session.client_id));
  }, [enrichedSessions, startDate, endDate, filteredClientIds]);

  // Filtrar los débitos basados en los IDs de los clientes filtrados
  const filteredDebits = useMemo(() => {
    return debits.filter(debit => filteredClientIds.includes(debit.client_id));
  }, [debits, filteredClientIds]);

  // Calcular el total de la deuda
  const totalDebt = useMemo(() => {
    return filteredDebits.reduce((sum, debit) => sum + (debit.amount || 0), 0);
  }, [filteredDebits]);

  // Definir las columnas de la tabla
  const columns = useMemo<ColumnDef<Session & { clientName: string }>[]>(() => [
    {
      accessorKey: 'clientName',
      header: 'Client Name',
    },
    {
      accessorKey: 'pc_number',
      header: 'PC Number',
    },
    {
      accessorKey: 'start_time',
      header: 'Start Time',
      cell: info => format(new Date(info.getValue() as string), 'yyyy-MM-dd HH:mm'),
    },
    {
      accessorKey: 'end_time',
      header: 'End Time',
      cell: info => {
        const endTime = info.getValue() as string | undefined;
        return endTime ? format(new Date(endTime), 'yyyy-MM-dd HH:mm') : 'En curso';
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: info => `S/ ${(info.getValue() as number)?.toFixed(2) || '0.00'}`,
    },
    {
      accessorKey: 'advance_payment',
      header: 'Advance Payment',
      cell: info => `S/ ${(info.getValue() as number)?.toFixed(2) || '0.00'}`,
    },
    {
      accessorKey: 'yape',
      header: 'Yape',
      cell: info => `S/ ${(info.getValue() as number)?.toFixed(2) || '0.00'}`,
    },
    {
      accessorKey: 'plin',
      header: 'Plin',
      cell: info => `S/ ${(info.getValue() as number)?.toFixed(2) || '0.00'}`,
    },
    {
      accessorKey: 'cash',
      header: 'Cash',
      cell: info => `S/ ${(info.getValue() as number)?.toFixed(2) || '0.00'}`,
    },
  ], []);

  // Configurar la tabla
  const table = useReactTable({
    data: filteredSessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: { pageSize: 18 },
    },
  });

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (loading) {
    return <div>Loading...</div>;
  }

  // Renderizar el componente
  return (
    <div className="p-4">
      {/* Controles de filtro */}
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Buscar por cliente"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-1/3"
        />
        <div className="flex gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de sesiones */}
      <div className="max-h-[750px] border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className="cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽') : null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => {
                  const observation = (row.original as Session).observation;
                  return observation ? (
                    <TooltipProvider key={cell.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TableCell>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{observation}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Anterior
          </Button>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
        <span>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
      </div>

      {/* Resumen de totales */}
      <div className="flex justify-between mt-4 font-bold">
        <span>Total Ventas: S/ {filteredSessions.reduce((sum, session) => sum + (session.total_amount || 0), 0).toFixed(2)}</span>
        <span>Total Deuda: S/ {totalDebt.toFixed(2)}</span>
        <span>Yape: S/ {filteredSessions.reduce((sum, session) => sum + (session.yape || 0), 0).toFixed(2)}</span>
        <span>Plin: S/ {filteredSessions.reduce((sum, session) => sum + (session.plin || 0), 0).toFixed(2)}</span>
        <span>Cash: S/ {filteredSessions.reduce((sum, session) => sum + (session.cash || 0), 0).toFixed(2)}</span>
      </div>
    </div>
  );
}