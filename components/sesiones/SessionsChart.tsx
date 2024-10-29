'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { formatInTimeZone } from 'date-fns-tz'
import { createClient } from '@/utils/supabase/client'

interface Session {
  id: string
  client_id: string
  pc_number: string
  start_time: string
  end_time?: string
  status: string
  total_amount?: number
  yape?: number
  plin?: number
  cash?: number
}

interface DailyData {
  day: string
  amount: number
  cash: number
  yape: number
  plin: number
  count: number
}

const years = [2023, 2024, 2025, 2026, 2027]
const months = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

export default function SessionsChart() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1))
  const [sessions, setSessions] = useState<Session[]>([])
  const supabase = createClient()

  const fetchSessions = async () => {
    const startDate = new Date(selectedYear, parseInt(selectedMonth) - 1, 1)
    const endDate = new Date(selectedYear, parseInt(selectedMonth), 0, 23, 59, 59, 999)

    const startDateFormatted = formatInTimeZone(startDate, 'America/Lima', 'yyyy-MM-dd 00:00:00XXX')
    const endDateFormatted = formatInTimeZone(endDate, 'America/Lima', 'yyyy-MM-dd 23:59:59XXX')

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, start_time, total_amount, cash, yape, plin')
        .gte('start_time', startDateFormatted)
        .lte('start_time', endDateFormatted)
        .eq('status', 'inactive')

      if (error) throw error
      console.log('Fetched sessions:', data)
      return data || []
    } catch (error) {
      console.error('Error fetching sessions:', error)
      return []
    }
  }

  useEffect(() => {
    const getSessions = async () => {
      const fetchedSessions = await fetchSessions()
      setSessions(fetchedSessions)
    }
    getSessions()
  }, [selectedYear, selectedMonth])

  const generateChartData = () => {
    const daysInMonth = new Date(selectedYear, parseInt(selectedMonth), 0).getDate()
    
    const allDays = Array.from({ length: daysInMonth }, (_, i) => {
      return {
        day: String(i + 1),
        amount: 0,
        cash: 0,
        yape: 0,
        plin: 0,
        count: 0
      }
    })

    sessions.forEach(session => {
      const sessionDate = new Date(session.start_time)
      const dayIndex = sessionDate.getDate() - 1
      
      if (dayIndex >= 0 && dayIndex < daysInMonth) {
        const dayData = allDays[dayIndex]
        dayData.amount += Number(session.total_amount || 0)
        dayData.cash += Number(session.cash || 0)
        dayData.yape += Number(session.yape || 0)
        dayData.plin += Number(session.plin || 0)
        dayData.count += 1
      }
    })

    console.log('Generated chart data:', allDays)
    return allDays
  }

  const chartData = generateChartData()

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Ventas Mensuales</CardTitle>
        <CardDescription>Desglose de ventas por método de pago</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="year-select">Año</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Selecciona un año" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="month-select">Mes</Label>
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ChartContainer
          config={{
            amount: {
              label: "Monto Total",
              color: "hsl(var(--chart-1))",
            },
            cash: {
              label: "Efectivo",
              color: "hsl(var(--chart-2))",
            },
            yape: {
              label: "Yape",
              color: "hsl(var(--chart-3))",
            },
            plin: {
              label: "Plin",
              color: "hsl(var(--chart-4))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day"
                type="category"
                allowDuplicatedCategory={false}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="amount" fill="var(--color-amount)" name="Monto Total" />
              <Bar dataKey="cash" fill="var(--color-cash)" name="Efectivo" />
              <Bar dataKey="yape" fill="var(--color-yape)" name="Yape" />
              <Bar dataKey="plin" fill="var(--color-plin)" name="Plin" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}