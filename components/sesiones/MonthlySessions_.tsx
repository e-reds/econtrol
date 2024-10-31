"use client"
import React, { useState, useEffect } from 'react';
import { getSessions } from '@/utils/supabase/econtrol';

interface SessionData {
    date: string;
    total_amount: number;
    yape: number;
    plin: number;
    cash: number;
    debt: number;
}

const MonthlySessionsTable = () => {
    const [sessionData, setSessionData] = useState<SessionData[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Fetching data for:', { month, year });
                const response = await getSessions(month.toString(), year.toString());
                
                if (response) {
                    // Ordenar los datos por día de manera numérica
                    const sortedData = [...response].sort((a, b) => {
                        return new Date(a.date).getDate() - new Date(b.date).getDate();
                    });
                    
                    console.log('Sorted data:', sortedData);
                    setSessionData(sortedData);
                } else {
                    setError('No se pudieron obtener los datos');
                }
            } catch (err) {
                console.error('Error al obtener datos:', err);
                setError('Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [month, year]);

    if (loading) return (
        <div className="flex justify-center items-center p-4">
            <div className="text-lg">Cargando datos...</div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center p-4 text-red-500">
            {error}
        </div>
    );

    if (!sessionData) return (
        <div className="flex justify-center items-center p-4">
            <div className="text-lg">No hay datos disponibles</div>
        </div>
    );

    // Calcular totales
    const totals = sessionData.reduce((acc, session) => ({
        total_amount: acc.total_amount + session.total_amount,
        yape: acc.yape + session.yape,
        plin: acc.plin + session.plin,
        cash: acc.cash + session.cash,
        debt: acc.debt + session.debt,
    }), {
        total_amount: 0,
        yape: 0,
        plin: 0,
        cash: 0,
        debt: 0,
    });

    return (
        <div className="p-4">
            <div className="flex gap-4 mb-4">
                <label className="flex items-center">
                    Mes:
                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="ml-2 p-1 border border-gray-300 rounded"
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2000, i).toLocaleString('es', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center">
                    Año:
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="ml-2 p-1 border border-gray-300 rounded"
                    >
                        {Array.from(
                            { length: 5 },
                            (_, i) => new Date().getFullYear() - i
                        ).map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Día</th>
                            <th className="border p-2">Total</th>
                            <th className="border p-2">Yape</th>
                            <th className="border p-2">Plin</th>
                            <th className="border p-2">Efectivo</th>
                            <th className="border p-2">Deuda</th>
                            <th className="border p-2">Fecha Completa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessionData.map((session) => (
                            <tr key={session.date} className="text-center hover:bg-gray-50">
                                <td className="border p-2">
                                    {new Date(session.date).getDate()}
                                </td>
                                <td className="border p-2">{session.total_amount.toFixed(1)}</td>
                                <td className="border p-2">{session.yape.toFixed(1)}</td>
                                <td className="border p-2">{session.plin.toFixed(1)}</td>
                                <td className="border p-2">{session.cash.toFixed(1)}</td>
                                <td className="border p-2">{session.debt.toFixed(1)}</td>
                                <td className="border p-2 text-sm">
                                    {new Date(session.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        <tr className="font-bold bg-gray-100">
                            <td className="border p-2">Totales</td>
                            <td className="border p-2">{totals.total_amount.toFixed(1)}</td>
                            <td className="border p-2">{totals.yape.toFixed(1)}</td>
                            <td className="border p-2">{totals.plin.toFixed(1)}</td>
                            <td className="border p-2">{totals.cash.toFixed(1)}</td>
                            <td className="border p-2">{totals.debt.toFixed(1)}</td>
                            <td className="border p-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlySessionsTable;