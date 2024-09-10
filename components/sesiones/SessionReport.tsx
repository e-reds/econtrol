"use client";
import { useState, useMemo, useEffect } from 'react';
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface Client {
  id: string;
  name: string;
}

export default function SessionReport() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsData, sessionsData] = await Promise.all([fetchClients(), fetchSessions()]);
        setClients(clientsData);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Enriquecer las sesiones con el nombre del cliente
  const enrichedSessions = useMemo(() => {
    return sessions.map(session => {
      const client = clients.find(c => c.id === session.client_id);
      return {
        ...session,
        clientName: client?.name || 'Desconocido', // Agregamos el nombre del cliente
      };
    });
  }, [sessions, clients]);

  // Aplicar el filtro global basado en el nombre del cliente
  const filteredSessions = useMemo(() => {
    const startDatePeru = toZonedTime(new Date(startDate), 'America/Lima');
    const endDatePeru = toZonedTime(new Date(endDate), 'America/Lima');

    return enrichedSessions
      .filter(session => {
        const sessionStartDate = toZonedTime(new Date(session.start_time), 'America/Lima');
        return sessionStartDate >= startDatePeru && sessionStartDate <= endDatePeru;
      })
      .filter(session => {
        const clientName = session.clientName.toLowerCase();
        return clientName.includes(globalFilter.toLowerCase()); // Filtrar por nombre del cliente
      });
  }, [enrichedSessions, startDate, endDate, globalFilter]);

  const columns = useMemo<ColumnDef<Session & { clientName: string }>[]>(() => [
    {
      accessorKey: 'clientName', // Usar clientName ya enriquecido
      header: 'Client Name',
      cell: info => info.getValue(), // Mostrar el nombre del cliente directamente
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
      pagination: { pageSize: 20 },
    },
  });

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="p-4">
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

      <div className="max-h-[780px] border rounded-md">
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
                  const observation = cell.row.original.observation;
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

      <div className="flex justify-between mt-4 font-bold">
        <span>Total Amount: S/ {filteredSessions.reduce((sum, session) => sum + (session.total_amount || 0), 0).toFixed(2)}</span>
        <span>Advance Payment: S/ {filteredSessions.reduce((sum, session) => sum + (session.advance_payment || 0), 0).toFixed(2)}</span>
        <span>Yape: S/ {filteredSessions.reduce((sum, session) => sum + (session.yape || 0), 0).toFixed(2)}</span>
        <span>Plin: S/ {filteredSessions.reduce((sum, session) => sum + (session.plin || 0), 0).toFixed(2)}</span>
        <span>Cash: S/ {filteredSessions.reduce((sum, session) => sum + (session.cash || 0), 0).toFixed(2)}</span>
      </div>
    </div>
  );
}
