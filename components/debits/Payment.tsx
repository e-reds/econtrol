import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/utils/supabase/client';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { IconCreditCardPay } from '@tabler/icons-react';
interface PaymentProps {
    debitId: number;
    amountdebit: number;
    refreshDebits: () => void;
    setRefreshdata: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Payment({ debitId, amountdebit, refreshDebits, setRefreshdata }: PaymentProps) {
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [amount, setAmount] = useState(amountdebit);
    const [details, setDetails] = useState("");
    const [loading, setLoading] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false); // Estado para controlar la visibilidad del Popover

    const supabase = createClient();

    const handleAdddebitdetails = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('debits_details')
                .insert([
                    { debts_id: debitId, amount: amount, payment_method: paymentMethod, details: details },
                ])
                .select();

            if (error) throw error;

            await handleAbonar();

            refreshDebits();
            setRefreshdata(prev => !prev);
            setPopoverOpen(false); // Cierra el Popover después de completar la operación

            setLoading(false);
        } catch (error) {
            console.error("Error updating debits:", error);
            setLoading(false); // Asegurarse de restablecer el estado de carga si hay un error
        }
    };

    const handleAbonar = async () => {
        try {
            const totalpaymet = amountdebit - amount;
            const { error } = await supabase
                .from("debits")
                .update({ status: totalpaymet > 0 ? false : true, amount: totalpaymet })
                .eq("id", debitId);
            if (error) throw error;
        } catch (error) {
            console.error("Error updating debits:", error);
        }
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" onClick={() => setPopoverOpen(true)}>
                    <IconCreditCardPay />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-900">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Abonar</h4>
                        <p className="text-sm text-red-500">
                            Total deuda: {amountdebit.toFixed(2)}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor="amount">Monto</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="col-span-2 h-8"
                                min={1}
                                max={amountdebit}
                            />
                        </div>
                        <div className="flex flex-col mb-2">
                            <div className="mb-2"> Detalle </div>
                            <Textarea 
                                placeholder="Describe el motivo del abono."
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 items-center gap-4">
                            <Label htmlFor="paymentMethod">Método de Pago</Label>
                            <RadioGroup
                                id="paymentMethod"
                                value={paymentMethod}
                                onValueChange={setPaymentMethod}
                                className="flex flex-row space-y-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yape" id="yape" />
                                    <Label htmlFor="yape">Yape</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="plin" id="plin" />
                                    <Label htmlFor="plin">Plin</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash">Efectivo</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={handleAdddebitdetails} disabled={loading}>
                        {loading ? "Procesando..." : "Abonar"}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
