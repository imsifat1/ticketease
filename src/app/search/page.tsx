"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar } from 'lucide-react';

import RouteList from './components/route-list';
import { mockBusRoutes } from '@/lib/mock-data';
import type { BusRoute } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const departureDateStr = searchParams.get('departureDate');
  const returnDateStr = searchParams.get('returnDate');

  const departureDate = departureDateStr ? parseISO(departureDateStr) : null;
  const returnDate = returnDateStr ? parseISO(returnDateStr) : null;
  
  // In a real app, you would fetch this data from an API based on search params
  const availableRoutes: BusRoute[] = mockBusRoutes.filter(
    route => route.from.toLowerCase() === from?.toLowerCase() && route.to.toLowerCase() === to?.toLowerCase()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-headline font-semibold">
            <span className="capitalize">{from}</span>
            <ArrowRight className="w-6 h-6 text-primary" />
            <span className="capitalize">{to}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{departureDate ? format(departureDate, 'PPP') : 'N/A'}</span>
            </div>
            {returnDate && (
              <>
                <ArrowRight className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(returnDate, 'PPP')}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <RouteList routes={availableRoutes} />
    </div>
  );
}

function SearchLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-semibold">
            <Skeleton className="h-8 w-24" />
            <ArrowRight className="w-6 h-6 text-primary" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
