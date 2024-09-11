"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/utils/supabase/client";
import { IconSquarePlus } from "@tabler/icons-react";
import { useState } from "react";

const supabase = createClient();

export function Addclient() {
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [popoverOpen, setPopoverOpen] = useState(false); // Controla el estado del Popover

    const handleAddClient = async () => {
        try {
            const { data, error } = await supabase
                .from("clients")
                .insert({ name, nickname });

            if (error) {
                console.error("Error adding client:", error);
            } else {
                console.log("Client added:", data);
                // Limpiar los campos de entrada después de agregar el cliente
                setName("");
                setNickname("");
                // Cerrar el Popover
                setPopoverOpen(false);
            }
        } catch (error) {
            console.error("Error adding client:", error);
        }
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant={'ghost'} className='hover:bg-gray-700'>
                    <IconSquarePlus stroke={2} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-900">
                <div className="grid gap-4 p-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Agregar Cliente</h4>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={name} // Controla el valor del input
                                onChange={(e) => setName(e.target.value)} // Actualiza el estado de 'name'
                                className="col-span-2 h-8"
                                placeholder="Ej. Juan Perez"
                            />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="nickname">Apodo</Label>
                            <Input
                                id="nickname"
                                value={nickname} // Controla el valor del input
                                onChange={(e) => setNickname(e.target.value)} // Actualiza el estado de 'nickname'
                                className="col-span-2 h-8"
                                placeholder="Ej. Pepito"
                            />
                        </div>
                        <div>
                            <Button onClick={handleAddClient} className="w-full">
                                Aceptar
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
