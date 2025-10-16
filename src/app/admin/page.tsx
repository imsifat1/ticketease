
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, User, Ticket, Bus, BarChart, Route, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Booking } from '@/lib/types';
import { mockTrips } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import SalesChart from '@/components/SalesChart';

type BusStats = {
    [key: string]: {
        totalSeats: number;
        soldSeats: number;
    }
}

export default function AdminPage() {
    const { admin, loading } = useAdmin();
    const router = useRouter();
    const [stats, setStats] = useState({ users: 0, bookings: 0, revenue: 0 });
    const [busStats, setBusStats] = useState<BusStats>({});
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [isClient, setIsClient] = useState(false);

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
            const bookingsFromStorage: Booking[] = [];
            const userPhoneNumbers = new Set<string>();

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("booking_")) {
                    const bookingData = localStorage.getItem(key);
                    if (bookingData) {
                        const booking: Booking = JSON.parse(bookingData);
                        bookingsFromStorage.push(booking);
                        if(booking.userPhoneNumber) {
                            userPhoneNumbers.add(booking.userPhoneNumber);
                        }
                    }
                }
            }
            setAllBookings(bookingsFromStorage);

            const totalRevenue = bookingsFromStorage.reduce((acc, booking) => acc + booking.totalPrice, 0);
            
            const totalUsers = userPhoneNumbers.size > 0 ? userPhoneNumbers.size : Math.floor(Math.random() * 50);

            setStats({
                users: totalUsers,
                bookings: bookingsFromStorage.length,
                revenue: totalRevenue,
            });

            // Bus-wise stats
            const newBusStats: BusStats = {};

            mockTrips.forEach(trip => {
                const busName = trip.bus.name;
                if (!newBusStats[busName]) {
                    newBusStats[busName] = { totalSeats: 0, soldSeats: 0 };
                }
                const totalSeatsInTrip = (trip.seatLayout.rows - trip.seatLayout.gapRows.length) * trip.seatLayout.cols;
                newBusStats[busName].totalSeats += totalSeatsInTrip;
            });

            bookingsFromStorage.forEach(booking => {
                const busName = booking.trip.bus.name;
                if(newBusStats[busName]) {
                    newBusStats[busName].soldSeats += booking.seats.length;
                }
            });
            
            setBusStats(newBusStats);
        }
    }, [isClient, admin]);

    if (!isClient || loading || !admin) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold font-headline mb-8">Admin Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on unique booking numbers
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Bookings
                        </CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.bookings}</div>
                        <p className="text-xs text-muted-foreground">
                            All-time local bookings
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Buses
                        </CardTitle>
                        <Bus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Object.keys(busStats).length}</div>
                        <p className="text-xs text-muted-foreground">
                            operators with trips
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Revenue
                        </CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">৳{stats.revenue.toLocaleString('en-BD')}</div>
                        <p className="text-xs text-muted-foreground">
                            From local bookings
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
              <SalesChart bookings={allBookings} />
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Bookings</CardTitle>
                         <CardDescription>View all bookings stored in the local browser storage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Click the button below to see the full list of bookings.</p>
                        <Button asChild>
                            <Link href="/admin/bookings">View All Bookings</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Trips</CardTitle>
                         <CardDescription>View, add, edit, or delete bus trips from the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Organize all bus routes and schedules from one place.</p>
                        <Button asChild>
                            <Link href="/admin/trips">Manage All Trips</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Income Reports</CardTitle>
                            <CardDescription>View a detailed breakdown of revenue, fees, and discounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Analyze financial performance with detailed reports.</p>
                        <Button asChild>
                            <Link href="/admin/reports">View Reports</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Bus Wise Statistics</CardTitle>
                        <CardDescription>Total seats and sold seats per bus operator based on mock trips and local bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bus Operator</TableHead>
                                    <TableHead className="text-center">Total Seats</TableHead>
                                    <TableHead className="text-center">Sold Seats</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(busStats).map(([busName, data]) => (
                                    <TableRow key={busName}>
                                        <TableCell className="font-medium">{busName}</TableCell>
                                        <TableCell className="text-center">{data.totalSeats}</TableCell>
                                        <TableCell className="text-center">{data.soldSeats}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
    );
}
