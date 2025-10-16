
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTrips } from '@/lib/data';
import type { Trip } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import AdminTripsFilter, { type TripsFilter } from '@/components/AdminTripsFilter';


export default function AdminTripsPage() {
    const { admin, loading } = useAdmin();
    const router = useRouter();
    const [allTrips, setAllTrips] = useState<Trip[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [filters, setFilters] = useState<TripsFilter>({
        busName: 'all',
        origin: 'all',
        destination: 'all',
        date: undefined,
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !loading && !admin) {
            router.replace('/admin/login');
        }
    }, [admin, loading, router, isClient]);
    
    useEffect(() => {
        if(isClient && admin) {
            setAllTrips(mockTrips);
        }
    }, [isClient, admin]);

    const filteredTrips = useMemo(() => {
        return allTrips.filter(trip => {
            const busMatch = filters.busName !== 'all' ? trip.bus.name === filters.busName : true;
            const originMatch = filters.origin !== 'all' ? trip.origin === filters.origin : true;
            const destinationMatch = filters.destination !== 'all' ? trip.destination === filters.destination : true;
            const dateMatch = filters.date ? isSameDay(new Date(trip.departureTime), filters.date) : true;
            return busMatch && originMatch && destinationMatch && dateMatch;
        });
    }, [allTrips, filters]);

    if (!isClient || loading || !admin) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const handleDelete = (tripId: string) => {
      if(confirm('Are you sure you want to delete this trip? This is a mock action.')) {
        setAllTrips(prev => prev.filter(t => t.id !== tripId));
      }
    }

    return (
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Trips</h1>
                    <p className="text-muted-foreground">
                    View, add, edit, or delete all bus trips.
                    </p>
                </div>
                <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New Trip
                </Button>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 items-start">
                <div className="md:col-span-1">
                    <AdminTripsFilter onFilterChange={setFilters} />
                </div>
                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Trips ({filteredTrips.length})</CardTitle>
                            <CardDescription>A list of all scheduled trips in the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Bus</TableHead>
                                        <TableHead>Departure</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Seats</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTrips.map((trip) => {
                                        const totalSeats = (trip.seatLayout.rows - trip.seatLayout.gapRows.length) * trip.seatLayout.cols;
                                        const availableSeats = totalSeats - trip.seatLayout.booked.length;
                                        return (
                                        <TableRow key={trip.id}>
                                            <TableCell className="font-medium">{trip.origin} to {trip.destination}</TableCell>
                                            <TableCell>
                                            <div>{trip.bus.name}</div>
                                            <div className="text-xs text-muted-foreground">{trip.bus.type}</div>
                                            </TableCell>
                                            <TableCell>{format(new Date(trip.departureTime), 'dd MMM, hh:mm a')}</TableCell>
                                            <TableCell>৳{trip.price.toFixed(2)}</TableCell>
                                            <TableCell>
                                            <Badge variant={availableSeats > 5 ? "secondary" : "destructive"}>
                                                {availableSeats} / {totalSeats} available
                                            </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit (Coming Soon)
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(trip.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete (Mock)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                                {filteredTrips.length === 0 && (
                                    <TableCaption>No trips found matching your criteria.</TableCaption>
                                )}
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        </div>
    );
}
