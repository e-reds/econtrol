"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO, addDays, isWithinInterval } from 'date-fns';
import { createClient } from '@/utils/supabase/client';

interface Session {
  id: string;
  client_id: string;
  pc_number: string;
  start_time: string;
  end_time?: string;
  status: string;
  total_amount?: number;
  yape?: number;
  plin?: number;
  cash?: number;
}

const TIME_ZONE = 'America/Lima';

export default function SessionReport() {
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchSessions = async () => {
    const startDateWithTime = `${startDate}T06:00:00-05:00`;
    const endDateWithTime = `${endDate}T05:59:59-05:00`;
    
    try {
      let { data, error } = await supabase
        .from('sessions')
        .select('*')
        .gte('start_time', startDateWithTime)
        .lt('start_time', addDays(new Date(endDateWithTime), 1).toISOString())
        .eq('status', 'inactive');
      if (error) throw error;
      setSessions(data || []);
      console.log(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSessions().then(() => setLoading(false));
  }, [startDate, endDate]);

  const dailyTotals = useMemo(() => {
    return sessions.reduce((acc: { [contableDate: string]: { yape: number; plin: number; cash: number; total_amount: number } }, session) => {
      // Parse start time of session and create contable day start and end time boundaries
      const sessionStart = parseISO(session.start_time);
      const contableDateStart = new Date(sessionStart);
      contableDateStart.setHours(6, 0, 0, 0); // Start at 06:00 AM
      const contableDateEnd = addDays(new Date(contableDateStart), 1);
      contableDateEnd.setHours(5, 59, 59); // End at 05:59 AM the next day

      // Format contable date for grouping key
      const contableDateKey = format(contableDateStart, 'yyyy-MM-dd');

      // Initialize totals for this contable date if it doesn't exist
      if (!acc[contableDateKey]) {
        acc[contableDateKey] = { yape: 0, plin: 0, cash: 0, total_amount: 0 };
      }

      // Check if session start time falls within the contable day
      if (isWithinInterval(sessionStart, { start: contableDateStart, end: contableDateEnd })) {
        acc[contableDateKey].yape += session.yape || 0;
        acc[contableDateKey].plin += session.plin || 0;
        acc[contableDateKey].cash += session.cash || 0;
        acc[contableDateKey].total_amount += session.total_amount || 0;
      }

      return acc;
    }, {});
  }, [sessions]);

  const grandTotal = useMemo(() => {
    return Object.values(dailyTotals).reduce(
      (totals, daily) => {
        totals.yape += daily.yape;
        totals.plin += daily.plin;
        totals.cash += daily.cash;
        totals.total_amount += daily.total_amount;
        return totals;
      },
      { yape: 0, plin: 0, cash: 0, total_amount: 0 }
    );
  }, [dailyTotals]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <ScrollArea className="h-full border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Yape</TableHead>
              <TableHead>Plin</TableHead>
              <TableHead>Cash</TableHead>
              <TableHead>Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(dailyTotals).map(([date, totals]) => (
              <TableRow key={date}>
                <TableCell>{date}</TableCell>
                <TableCell>{`S/ ${totals.yape.toFixed(2)}`}</TableCell>
                <TableCell>{`S/ ${totals.plin.toFixed(2)}`}</TableCell>
                <TableCell>{`S/ ${totals.cash.toFixed(2)}`}</TableCell>
                <TableCell>{`S/ ${totals.total_amount.toFixed(2)}`}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Grand Total Summary */}
      <div className="mt-4 font-bold">
        <div>Total Yape: S/ {grandTotal.yape.toFixed(2)}</div>
        <div>Total Plin: S/ {grandTotal.plin.toFixed(2)}</div>
        <div>Total Cash: S/ {grandTotal.cash.toFixed(2)}</div>
        <div>Total Amount: S/ {grandTotal.total_amount.toFixed(2)}</div>
      </div>
    </div>
  );
}
