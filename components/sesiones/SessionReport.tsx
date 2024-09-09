"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const supabase = createClient();

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

interface Consumption {
  id: string;
  session_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
  paid: boolean;
}

interface Client {
  id: string;
  name: string;
}

export default function SessionReport() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchClient, setSearchClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [totals, setTotals] = useState({
    totalAmount: 0,
    advancePayment: 0,
    yape: 0,
    plin: 0,
    cash: 0,
  });

  useEffect(() => {
    // Fetch sessions and clients from Supabase
    const fetchSessionsAndClients = async () => {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('status', 'inactive'); // Only fetch inactive sessions

      const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      } else {
        setSessions(sessionsData);
        setFilteredSessions(sessionsData);
      }

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else {
        setClients(clientsData);
      }
    };

    fetchSessionsAndClients();
  }, []);

  // Get client name by client_id
  const getClientName = (clientId: string) => {
    const client = clients.find((client) => client.id === clientId);
    return client ? client.name : 'Desconocido';
  };

  // Handle filtering by date and client name
  const handleFilter = () => {
    let filtered = sessions;

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.start_time);
        return sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate);
      });
    }

    // Filter by client name
    if (searchClient) {
      filtered = filtered.filter((session) =>
        getClientName(session.client_id).toLowerCase().includes(searchClient.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
    calculateTotals(filtered);
  };

  // Calculate totals for numeric fields
  const calculateTotals = (sessions: Session[]) => {
    const totals = sessions.reduce(
      (acc, session) => {
        return {
          totalAmount: acc.totalAmount + (session.total_amount || 0),
          advancePayment: acc.advancePayment + (session.advance_payment || 0),
          yape: acc.yape + (session.yape || 0),
          plin: acc.plin + (session.plin || 0),
          cash: acc.cash + (session.cash || 0),
        };
      },
      { totalAmount: 0, advancePayment: 0, yape: 0, plin: 0, cash: 0 }
    );

    setTotals(totals);
  };

  return (
    <div className="bg-slate-900 p-4 rounded-lg shadow-lg">
      <h1 className="text-xl text-slate-100 font-bold mb-4">Reporte de Sesiones</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="client-search" className="text-slate-300">Buscar por Cliente</Label>
          <Input
            id="client-search"
            type="text"
            value={searchClient}
            onChange={(e) => setSearchClient(e.target.value)}
            className="bg-slate-700 text-slate-100 placeholder-slate-400"
            placeholder="Buscar por nombre del cliente"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="start-date" className="text-slate-300">Fecha Inicio</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-700 text-slate-100 placeholder-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="end-date" className="text-slate-300">Fecha Fin</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-700 text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleFilter} className="bg-blue-500 hover:bg-blue-600 text-white mb-4">
        Filtrar
      </Button>

      <div className="bg-slate-800 p-4 rounded-lg overflow-auto max-h-96">
        <table className="min-w-full text-sm text-slate-300">
          <thead>
            <tr className="bg-slate-700">
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">PC Número</th>
              <th className="p-2 text-left">Inicio</th>
              <th className="p-2 text-left">Fin</th>
              <th className="p-2 text-left">Estado</th>
              <th className="p-2 text-left">Monto Total</th>
              <th className="p-2 text-left">Adelanto</th>
              <th className="p-2 text-left">Yape</th>
              <th className="p-2 text-left">Plin</th>
              <th className="p-2 text-left">Cash</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <tr key={session.id} className="border-b border-slate-700">
                <td className="p-2">{getClientName(session.client_id)}</td>
                <td className="p-2">{session.pc_number}</td>
                <td className="p-2">{format(new Date(session.start_time), 'dd/MM/yyyy HH:mm')}</td>
                <td className="p-2">{session.end_time ? format(new Date(session.end_time), 'dd/MM/yyyy HH:mm') : 'En curso'}</td>
                <td className="p-2">{session.status}</td>
                <td className="p-2">{session.total_amount ? `S/ ${session.total_amount.toFixed(2)}` : 'N/A'}</td>
                <td className="p-2">{session.advance_payment ? `S/ ${session.advance_payment.toFixed(2)}` : 'N/A'}</td>
                <td className="p-2">{session.yape ? `S/ ${session.yape.toFixed(2)}` : 'N/A'}</td>
                <td className="p-2">{session.plin ? `S/ ${session.plin.toFixed(2)}` : 'N/A'}</td>
                <td className="p-2">{session.cash ? `S/ ${session.cash.toFixed(2)}` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Display totals */}
      <div className="mt-4 text-slate-100">
        <h2 className="font-bold">Totales</h2>
        <p>Monto Total: S/ {totals.totalAmount.toFixed(2)}</p>
        <p>Adelanto: S/ {totals.advancePayment.toFixed(2)}</p>
        <p>Yape: S/ {totals.yape.toFixed(2)}</p>
        <p>Plin: S/ {totals.plin.toFixed(2)}</p>
        <p>Cash: S/ {totals.cash.toFixed(2)}</p>
      </div>
    </div>
  );
}
