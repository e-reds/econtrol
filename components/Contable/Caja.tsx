"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import Swal from "sweetalert2";
import { formatInTimeZone } from "date-fns-tz";

const supabase = createClient();

export function Caja() {
    const [isOpen, setIsOpen] = useState(false);
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    // Crear la fecha inicial y final en la zona horaria de Perú (UTC-5)
    const startDatePeru = `${startDate}T06:00:00-05:00`;
    const endDatePeru = `${endDate}T06:00:00-05:00`;

    // Convertir a UTC usando date-fns-tz
    const startDateUtc = formatInTimeZone(startDatePeru, 'America/Lima', 'yyyy-MM-dd HH:mm:ssXXX')
    const endDateUtc = formatInTimeZone(endDatePeru, 'America/Lima', 'yyyy-MM-dd HH:mm:ssXXX')
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Label className='cursor-pointer'>Reporte de Caja</Label>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none mb-4">Reporte de Caja</h4>
                        <div className="grid grid-cols-2 items-center ">
                            <Label htmlFor="startDate">Fecha Inicio</Label>
                            <Input
                                id="startDate"
                                type="date"
                                className="bg-gray-800 border border-gray-600 text-white rounded-md"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 items-center ">
                            <Label htmlFor="endDate">Fecha Fin</Label>
                            <Input
                                id="endDate"
                                type="date"
                                className="bg-gray-800 border border-gray-600 text-white rounded-md"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <Button className="bg-sky-500 hover:bg-sky-300 w-full" onClick={async () => {
                            try {
                                // Filtrar sesiones activas
                                const { data: activeSessions, error: sessionError } = await supabase
                                    .from('sessions')
                                    .select('id')
                                    .eq('status', 'active')
                                    .gte('start_time', startDateUtc)
                                    .lt('start_time', endDateUtc);

                                if (sessionError) throw sessionError;

                                // Obtener consumos de las sesiones activas
                                const { data: consumptionData, error: consumptionError } = await supabase
                                    .from('consumptions')
                                    .select('amount')
                                    .in('session_id', activeSessions.map(session => session.id));

                                if (consumptionError) throw consumptionError;

                                const totalActiveConsumption = consumptionData.reduce((sum, item) => sum + item.amount, 0);

                                const { data: sessionData, error: sessionDataError } = await supabase
                                    .from('sessions')
                                    .select('yape, plin, cash, debt')
                                    .gte('start_time', startDateUtc)
                                    .lt('start_time', endDateUtc);

                                if (sessionDataError) throw sessionDataError;

                                const totalYape = sessionData.reduce((sum, session) => sum + session.yape, 0);
                                const totalPlin = sessionData.reduce((sum, session) => sum + session.plin, 0);
                                const totalCash = sessionData.reduce((sum, session) => sum + session.cash, 0);
                                const totalDebt = sessionData.reduce((sum, session) => sum + session.debt, 0);

                                const { data: movData, error: movError } = await supabase
                                    .from('mov_contable')
                                    .select('amount, type')
                                    .gte('created_at', startDateUtc)
                                    .lt('created_at', endDateUtc);

                                if (movError) throw movError;

                                const { data: debitDetailData, error: debitDetailError } = await supabase
                                    .from('debits_details')
                                    .select('amount, payment_method')
                                    .gte('created_at', startDateUtc)
                                    .lt('created_at', endDateUtc);

                                if (debitDetailError) throw debitDetailError;

                                const totalDebitDetailYape = debitDetailData.filter(mov => mov.payment_method === 'yape').reduce((sum, mov) => sum + mov.amount, 0);
                                const totalDebitDetailPlin = debitDetailData.filter(mov => mov.payment_method === 'plin').reduce((sum, mov) => sum + mov.amount, 0);
                                const totalDebitDetailCash = debitDetailData.filter(mov => mov.payment_method === 'cash').reduce((sum, mov) => sum + mov.amount, 0);

                                const totalIngresos = movData
                                    .filter(mov => mov.type === 'ingreso')
                                    .reduce((sum, mov) => sum + mov.amount, 0);

                                const totalEgresos = movData
                                    .filter(mov => mov.type === 'egreso')
                                    .reduce((sum, mov) => sum + mov.amount, 0);

                                const totalefectivo = totalIngresos + totalCash;

                                Swal.fire({
                                    title: '<strong>Reporte de Caja</strong>',
                                    html: `
                                        <div style="text-align: left; font-size: 1.1rem; color: #34495e;">
                                            <p style="color: #c613d8;"><strong>Total Yape:</strong> S/ ${totalYape.toFixed(2)}</p>
                                            <p style="color: #13d8bd;"><strong>Total Plin:</strong> S/ ${totalPlin.toFixed(2)}</p>
                                            <p style="color: #135ed8;"><strong>Total Efectivo:</strong> S/ ${totalCash.toFixed(2)}</p>
                                            <p style="color: #d8133a;"><strong>Total Deuda:</strong> S/ ${totalDebt.toFixed(2)}</p> 
                                            <p style="color: #13d81c;"><strong>Total por cobrar:</strong> S/ ${totalActiveConsumption.toFixed(2)}</p>
                                             <hr style="border: 1px solid #bdc3c7;">
                                            <p><strong>Total Ingresos:</strong> S/ ${totalIngresos.toFixed(2)}</p>
                                            <p><strong>Total Egresos:</strong> S/ ${totalEgresos.toFixed(2)}</p>
                                            <hr style="border: 1px solid #bdc3c7;">
                                            <p style="margin-top: 10px;"><strong>Pago deudas Yape:</strong> S/ ${totalDebitDetailYape.toFixed(2)}</p>
                                            <p><strong>Pago deudas Plin:</strong> S/ ${totalDebitDetailPlin.toFixed(2)}</p>
                                            <p><strong>Pago deudas Efectivo:</strong> S/ ${totalDebitDetailCash.toFixed(2)}</p>
                                            <hr style="border: 1px solid #bdc3c7;">
                                            <p style="font-size: 1rem; color: #34495e;"><strong>Total Yape (incluyendo pagos de deudas):</strong> S/ ${(totalYape + totalDebitDetailYape).toFixed(2)}</p>
                                            <p style="font-size: 1rem; color: #34495e;"><strong>Total Plin (incluyendo pagos de deudas):</strong> S/ ${(totalPlin + totalDebitDetailPlin).toFixed(2)}</p>
                                            <p style="font-size: 1rem; color: #34495e;" ><strong>Total Efectivo (cash + pagos + ingresos):</strong> S/ ${(totalCash + totalDebitDetailCash + totalIngresos).toFixed(2)}</p>
                                            <p style="font-size: 1rem; color: #135ed8;" ><strong>Total Venta :</strong> S/ ${(totalCash + totalYape + totalPlin + totalDebt).toFixed(2)}</p>
                                            <p style="font-size: 1rem; color:#135ed8;" ><strong>Total General :</strong> S/ ${(totalCash + totalYape + totalPlin + totalDebt + totalDebitDetailCash + totalDebitDetailYape + totalDebitDetailPlin + totalIngresos - totalEgresos).toFixed(2)}</p>
                                         
                                        </div>
                                    `,
                                    icon: 'info',
                                    iconColor: '#3498db',
                                    confirmButtonText: 'Cerrar',
                                    confirmButtonColor: '#2ecc71',
                                    background: '#f4f6f7',
                                    width: '500px',
                                    padding: '20px',
                                    showCloseButton: true,
                                    customClass: {
                                        title: 'swal-title-custom',
                                        htmlContainer: 'swal-html-custom'
                                    }
                                });

                            } catch (error) {
                                console.error('Error fetching data:', error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: 'Ocurrió un error al obtener el reporte de caja.',
                                });
                            }
                        }}>
                            Generar Reporte
                        </Button>
                    </div>

                </div>
            </PopoverContent>
        </Popover>
    )
}
