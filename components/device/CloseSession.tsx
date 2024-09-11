import { SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface Session {
    id: string;
    client_id: string;
    pc_number: string;
    start_time: string;
    end_time?: string;
    mode: string;
    total_amount?: number;
    pc_id: string;
    status: string;
    advance_payment?: number;
    observation?: string;
    optional_client?: string;
    yape?: number;
    plin?: number;
    cash?: number;
    debt?: number;
    money_advance?: number;
    change?: number;
}

interface PC {
    id: string;
    number: string;
}

interface CloseSessionProps {
    currentSession: Session | null;  // Puede ser null si no hay sesión activa
    selectedPC: PC | null;           // Puede ser null si no hay PC seleccionada
    totalAmount: number;
    totalAdvancePayment: number;
    onUpdatePCStatus: (pcId: string, status: string) => void;
    setStatus: (status: 'available' | 'occupied' | 'maintenance') => void;
    setCurrentSession: (session: Session | null) => void;
    setConsumptions: (consumptions: any[]) => void;
}

export function CloseSession({
    currentSession,
    selectedPC,
    totalAmount,
    totalAdvancePayment,
    onUpdatePCStatus,
    setStatus,
    setCurrentSession,
    setConsumptions,
}: CloseSessionProps) {
    const [yapeAmount, setYapeAmount] = useState(0);
    const [plinAmount, setPlinAmount] = useState(0);
    const [cashAmount, setCashAmount] = useState(0);
    const [debitAmount, setDebitAmount] = useState(0);
    const [observation, setObservation] = useState("");
    const [clientOptional, setClientOptional] = useState("");
    const [moneyAdvance, setMoneyAdvance] = useState(0);
    const [change, setChange] = useState(0);

    useEffect(() => {
        const totalPaid = moneyAdvance + cashAmount + plinAmount + yapeAmount;
        const newChange = totalPaid > totalAmount ? totalPaid - totalAmount : 0;
        setChange(newChange);
    }, [moneyAdvance, cashAmount, plinAmount, yapeAmount, totalAmount]);

    useEffect(() => {
        if (currentSession) {
            setYapeAmount(currentSession.yape || 0);
            setPlinAmount(currentSession.plin || 0);
            setCashAmount(currentSession.cash || 0);
            setDebitAmount(currentSession.debt || 0);
            setObservation(currentSession.observation || "");
            setClientOptional(currentSession.optional_client || "");
            setMoneyAdvance(currentSession.money_advance || 0);
        }
    }, [currentSession]);

    const updateAllStates = (newYapeAmount: SetStateAction<number>, newPlinAmount: SetStateAction<number>, newCashAmount: SetStateAction<number>, newDebitAmount: SetStateAction<number>, newObservation: SetStateAction<string>, newClientOptional: SetStateAction<string>, newMoneyAdvance: SetStateAction<number>) => {
        setYapeAmount(newYapeAmount);
        setPlinAmount(newPlinAmount);
        setCashAmount(newCashAmount);
        setDebitAmount(newDebitAmount);
        setObservation(newObservation);
        setClientOptional(newClientOptional);
        setMoneyAdvance(newMoneyAdvance);
    };

    const handleYapeChange = (e: { target: { value: string; }; }) => {
        const newYapeAmount = parseFloat(e.target.value);
        const newDebitAmount = Math.max(totalAmount - (newYapeAmount + plinAmount + cashAmount + moneyAdvance + totalAdvancePayment), 0);
        updateAllStates(newYapeAmount, plinAmount, cashAmount, newDebitAmount, observation, clientOptional, moneyAdvance);
    };

    const handlePlinChange = (e: { target: { value: string; }; }) => {
        const newPlinAmount = parseFloat(e.target.value);
        const newDebitAmount = Math.max(totalAmount - (yapeAmount + newPlinAmount + cashAmount + moneyAdvance + totalAdvancePayment), 0);
        updateAllStates(yapeAmount, newPlinAmount, cashAmount, newDebitAmount, observation, clientOptional, moneyAdvance);
    };

    const handleCashChange = (e: { target: { value: string; }; }) => {
        const newCashAmount = parseFloat(e.target.value);
        const newDebitAmount = Math.max(totalAmount - (yapeAmount + plinAmount + newCashAmount + moneyAdvance + totalAdvancePayment), 0);
        updateAllStates(yapeAmount, plinAmount, newCashAmount, newDebitAmount, observation, clientOptional, moneyAdvance);
    };

    const handleMoneyAdvanceChange = (e: { target: { value: string; }; }) => {
        const newMoneyAdvance = parseFloat(e.target.value);
        const newDebitAmount = Math.max(totalAmount - (yapeAmount + plinAmount + cashAmount + newMoneyAdvance + totalAdvancePayment), 0);
        updateAllStates(yapeAmount, plinAmount, cashAmount, newDebitAmount, observation, clientOptional, newMoneyAdvance);
    };

    const handleObservationChange = (e: { target: { value: any; }; }) => {
        const newObservation = e.target.value;
        updateAllStates(yapeAmount, plinAmount, cashAmount, debitAmount, newObservation, clientOptional, moneyAdvance);
    };

    const handleClientOptionalChange = (e: { target: { value: any; }; }) => {
        const newClientOptional = e.target.value;
        updateAllStates(yapeAmount, plinAmount, cashAmount, debitAmount, observation, newClientOptional, moneyAdvance);
    };

const handleCreateDebit = async () => {
    if (!selectedPC || !currentSession) return;
    try {
        const { error } = await supabase
            .from("debits")
            .insert({
                pc_id: selectedPC.id,
                session_id: currentSession.id,
                amount: debitAmount,          
                client_id: currentSession.client_id,
                pc_number: currentSession.pc_number,      
                status: debitAmount > 0 ? false : true
            })
            .select()

        if (error) {
            console.error("Error creating debit:", error);
        }
    } catch 
    
    (error) 
    {console.error("Error creating debit:", error);}
}

    const handleCloseSession = async () => {
        if (!selectedPC || !currentSession) return;
        try {
            const { error } = await supabase
                .from("sessions")
                .update({
                    end_time: new Date().toISOString(),
                    total_amount: totalAmount,
                    status: "inactive",
                    advance_payment: totalAdvancePayment,
                    yape: yapeAmount,
                    plin: plinAmount,
                    cash: cashAmount,
                    debt: debitAmount,
                    observation: observation,
                    optional_client: clientOptional,
                    money_advance: moneyAdvance,
                    change: change,
                })
                .eq("id", currentSession.id);

            if (error) {
                console.error("Error closing session:", error);
            } else {
                onUpdatePCStatus(selectedPC.id, "available");
                setCurrentSession(null);
                setConsumptions([]);
                setStatus("available");
                // Reset form fields
                setYapeAmount(0);
                setPlinAmount(0);
                setCashAmount(0);
                setDebitAmount(0);
                setObservation("");
                setClientOptional("");
                setMoneyAdvance(0);
                handleCreateDebit();
            }
        } catch (error) {
            console.error("Error closing session:", error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md">
                    Cobrar
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-[600px] bg-gray-900">
                <DialogHeader>
                    <DialogTitle>Cobrar PC {selectedPC?.number}</DialogTitle>
                    <DialogDescription>
                        Esta acción es definitiva, no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="yape" className="text-left">
                            Yape
                        </Label>
                        <Input
                            type="number"
                            id="yape"
                            value={yapeAmount}
                            onChange={handleYapeChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="plin" className="text-left">
                            Plin
                        </Label>
                        <Input
                            type="number"
                            id="plin"
                            value={plinAmount}
                            onChange={handlePlinChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cash" className="text-left">
                            Cash
                        </Label>
                        <Input
                            type="number"
                            id="cash"
                            value={cashAmount}
                            onChange={handleCashChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="advance_payment" className="text-left">
                            Anticipo
                        </Label>
                        <Input
                            type="number"
                            id="advance_payment"
                            value={moneyAdvance}
                            onChange={handleMoneyAdvanceChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="debit" className="text-left">
                            Deuda
                        </Label>
                        <Input
                            type="number"
                            id="debit"
                            value={debitAmount}
                            onChange={(e) => setDebitAmount(parseFloat(e.target.value))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="optional_client" className="text-left text-xs">
                            Apodo
                        </Label>
                        <Input
                            type="text"
                            id="optional_client"
                            placeholder="Apodo"
                            value={clientOptional}
                            onChange={handleClientOptionalChange}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <div className="mt flex items-center">
                    <div className="relative w-full flex">
                        <Textarea
                            id="observaciones"
                            placeholder="Agregar observaciones..."
                            value={observation}
                            onChange={handleObservationChange}
                            className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            rows={2}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1 mt-4 font-mono text-sm">
                    <div className="bg-slate-600 p-4 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs">Monto Total</span>
                            <span className="text-right text-white font-bold text-3xl font-mono">{`${totalAmount.toFixed(2)}`}</span>
                        </div>
                    </div>
                    <div className="bg-slate-600 p-4 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs">Adelanto</span>
                            <span className="text-right text-green-400 font-bold text-3xl font-mono">{`${totalAdvancePayment.toFixed(2)}`}</span>
                        </div>
                    </div>
                    <div className="bg-slate-600 p-4 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs">Total Cobrar</span>
                            <span className="text-right text-red-400 font-bold text-3xl font-mono">{`${Math.max(totalAmount - (yapeAmount + plinAmount + cashAmount + totalAdvancePayment + moneyAdvance), 0).toFixed(2)}`}</span>
                        </div>
                    </div>
                    <div className="bg-slate-600 p-4 rounded-lg">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs">Vuelto</span>
                            <span className="text-right text-blue-400 font-bold text-3xl font-mono">
                                {`${change.toFixed(2)}`}
                            </span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleCloseSession}>
                        Cobrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}