"use client";
import { format, formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Productlist } from '../device/Productlist';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Product {
    id: string;
    name: string;
    price: number;
}

interface Consumption {
    id: string;
    product_id: string;
    quantity: number;
    created_at: string;
    // Añade otros campos según sea necesario
}

interface ProductConsumption {
    product_name: string;
    total_quantity: number;
}

export default function ProductsReport() {
    const supabase = createClient();
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [consumptions, setConsumptions] = useState<Consumption[]>([]);
    const [productConsumptions, setProductConsumptions] = useState<ProductConsumption[]>([]);

    const TIME_ZONE_OFFSET = -5; // Perú está en UTC-5

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
            if (error) {
                console.error(error);
            } else {
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setOpen(true);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchProducts();
        fetchAllProductConsumptions();
        if (selectedProductId) {
            fetchConsumptions(selectedProductId);
        }
    }, [startDate, endDate, selectedProductId]);

    const fetchConsumptions = async (productId: string) => {
        // Crear la fecha inicial y final en la zona horaria de Perú (UTC-5)
        const startDatePeru = `${startDate}T06:00:00-05:00`;
        const endDatePeru = `${endDate}T06:00:00-05:00`;

        // Convertir a UTC usando date-fns-tz
        const startDateUtc = formatInTimeZone(startDatePeru, 'America/Lima', 'yyyy-MM-dd HH:mm:ssXXX')
        const endDateUtc = formatInTimeZone(endDatePeru, 'America/Lima', 'yyyy-MM-dd HH:mm:ssXXX')

        try {
            const { data, error } = await supabase
                .from('consumptions')
                .select('*')
                .eq('product_name', productId)
                .gte('created_at', startDateUtc)
                .lte('created_at', endDateUtc);

            if (error) {
                console.error('Error fetching consumptions:', error);
            } else {
                console.log(data);
                setConsumptions(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchAllProductConsumptions = async () => {
        const startDatePeru = new Date(`${startDate}T06:00:00`);
        const endDatePeru = new Date(`${endDate}T06:00:00`);

        const startDateUtc = new Date(startDatePeru.getTime() - TIME_ZONE_OFFSET * 60 * 60 * 1000);
        const endDateUtc = new Date(endDatePeru.getTime() - TIME_ZONE_OFFSET * 60 * 60 * 1000);

        try {
            const { data, error } = await supabase
                .from('consumptions')
                .select('product_name, quantity')
                .gte('created_at', startDateUtc.toISOString())
                .lte('created_at', endDateUtc.toISOString());

            if (error) {
                console.error('Error fetching consumptions:', error);
                return;
            }

            const groupedConsumptions = data.reduce((acc, curr) => {
                const existingProduct = acc.find(item => item.product_name === curr.product_name);
                if (existingProduct) {
                    existingProduct.total_quantity += curr.quantity;
                } else {
                    acc.push({ product_name: curr.product_name, total_quantity: curr.quantity });
                }
                return acc;
            }, [] as ProductConsumption[]);

            setProductConsumptions(groupedConsumptions);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <h1>Reporte de Productos</h1>
            <div>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="relative">
                <Button
                    onClick={() => setOpen(!open)}
                    variant={"ghost"}
                    className="w-full justify-between bg-gray-900 text-white hover:bg-gray-900/60"
                >
                    {selectedProductId
                        ? products.find((product) => product.id === selectedProductId)?.name
                        : "Buscar Producto..."}
                    <span className="ml-2">▼</span>
                </Button>
                {open && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-900 rounded-md shadow-lg p-2">
                        <Input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full p-2"
                        />

                        {filteredProducts.length > 0 ? (
                            <ScrollArea className="h-60 mt-3">
                                <div>
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => {
                                                setSelectedProductId(product.name);
                                                setOpen(false);
                                                setSearchQuery(''); // Limpiar la búsqueda después de seleccionar
                                                console.log('Producto seleccionado:', product.name); // Log del ID seleccionado
                                            }}
                                            className="p-2 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors duration-200 rounded-md"
                                        >
                                            {product.name}
                                        </div>

                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="p-2 text-gray-500">No hay productos que coincidan con la búsqueda.</div>
                        )}

                    </div>
                )}
            </div>

            {selectedProductId && (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                    <h2 className="text-sm font-semibold bg-gray-800 text-white p-2 rounded-md">Producto <span className="text-sky-400">{selectedProductId}</span> cantidad: <span className="text-sky-400">{consumptions.length}</span></h2>
                    <ScrollArea className="h-60 mt-3">
                        <div className="mt-4">

                            <Table>

                                <TableBody>
                                    {consumptions.map((consumption) => (
                                        <TableRow key={consumption.id}>
                                            <TableCell>{consumption.id}</TableCell>
                                            <TableCell>{consumption.quantity}</TableCell>
                                            <TableCell>{new Date(consumption.created_at).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </ScrollArea></>
            )}
            
            <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                    <h2 className="text-sm font-semibold bg-gray-800 text-white p-2 rounded-md">Total de Productos: <span className="text-sky-400">{productConsumptions.length}</span></h2>
                    <ScrollArea className="h-60 mt-3">
                        <div className="mt-4">

                            <Table>

                                <TableBody>
                                    {productConsumptions.sort((a, b) => b.total_quantity - a.total_quantity).map((productConsumption) => (
                                        <TableRow key={productConsumption.product_name}>
                                            <TableCell>{productConsumption.product_name}</TableCell>
                                            <TableCell>{productConsumption.total_quantity}</TableCell>                                           
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </ScrollArea></>
        </div>
    )
}