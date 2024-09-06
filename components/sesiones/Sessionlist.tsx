"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { IconCalendarMonth, IconCalendarFilled, IconUser, IconClock, IconReceipt2 } from '@tabler/icons-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Session {
  id: string;
  client_id: string;
  pc_number: string;
  start_time: string;
  end_time?: string;
  status: string;
  client_name?: string;
  total_amount?: number;
}

interface Consumption {
  id: string;
  session_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

interface SessionListProps {
  selectedPC: string | null;
  updateSessions: boolean; // Estado para forzar la actualización
}

const SessionList: React.FC<SessionListProps> = ({ selectedPC, updateSessions }) => {
  const supabase = createClient();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [consumptions, setConsumptions] = useState<{ [key: string]: Consumption[] }>({});
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (selectedPC) {
      fetchSessions();
    }
  }, [selectedPC, startDate, endDate, updateSessions]); // Agregar updateSessions como dependencia

  const fetchSessions = async () => {
    try {
        const { data: sessionsData, error: sessionsError } = await supabase
      .from("sessions")
      .select("*, clients(name)")
      .eq("pc_number", selectedPC)
      .gte("start_time", startDate)
      .lte("start_time", endDate + "T23:59:59Z");

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
    } else {
      const sessionsWithClientNames = sessionsData.map((session: any) => ({
        ...session,
        client_name: session.clients.name,
      }));
      setSessions(sessionsWithClientNames);

      // Fetch consumptions for each session
      sessionsWithClientNames.forEach((session: Session) => {
        fetchConsumptions(session.id);
      });
    }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  
  };

  const fetchConsumptions = async (sessionId: string) => {
    try {
       const { data: consumptionsData, error: consumptionsError } = await supabase
      .from("consumptions")
      .select("*")
      .eq("session_id", sessionId);

    if (consumptionsError) {
      console.error("Error fetching consumptions:", consumptionsError);
    } else {
      setConsumptions((prev) => ({
        ...prev,
        [sessionId]: consumptionsData,
      }));
    }
    } catch (error) {
      console.error("Error fetching consumptions:", error);
    }
   
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
    const date = e.target.value;
    if (type === "start") setStartDate(date);
    if (type === "end") setEndDate(date);
  };

  return (
    <div className="p-2 w-full h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-300 mb-4">
        Sesiones de la PC{selectedPC ? `: ${selectedPC}` : ""}
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 w-full">
        <div className="flex flex-col items-start space-y-2 w-full sm:w-1/2">
          <Label htmlFor="start_date" className="text-gray-600">
            Fecha de inicio:
          </Label>
          <Input
            id="start_date"
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange(e, "start")}
            className="w-full"
          />
        </div>
        <div className="flex flex-col items-start space-y-2 w-full sm:w-1/2">
          <Label htmlFor="end_date" className="text-gray-600">
            Fecha de fin:
          </Label>
          <Input
            id="end_date"
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange(e, "end")}
            className="w-full"
          />
        </div>
      </div>

      <ScrollArea className="max-h-[600px] overflow-y-auto rounded-md p-4 shadow-sm bg-gray-50">
        <Accordion type="single" collapsible className="space-y-2">
          {sessions.map((session) => (
            <AccordionItem key={session.id} value={session.id}>
              <AccordionTrigger className="flex justify-between items-center p-2 bg-gray-100 rounded-lg shadow-sm">
                <div className="flex items-center  text-gray-800">
                  <IconUser className="w-5 h-5 text-green-500" />
                  <p>{session.client_name || "Desconocido"}</p>
                </div>
                <div className="flex items-center  text-gray-800">
                  <IconCalendarFilled className="w-5 h-5 text-blue-500" />
                  <p> {new Date(session.start_time).toLocaleString('es-PE', {
                    timeZone: 'America/Lima',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-gray-50 rounded-lg bg-gray-400">
                <div className="flex flex-col space-y-2 text-gray-800">
                  {/* Inicio y Fin en la misma fila */}
                  <div className="flex flex-row space-x-4 items-center">
                    <div className="flex items-center space-x-1">
                      <IconClock className="w-5 h-5 text-green-500" />
                      <p>
                        <strong>Inicio:</strong> {new Date(session.start_time).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                    {session.end_time && (
                      <div className="flex items-center space-x-1">
                        <IconClock className="w-5 h-5 text-red-500" />
                        <p>
                          <strong>Fin:</strong> {new Date(session.end_time).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                    )}
                     {/* Total en una fila separada */}
                    <div className="flex items-center space-x-2">
                  <IconReceipt2 className="w-5 h-5 text-blue-500" />
                    <p>
                      <strong>Total:</strong> S/ <span className="font-bold">{session.total_amount?.toFixed(2) || '0.00'}</span>
                    </p>
                  </div>
                  </div>                                   
                </div>


                {consumptions[session.id] && consumptions[session.id].length > 0 ? (
                  <div className="mt-4">
                    {/* <h3 className="text-lg font-semibold text-sm text-gray-700 mb-2">Productos Consumidos</h3> */}
                    <ul className="space-y-2">
                      {consumptions[session.id].map((consumption) => (
                        <li
                          key={consumption.id}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-gray-700 p-2 bg-gray-100 rounded-md shadow-sm"
                        >
                          <div className="flex-1">
                            <span className="block text-base font-mono text-xs">
                              {consumption.product_name} - {consumption.quantity} x S/ {consumption.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:ml-4 text-sm text-gray-500 font-mono text-xs">
                            {new Date(consumption.created_at).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>

                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-4 text-gray-500">No se encontraron consumos para esta sesión.</p>
                )}

              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default SessionList;
