"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar el componente ScrollArea
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { IconSquareLetterX } from "@tabler/icons-react";
interface Consumption {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    paid: boolean;
  }
interface ConsumProps {
    consumptions: Consumption[];
    handleUpdateQuantity: (consumptionId: string, newQuantity: number, consumption: Consumption) => void;
    handleUpdatePaid: (consumptionId: string, paid: boolean) => void;
    handleRemoveConsumption: (consumptionId: string) => void;
}

export function ConsumOptions({ consumptions, handleUpdateQuantity, handleUpdatePaid, handleRemoveConsumption }: ConsumProps) {

    return (
        <div >
            <ScrollArea className="h-60 mt-3"> {/* No es necesario aplicar overflow-y-auto manualmente */}
                <div>
                {consumptions.map((consumption) => (
                      <div>
                      <li
                        key={consumption.id}
                        className="flex justify-between items-center bg-gray-700 p-2 rounded-md shadow text-xs mb-1"
                      >
                        <span>{consumption.product_name} - {consumption.quantity} x S/ {consumption.price.toFixed(2)}</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={consumption.quantity}
                            onChange={(e) => handleUpdateQuantity(consumption.id, parseInt(e.target.value), consumption)}
                            className="w-12 text-center bg-gray-800 border border-gray-600 rounded-md p-1"
                            disabled={consumption.paid}
                          />
                          <div className="flex items-center space-x-1">
                            <Switch id={consumption.id}
                              checked={consumption.paid}
                              onCheckedChange={() => handleUpdatePaid(consumption.id, !consumption.paid)}
                            />
                            <Label htmlFor={consumption.id} className="text-xs font-mono">Pagado</Label>
                          </div>
                          <IconSquareLetterX onClick={() => handleRemoveConsumption(consumption.id)} className='cursor-pointer hover:text-red-500' />
                        </div>
                      </li>
                      </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
