import { createClient } from './client';

const supabase = createClient();

function getLastDayOfMonth(year: number, month: number): string {
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

async function getSessions(month: string, year: string) {
    try {
        const monthFormatted = month.padStart(2, '0');
        const startDate = `${year}-${monthFormatted}-01`;
        const lastDayOfMonth = getLastDayOfMonth(parseInt(year), parseInt(month));

        console.log('Query dates:', { startDate, lastDayOfMonth }); // Debug

        const { data, error } = await supabase
            .from('sessions')
            .select('*') // Seleccionamos todos los campos para debug
            .eq('status', 'inactive')
            .gte('start_time', startDate)
            .lte('start_time', lastDayOfMonth)
            .order('start_time'); // Ordenamos por fecha

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Raw data from Supabase:', data); // Debug

        // Crear array con todos los días del mes
        const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
        const result = Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dateStr = `${year}-${monthFormatted}-${String(day).padStart(2, '0')}`;
            
            // Filtrar las sesiones para este día específico
            const daySessions = data?.filter(session => {
                const sessionDate = new Date(session.start_time);
                return sessionDate.getDate() === day;
            }) || [];

            // Sumar todos los valores para este día
            const dayTotals = daySessions.reduce((acc, session) => ({
                total_amount: acc.total_amount + (session.total_amount || 0),
                yape: acc.yape + (session.yape || 0),
                plin: acc.plin + (session.plin || 0),
                cash: acc.cash + (session.cash || 0),
                debt: acc.debt + (session.debt || 0)
            }), {
                total_amount: 0,
                yape: 0,
                plin: 0,
                cash: 0,
                debt: 0
            });

            return {
                date: dateStr,
                ...dayTotals
            };
        });

        console.log('Processed result:', result); // Debug
        return result;

    } catch (error) {
        console.error('Error in getSessions:', error);
        return null;
    }
}

export { getSessions };
