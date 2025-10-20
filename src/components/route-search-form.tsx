"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, ArrowRightLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { CityCombobox } from '@/components/city-combobox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function RouteSearchForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  const handleSearch = () => {
    if (!fromCity || !toCity || !departureDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select departure/arrival cities and a travel date.',
        variant: 'destructive',
      });
      return;
    }

    if (fromCity === toCity) {
      toast({
        title: 'Invalid Route',
        description: 'Departure and arrival cities cannot be the same.',
        variant: 'destructive',
      });
      return;
    }

    let searchParams = `?from=${fromCity}&to=${toCity}&departureDate=${format(departureDate, 'yyyy-MM-dd')}`;
    if (isRoundTrip && returnDate) {
      searchParams += `&returnDate=${format(returnDate, 'yyyy-MM-dd')}`;
    }

    router.push(`/search${searchParams}`);
  };

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  return (
    <Card className="shadow-2xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
          <div className="md:col-span-4">
            <Label htmlFor="fromCity">From</Label>
            <CityCombobox value={fromCity} onChange={setFromCity} />
          </div>

          <div className="hidden md:block md:col-span-1 text-center">
             <Button variant="ghost" size="icon" onClick={handleSwapCities} className="mx-auto" aria-label="Swap cities">
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground"/>
             </Button>
          </div>


          <div className="md:col-span-4">
            <Label htmlFor="toCity">To</Label>
            <CityCombobox value={toCity} onChange={setToCity} />
          </div>

          <div className="md:col-span-2 flex items-center justify-end space-x-2 pt-6">
            <Label htmlFor="round-trip">Round Trip</Label>
            <Switch
              id="round-trip"
              checked={isRoundTrip}
              onCheckedChange={setIsRoundTrip}
            />
          </div>
          
          <div className={cn("md:col-span-4", isRoundTrip ? 'md:col-span-2' : 'md:col-span-4')}>
            <Label htmlFor="departureDate">Travel Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !departureDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {isRoundTrip && (
            <div className="md:col-span-2">
              <Label htmlFor="returnDate">Return Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !returnDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? format(returnDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) =>
                      date < (departureDate || new Date(new Date().setHours(0,0,0,0)))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className={cn(isRoundTrip ? "md:col-span-4" : "md:col-span-2")}>
            <Button onClick={handleSearch} className="w-full text-lg h-12">Search Buses</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
