
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2, TrendingUp, TrendingDown, BadgePercent, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption
} from "@/components/ui/table"
import type { Booking } from '@/lib/types';
import { format, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import AdminReportsFilter from '@/components/AdminReportsFilter';
import type { DateRange } from 'react-day-picker';

export default function AdminReportsPage() {
  const { admin, loading: adminLoading } = useAdmin();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
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
      allBookings.sort((a, b) => new Date(b.bookingDate as string).getTime() - new Date(a.bookingDate as string).getTime());
      setBookings(allBookings);
      setLoading(false);
    }
  }, [isClient, admin]);

  const filteredBookings = useMemo(() => {
    if (!dateRange?.from) return bookings;
    const start = startOfDay(dateRange.from);
    const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
    
    return bookings.filter(booking => {
        if (!booking.bookingDate) return false;
        const bookingDate = new Date(booking.bookingDate as string);
        return isWithinInterval(bookingDate, { start, end });
    });
  }, [bookings, dateRange]);

  const reportStats = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      acc.totalRevenue += booking.totalPrice ?? 0;
      acc.totalDiscount += booking.discount ?? 0;
      acc.totalProcessingFee += booking.processingFee ?? 0;
      acc.totalVat += booking.vat ?? 0;
      return acc;
    }, {
      totalRevenue: 0,
      totalDiscount: 0,
      totalProcessingFee: 0,
      totalVat: 0,
    });
  }, [filteredBookings]);

  if (!isClient || adminLoading || loading || !admin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Income Reports</h1>
        <p className="text-muted-foreground">
          A detailed breakdown of all income from bookings.
        </p>
      </div>

      <AdminReportsFilter onFilterChange={setDateRange} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 my-8">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">৳{reportStats.totalRevenue.toLocaleString('en-BD')}</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">৳{reportStats.totalDiscount.toLocaleString('en-BD')}</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">৳{reportStats.totalProcessingFee.toLocaleString('en-BD')}</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total VAT</CardTitle>
                  <BadgePercent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">৳{reportStats.totalVat.toLocaleString('en-BD')}</div>
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Detailed Report ({filteredBookings.length} bookings)</CardTitle>
            <CardDescription>A complete list of all financial transactions for bookings in the selected date range.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Trip</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>VAT</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                            <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                            <TableCell>{booking.bookingDate ? format(new Date(booking.bookingDate as string), 'dd MMM, yy') : 'N/A'}</TableCell>
                            <TableCell>
                                <div>{booking.trip.origin} to {booking.trip.destination}</div>
                                <div className="text-xs text-muted-foreground">{booking.trip.bus.name}</div>
                            </TableCell>
                            <TableCell>৳{(booking.subTotal ?? 0).toFixed(2)}</TableCell>
                            <TableCell>৳{(booking.processingFee ?? 0).toFixed(2)}</TableCell>
                            <TableCell>৳{(booking.vat ?? 0).toFixed(2)}</TableCell>
                            <TableCell>৳{(booking.discount ?? 0).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-bold">৳{(booking.totalPrice ?? 0).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                {filteredBookings.length === 0 && (
                    <TableCaption>No reports found for the selected date range.</TableCaption>
                )}
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
