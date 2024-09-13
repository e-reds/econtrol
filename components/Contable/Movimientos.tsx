"use client"
import { useState } from "react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import Swal from "sweetalert2";

const supabase = createClient();

export function Movimientos() {
    const [isOpen, setIsOpen] = useState(false);
    const [movementType, setMovementType] = useState("ingreso");
    const [amount, setAmount] = useState("0");
    const [description, setDescription] = useState("");

    const handleSave = async () => {
        if (!movementType || !amount || !description) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Todos los campos son obligatorios!',
            })
            return;
        }

        try {
            const { data, error } = await supabase
                .from("mov_contable")
                .insert({
                    type: movementType,
                    amount: parseFloat(amount),
                    detail: description,
                });

            if (error) throw error;

           Swal.fire({
            icon: 'success',
            title: 'Movimiento guardado exitosamente!',
            showConfirmButton: false,
            timer: 1500
           })
            // Limpiar los campos después de guardar
            setMovementType("ingreso");
            setAmount("0");
            setDescription("");
            setIsOpen(false); // Cerrar el popover después de guardar
        } catch (error) {
            console.error("Error al guardar el movimiento:", error);
            alert("Ocurrió un error al guardar el movimiento.");
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Label className='cursor-pointer'>Movimientos</Label>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none mb-4">Ingresos/Egresos</h4>
                        <div className="flex items-center space-x-2">
                            <RadioGroup 
                                value={movementType} 
                                onValueChange={setMovementType} 
                                className="flex flex-row gap-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ingreso" id="r1" />
                                    <Label htmlFor="r1">Ingreso</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="egreso" id="r2" />
                                    <Label htmlFor="r2">Egreso</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="width">Monto</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="col-span-2 h-8 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <Textarea
                                id="observaciones"
                                placeholder="Agregar detalles..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                                rows={2}
                            />
                        </div>                       
                        <div className="grid grid-cols-1 items-center gap-4 mt-2 ">
                            <Button className="bg-sky-500 hover:bg-sky-300" onClick={handleSave}>
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
