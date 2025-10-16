
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ListFilter, X, Calendar as CalendarIcon } from 'lucide-react';
import { BUS_OPERATORS, CITIES } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export type TripsFilter = {
  busName: string;
  origin: string;
  destination: string;
  date?: Date;
};

type AdminTripsFilterProps = {
  onFilterChange: (filters: TripsFilter) => void;
};

export default function AdminTripsFilter({ onFilterChange }: AdminTripsFilterProps) {
  const [filters, setFilters] = useState<TripsFilter>({
    busName: 'all',
    origin: 'all',
    destination: 'all',
    date: undefined,
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof TripsFilter, value: string | Date | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      busName: 'all',
      origin: 'all',
      destination: 'all',
      date: undefined,
    });
  };

  const hasActiveFilters =
    filters.busName !== 'all' ||
    filters.origin !== 'all' ||
    filters.destination !== 'all' ||
    !!filters.date;

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListFilter className="w-5 h-5" />
          Filter Trips
        </CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="busName">Bus Operator</Label>
          <Select
            value={filters.busName}
            onValueChange={value => handleFilterChange('busName', value)}
          >
            <SelectTrigger id="busName">
              <SelectValue placeholder="All Buses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buses</SelectItem>
              {BUS_OPERATORS.map(name => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Select
            value={filters.origin}
            onValueChange={value => handleFilterChange('origin', value)}
          >
            <SelectTrigger id="origin">
              <SelectValue placeholder="Any Origin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Origin</SelectItem>
              {CITIES.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Select
            value={filters.destination}
            onValueChange={value => handleFilterChange('destination', value)}
          >
            <SelectTrigger id="destination">
              <SelectValue placeholder="Any Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Destination</SelectItem>
              {CITIES.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date ? format(filters.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.date}
                  onSelect={(date) => handleFilterChange('date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
