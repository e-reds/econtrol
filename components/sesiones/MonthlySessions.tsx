'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, Calendar } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button';

interface Session {
    day: string;
    total_amount_sum: number;
    total_yape: number;
    total_plin: number;
    total_debt: number;
    total_cash: number;
}

const monthOptions = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
];

const SessionsByMonth = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(10);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [totals, setTotals] = useState({ totalAmount: 0, totalYape: 0, totalPlin: 0, totalDebt: 0, totalCash: 0 });
    const supabase = createClient();

    const fetchSessionsByMonth = async (year: number, month: number) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_sessions_by_month', { p_year: year, p_month: month });
            if (error) throw error;
            setSessions(data);
            calculateTotals(data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (data: Session[]) => {
        const totals = data.reduce(
            (acc, session) => {
                acc.totalAmount += session.total_amount_sum;
                acc.totalYape += session.total_yape;
                acc.totalPlin += session.total_plin;
                acc.totalDebt += session.total_debt;
                acc.totalCash += session.total_cash;
                return acc;
            },
            { totalAmount: 0, totalYape: 0, totalPlin: 0, totalDebt: 0, totalCash: 0 }
        );
        setTotals(totals);
    };

    useEffect(() => {
        fetchSessionsByMonth(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    return (

        <div className="max-w-7xl mx-auto p-6 bg-background">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                    <Calendar className="mr-3 text-primary" size={24} />
                    Reporte <span className="text-sky-400 ml-2">{monthOptions.find(month => month.value === selectedMonth)?.label} {selectedYear}</span>
                </h2>

                <div className="flex items-center space-x-4">
                    <div className="w-24">
                        <Popover>
                            <PopoverTrigger ><Button variant="outline">{selectedYear.toString()}</Button></PopoverTrigger>
                            <PopoverContent className="flex flex-wrap gap-2" align="center" side="bottom" sideOffset={10}>
                                {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                                    <Button
                                        key={year}
                                        value={year.toString()}
                                        className="hover:bg-sky-400 focus:bg-primary focus:text-primary-foreground cursor-pointer"
                                        onClick={() => setSelectedYear(year)}
                                    >
                                        {year}
                                    </Button>
                                ))}
                            </PopoverContent>
                        </Popover>

                     {/*    <Select onValueChange={(value) => setSelectedYear(Number(value))} value={selectedYear.toString()}>
                            <SelectTrigger className="bg-background border-input hover:bg-accent transition-colors ">
                                <SelectValue />
                                <ChevronDown className="ml-2 text-muted-foreground " size={20} />
                            </SelectTrigger>
                            <SelectContent>
                                {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                                    <SelectItem
                                        key={year}
                                        value={year.toString()}
                                        className="hover:bg-accent focus:bg-primary focus:text-primary-foreground cursor-pointer"
                                    >
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select> */}
                    </div>
                    <div className="w-32">

                    <Popover>
                            <PopoverTrigger ><Button variant="outline">{monthOptions.find(month => month.value === selectedMonth)?.label}</Button></PopoverTrigger>
                            <PopoverContent className="flex flex-wrap gap-2" align="center" side="bottom" sideOffset={10}>
                                <div className="grid grid-cols-3 gap-2">
                                    {monthOptions.map((month) => (
                                        <Button
                                        key={month.value}
                                        value={month.value.toString()}
                                        className="hover:bg-sky-400 focus:bg-primary focus:text-primary-foreground cursor-pointer"
                                        onClick={() => setSelectedMonth(month.value)}
                                    >
                                        {month.label}
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                      {/*   <Select onValueChange={(value) => setSelectedMonth(Number(value))} value={selectedMonth.toString()}>
                            <SelectTrigger className="bg-background border-input hover:bg-accent transition-colors">
                                <SelectValue />
                                <ChevronDown className="ml-2 text-muted-foreground" size={20} />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((month) => (
                                    <SelectItem
                                        key={month.value}
                                        value={month.value.toString()}
                                        className="hover:bg-accent focus:bg-primary focus:text-primary-foreground cursor-pointer"
                                    >
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select> */}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1  gap-6">
                    <div className="grid grid-cols-12  gap-6">
                        <Card className="col-span-6">
                            <CardHeader>
                                <CardTitle>Resumen del Mes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    <div className="text-center bg-slate-700/50 p-4 rounded-md">
                                        <p className="text-sm text-muted-foreground">Monto Total</p>
                                        <p className="text-2xl font-bold"  style={{ color: 'hsl(var(--total))' }}>S/ {totals.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center bg-slate-700/50 p-4 rounded-md">
                                        <p className="text-sm text-muted-foreground">Yape</p>
                                        <p className="text-2xl font-bold"  style={{ color: 'hsl(var(--yape))' }}>S/ {totals.totalYape.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center bg-slate-700/50 p-4 rounded-md">
                                        <p className="text-sm text-muted-foreground">Plin</p>
                                        <p className="text-2xl font-bold"  style={{ color: 'hsl(var(--plin))' }}>S/ {totals.totalPlin.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center bg-slate-700/50 p-4 rounded-md  ">
                                        <p className="text-sm text-muted-foreground">Efectivo</p>
                                        <p className="text-2xl font-bold"  style={{ color: 'hsl(var(--cash))' }}>S/ {totals.totalCash.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center bg-slate-700/50 p-4 rounded-md  ">
                                        <p className="text-sm text-muted-foreground">Deuda</p>
                                        <p className="text-2xl font-bold"  style={{ color: 'hsl(var(--debt))' }}>S/ {totals.totalDebt.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-6">
                            <CardHeader>
                                <CardTitle>Totales Diarios</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-[300px]">
                                <ChartContainer
                                    config={{
                                        total: {
                                            label: "Total",
                                            color: "hsl(var( --chart-1))",
                                        },
                                        cash: {
                                            label: "Efectivo",
                                            color: "hsl(var( --cash))",
                                        },
                                        debt: {
                                            label: "Deuda",
                                            color: "hsl(var( --destructive))",
                                        },
                                        plin: {
                                            label: "Plin",
                                            color: "hsl(var( --plin))",
                                        },
                                        yape: {
                                            label: "Yape",
                                            color: "hsl(var( --yape))",
                                        },
                                    }}
                                    className="max-h-[300px]"
                                >

                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            width={500}
                                            height={400}
                                            data={sessions}
                                            margin={{
                                                top: 10,
                                                right: 30,
                                                left: 0,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="total_amount_sum" stroke="var(--color-total)" fill="var(--color-total)" />
                                            {/* <Area type="monotone" dataKey="total_cash" stroke="var(--color-cash)" fill="var(--color-cash)" />
                                            <Area type="monotone" dataKey="total_plin" stroke="var(--color-plin)" fill="var(--color-plin)" />
                                            <Area type="monotone" dataKey="total_yape" stroke="var(--color-yape)" fill="var(--color-yape)" /> */}
                                            <Area type="monotone" dataKey="total_debt" stroke="var(--color-debt)" fill="var(--color-debt)" />
                                        </AreaChart>
                                    </ResponsiveContainer>

                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1  gap-6">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Detalles Diarios <span className="text-sky-400">{monthOptions.find(month => month.value === selectedMonth)?.label} {selectedYear}</span></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground mb-2">
                                    <div>Día</div>
                                    <div className="text-right">Monto Total</div>
                                    <div className="text-right">Yape</div>
                                    <div className="text-right">Plin</div>
                                    <div className="text-right">Efectivo</div>
                                    <div className="text-right">Deuda</div>
                                </div>
                                <ScrollArea className="h-[20vh]">
                                    <div className="space-y-1 max-h-[300px]">
                                        {sessions.map((session) => (
                                            <div key={session.day} className="grid grid-cols-6 gap-2 text-sm py-2 border-b border-border hover:bg-accent/50 transition-colors">
                                                <div className="font-medium">{session.day}</div>
                                                <div className="text-right  font-semibold var(--color-total)" >
                                                    S/ {session.total_amount_sum.toLocaleString()}
                                                </div>
                                                <div className="text-right var(--color-yape)">
                                                    S/ {session.total_yape.toLocaleString()}
                                                </div>
                                                <div className="text-right text-purple-600">
                                                    S/ {session.total_plin.toLocaleString()}
                                                </div>
                                                <div className="text-right text-green-600">
                                                    S/ {session.total_cash.toLocaleString()}
                                                </div>
                                                <div className="text-right text-destructive">
                                                    S/ {session.total_debt.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>

    );
};

export default SessionsByMonth;