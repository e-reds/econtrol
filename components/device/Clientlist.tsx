"use client";

import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar ScrollArea de shadcn/ui
import { Check, X } from "lucide-react";

interface ClientlistProps {
  clientId: string;
  setClientId: (id: string) => void;
}
interface Client {
  id: string;
  name: string;
  nickname: string;
}
export function Clientlist({ clientId, setClientId }: ClientlistProps) {
  const [open, setOpen] = React.useState(false);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const supabase = createClient();

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*");
    if (error) console.error("Error fetching clients:", error);
    else {
      setClients(data || []);
      setFilteredClients(data || []);
      console.log('data clients', data);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowercaseQuery = query.toLowerCase();

    // Filtrar clientes basándose en name o nickname, validando para null o undefined
    const filtered = clients.filter((client) => {
      const nameMatch = client.name.toLowerCase().includes(lowercaseQuery);
      const nicknameMatch = client.nickname
        ? client.nickname.toLowerCase().includes(lowercaseQuery)
        : false; // Si nickname es null o undefined, devuelve false

      return nameMatch || nicknameMatch;
    });

    setFilteredClients(filtered);
  };


  return (
    <div className="relative">
      <Button
        onClick={() => setOpen(!open)}
        variant="ghost"
        className="w-full justify-between bg-gray-900 text-white hover:bg-gray-900/60"
      >
        {clientId
          ? clients.find((client) => client.id === clientId)?.name
          : "Clientes..."}
        <span className="ml-2">▼</span>
      </Button>
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-800 rounded-md shadow-lg p-2">
          <Input
            type="text"
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 pr-10" // Ajuste de padding derecho para acomodar el botón
          />
          {searchQuery && ( // Mostrar el botón solo cuando haya texto en el campo de búsqueda
            <Button
              onClick={() => {
                setSearchQuery(""); // Limpiar el valor del campo de búsqueda
                setFilteredClients(clients); // Restablecer la lista filtrada a todos los clientes
              }}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 p-1" // Posicionar el botón sobre el Input
            >
              <X className="h-4 w-4 text-gray-300" />
            </Button>
          )}
          <ScrollArea className="h-60">
            {filteredClients.length > 0 ? (
              <div>
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      const newClientId = client.id === clientId ? "" : client.id;
                      setClientId(newClientId);
                      setOpen(false);
                    }}
                    className="p-2 hover:bg-gray-800 cursor-pointer transition-colors duration-200 rounded-md flex items-center"
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${clientId === client.id ? "opacity-100" : "opacity-0"
                        }`}
                    />
                    {client.name}{client.nickname ? " - " + client.nickname : ""}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 text-gray-500">No hay clientes.</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
