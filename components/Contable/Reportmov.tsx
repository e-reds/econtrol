
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { toZonedTime, formatInTimeZone  } from 'date-fns-tz';

interface ReportmovProps {
    type: string;
    title: string;
    startDate: string;
    endDate: string;
}
interface Data {
    id: string;
    type: string;
    amount: number;
    detail: string;
    created_at: string;
}
const TIME_ZONE = 'America/Lima';
export const Reportmov: React.FC<ReportmovProps> = ({ type, title, startDate, endDate }) => {
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<Data[]>([]);
     // Crear la fecha inicial y final en la zona horaria de Perú (UTC-5)
     const startDatePeru = `${startDate}T06:00:00-05:00`;
     const endDatePeru = `${endDate}T06:00:00-05:00`;
 
     // Convertir a UTC usando date-fns-tz
     const startDateUtc = formatInTimeZone(startDatePeru, 'America/Lima', 'yyyy-MM-dd HH:mm:ssXXX')
     const endDateUtc = formatInTimeZone(endDatePeru, 'America/Lima', 'yyyy-MM-dd HH:mm:ssXXX')
    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('mov_contable')
                .select('*')
                .gte('created_at', startDateUtc)
                .lte('created_at', endDateUtc)
                .eq('type', type);
            if (error) {
                console.error('Error fetching data:', error);
                return;
            }
            setData(data);
        };
        fetchData();
    }, [type]);
    return (
        <Popover>
            <PopoverTrigger asChild>
                <span className="cursor-pointer">{title}</span>
            </PopoverTrigger>
            <PopoverContent className="w-[450px]">
                <div >
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none mb-2">Resporte de {title}</h4>
                    </div>
                    <div className="grid gap-2">
                        <ScrollArea className="h-72  rounded-md border">
                            <div className="p-2">
                                {data.length > 0 ? data.map((mov, index) => (
                                    <>
                                        <div className="grid grid-cols-12 gap-2 items-center" key={index}>
                                            <span className="text-xs col-span-4">
                                                {format(toZonedTime(new Date(mov.created_at), TIME_ZONE), 'yyyy-MM-dd HH:mm')}
                                            </span>
                                            <span className="text-xs col-span-6 truncate">
                                                {mov.detail}
                                            </span>
                                            <span className={`text-xs col-span-2 ${mov.type === 'egreso' ? 'text-red-500' : 'text-green-500'}`}>
                                                S/ {mov.amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <Separator className="my-2" />
                                    </>
                                )) : <span className="text-xs text-center">No hay movimientos</span>}
                            </div>

                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
