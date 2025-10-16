
'use client';

import { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval, isToday, parse } from 'date-fns';
import { DateRange } from 'react-day-picker';
import type { Booking } from '@/lib/types';

type SalesChartProps = {
  bookings: Booking[];
};

type ChartData = {
  date: string;
  sales: number;
};

type TimeRange = 'today' | '7days' | '30days' | 'custom';

export default function SalesChart({ bookings }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  const chartData = useMemo(() => {
    if (timeRange === 'today') {
      const todayBookings = bookings.filter(b => b.bookingDate && isToday(new Date(b.bookingDate as string)));
      
      const salesByTime = todayBookings.map((booking, index) => ({
          date: format(new Date(booking.bookingDate as string), 'hh:mm a'),
          sales: booking.totalPrice,
          // Add index to make key unique for sorting if times are same
          _fullDate: new Date(booking.bookingDate as string)
      }));
      
      salesByTime.sort((a, b) => a._fullDate.getTime() - b._fullDate.getTime());
      
      return salesByTime;
    }

    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
      case '7days':
        startDate = startOfDay(subDays(new Date(), 6));
        endDate = endOfDay(new Date());
        break;
      case '30days':
        startDate = startOfDay(subDays(new Date(), 29));
        endDate = endOfDay(new Date());
        break;
      case 'custom':
        startDate = date?.from ? startOfDay(date.from) : startOfDay(new Date());
        endDate = date?.to ? endOfDay(date.to) : endOfDay(new Date());
        break;
      default:
        startDate = startOfDay(subDays(new Date(), 6));
        endDate = endOfDay(new Date());
    }

    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    const salesByDate = new Map<string, number>();

    intervalDays.forEach(day => {
        salesByDate.set(format(day, 'MMM d'), 0);
    });

    bookings.forEach(booking => {
      if (!booking.bookingDate) return;
      const bookingDate = new Date(booking.bookingDate as string);
      if (isWithinInterval(bookingDate, { start: startDate, end: endDate })) {
        const dateKey = format(bookingDate, 'MMM d');
        const currentSales = salesByDate.get(dateKey) || 0;
        salesByDate.set(dateKey, currentSales + booking.totalPrice);
      }
    });

    return Array.from(salesByDate, ([date, sales]) => ({ date, sales })).sort((a,b) => parse(a.date, 'MMM d', new Date()).getTime() - parse(b.date, 'MMM d', new Date()).getTime());
  }, [bookings, timeRange, date]);

  const totalSales = chartData.reduce((acc, item) => acc + item.sales, 0);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range !== 'custom') {
        const today = new Date();
        if (range === 'today') {
            setDate({ from: today, to: today });
        } else if (range === '7days') {
            setDate({ from: subDays(today, 6), to: today });
        } else if (range === '30days') {
            setDate({ from: subDays(today, 29), to: today });
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                    Total sales of ৳{totalSales.toLocaleString('en-BD')} in the selected period.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Button variant={timeRange === 'today' ? 'default' : 'outline'} size="sm" onClick={() => handleTimeRangeChange('today')}>Today</Button>
                <Button variant={timeRange === '7days' ? 'default' : 'outline'} size="sm" onClick={() => handleTimeRangeChange('7days')}>7 Days</Button>
                <Button variant={timeRange === '30days' ? 'default' : 'outline'} size="sm" onClick={() => handleTimeRangeChange('30days')}>30 Days</Button>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        size="sm"
                        className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        timeRange === 'custom' && "border-primary"
                        )}
                        onClick={() => setTimeRange('custom')}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} />
            <YAxis tickLine={false} axisLine={false} stroke="#888888" fontSize={12} tickFormatter={(value) => `৳${value}`} />
            <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                cursor={{ fill: 'hsl(var(--muted))' }}
                formatter={(value: number) => [`৳${value.toLocaleString('en-BD')}`, 'Sales']}
            />
            <Legend />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
