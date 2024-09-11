"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconListDetails } from '@tabler/icons-react';
import { Payment } from "./Payment";
import { Debitsdetails } from "./Debitsdetails";

export default function Reports() {
    const [clientId, setClientId] = useState<string>("");
    const [debits, setDebits] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [statusFilter, setStatusFilter] = useState<boolean>(true);
    const [refreshdata, setRefreshdata] = useState<boolean>(false);

    const supabase = createClient();

    // Fetch clients
    const fetchClients = async () => {
        try {
            let { data: clientsData, error } = await supabase
                .from('clients')
                .select('*');
            if (error) {
                console.error("Error fetching clients:", error);
            } else {
                setClients(clientsData || []);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    // Fetch debits
    const fetchDebits = async () => {
        const startDateISO = new Date(`${startDate}T00:00:00Z`).toISOString();
        const endDateISO = new Date(`${endDate}T23:59:59Z`).toISOString();
        try {
            let { data, error } = await supabase
                .from('debits')
                .select('*')                
                .gte('created_at', startDateISO)
                .lte('created_at', endDateISO)
                .eq('status', statusFilter);

            if (error) {
                setError("Error fetching debits");
                console.error(error);
            } else {
                setDebits(data || []);
            }
        } catch (error) {
            console.error('Error fetching debits:', error);
        }
    };

    const refreshDebits = () => {
        fetchDebits();
    };

    useEffect(() => {
        fetchDebits();
        fetchClients();  // Fetch clients when component mounts
    }, [clientId, startDate, endDate, statusFilter, refreshdata]);

    const totalAmount = debits.reduce((acc, debit) => acc + debit.amount, 0);

    // Helper function to get the client name by client_id
    const getClientName = (clientId: string) => {
        const client = clients.find((client) => client.id === clientId);
        return client ? (client.nickname || client.name) : 'Cliente desconocido';
    };

    return (
        <div className="container mx-auto p-6 space-y-8 bg-gray-900 text-gray-100 rounded-xl shadow-lg">
            {/* Header and Client Selector */}
            <div className="flex flex-wrap justify-between items-center bg-gray-800 p-6 rounded-lg shadow-md">          
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="startDate">Fecha Inicio</Label>
                        <Input
                            id="startDate"
                            type="date"
                            className="bg-gray-800 border border-gray-600 text-white rounded-md"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="endDate">Fecha Fin</Label>
                        <Input
                            id="endDate"
                            type="date"
                            className="bg-gray-800 border border-gray-600 text-white rounded-md"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="statusFilter"
                            className="bg-gray-700"
                            checked={statusFilter}
                            onCheckedChange={setStatusFilter}
                        />
                        <Label htmlFor="statusFilter">
                            {statusFilter ? 'Pagado' : 'Debe'}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Table and Data */}
            <div>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="rounded-lg border border-gray-700 overflow-hidden">
                    <ScrollArea className="h-[500px]">
                        <Table className="min-w-full divide-y divide-gray-700">
                            <TableHeader>
                                <TableRow className="bg-gray-800">
                                    <TableHead className="py-3 px-4 text-left">Fecha</TableHead>
                                    <TableHead className="py-3 px-4 text-left">Cliente</TableHead>
                                    <TableHead className="py-3 px-4 text-left">Descripción</TableHead>
                                    <TableHead className="py-3 px-4 text-left">Monto</TableHead>
                                    <TableHead className="py-3 px-4 text-left">Estado</TableHead>
                                    <TableHead className="py-3 px-4 text-right">Ver</TableHead>
                                    <TableHead className="py-3 px-4 text-right">Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {debits.map((debit) => (
                                    <TableRow key={debit.id} className="hover:bg-gray-700 transition-colors">
                                        <TableCell className="py-3 px-4">{format(new Date(debit.created_at), 'yyyy-MM-dd')}</TableCell>
                                        <TableCell className="py-3 px-4">{getClientName(debit.client_id)}</TableCell>
                                        <TableCell className="py-3 px-4">{debit.description}</TableCell>
                                        <TableCell className="py-3 px-4">S/ {debit.amount.toFixed(2)}</TableCell>
                                        <TableCell className="py-3 px-4">
                                            {debit.status ? 'Pagado' : 'Debe'}
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-right">
                                           <Debitsdetails debts_id={debit.id} />
                                        </TableCell>
                                        <TableCell className="py-3 px-4 text-right">
                                            {debit.status ? (
                                                <span className="text-green-400">Pagado</span>
                                            ) : (
                                                <Payment debitId={debit.id} amountdebit={debit.amount} refreshDebits={refreshDebits} setRefreshdata={setRefreshdata} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                <div className="mt-4 text-right px-4 text-lg text-red-500">
                    <strong>Total: S/{totalAmount.toFixed(2)}</strong>
                </div>
            </div>
        </div>
    );
}
