
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2, Package, Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Booking } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import AdminBookingsFilter, { type BookingsFilter } from '@/components/AdminBookingsFilter';

export default function AdminBookingsPage() {
  const { admin, loading: adminLoading } = useAdmin();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookingsFilter>({
    origin: 'all',
    destination: 'all',
    busName: 'all',
    date: undefined,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !adminLoading && !admin) {
        router.replace('/admin/login');
    }
  }, [admin, adminLoading, router, isClient]);

  useEffect(() => {
    if (isClient && admin) {
      setLoading(true);
      const allBookings: Booking[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("booking_")) {
          const bookingData = localStorage.getItem(key);
          if (bookingData) {
            allBookings.push(JSON.parse(bookingData));
          }
        }
      }
      allBookings.sort((a, b) => {
        const dateA = a.bookingDate ? new Date(a.bookingDate as string).getTime() : 0;
        const dateB = b.bookingDate ? new Date(b.bookingDate as string).getTime() : 0;
        return dateB - dateA;
      });
      setBookings(allBookings);
      setLoading(false);
    }
  }, [isClient, admin]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const originMatch = filters.origin !== 'all' ? booking.trip.origin === filters.origin : true;
      const destinationMatch = filters.destination !== 'all' ? booking.trip.destination === filters.destination : true;
      const busNameMatch = filters.busName !== 'all' ? booking.trip.bus.name === filters.busName : true;
      const dateMatch = filters.date && booking.bookingDate ? isSameDay(new Date(booking.bookingDate as string), filters.date) : true;
      return originMatch && destinationMatch && busNameMatch && dateMatch;
    });
  }, [bookings, filters]);

  if (!isClient || adminLoading || loading || !admin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">All Bookings</h1>
        <p className="text-muted-foreground">
          Here is a list of all customer bookings stored in the local browser.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8 items-start">
        <div className="md:col-span-1">
          <AdminBookingsFilter onFilterChange={setFilters} />
        </div>
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
                <CardTitle>Bookings History ({filteredBookings.length})</CardTitle>
                <CardDescription>A complete list of all bookings made.</CardDescription>
            </CardHeader>
            <CardContent>
                {filteredBookings.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Booking ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Trip</TableHead>
                            <TableHead>Bus</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Seats</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.map((booking, index) => (
                                <TableRow key={`${booking.id}-${index}`}>
                                    <TableCell className="font-medium">{booking.id}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{booking.contactName}</div>
                                        <div className="text-sm text-muted-foreground">{booking.contactMobile}</div>
                                    </TableCell>
                                    <TableCell>{booking.trip.origin} to {booking.trip.destination}</TableCell>
                                    <TableCell>{booking.trip.bus.name}</TableCell>
                                    <TableCell>{booking.bookingDate ? format(new Date(booking.bookingDate as string), 'PPP') : 'N/A'}</TableCell>
                                    <TableCell>{booking.seats.join(', ')}</TableCell>
                                    <TableCell className="text-right">৳{booking.totalPrice.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16">
                        <Ticket className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h2 className="text-xl font-semibold mt-4">No Bookings Found</h2>
                        <p className="text-muted-foreground mt-2">
                            There are no bookings recorded that match your filters.
                        </p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
