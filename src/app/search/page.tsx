

"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { findTrips } from "@/lib/data";
import type { Trip } from "@/lib/types";
import BusCard from "@/components/BusCard";
import AiRouteSuggestor from "@/components/AiRouteSuggestor";
import FilterSidebar from "@/components/FilterSidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import type { Filters } from "@/components/FilterSidebar";
import Loading from "./loading";

function SearchResults() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const [filters, setFilters] = useState<Filters>({
    sortBy: "",
    departureTime: [],
    busClass: [],
  });
  
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
        if (!from || !to || !date) {
            setIsLoading(false);
            return;
        };
        setIsLoading(true);
        const trips = await findTrips(from, to, date);
        setAllTrips(trips);
        setIsLoading(false);
    }
    loadTrips();
  }, [from, to, date])


  const filteredTrips = useMemo(() => {
    let trips = [...allTrips];

    // Departure Time filter
    if (filters.departureTime.length > 0) {
        trips = trips.filter(trip => {
            const departureHour = new Date(trip.departureTime).getHours();
            return filters.departureTime.some(timeRange => {
                if (timeRange === 'early-morning') return departureHour >= 4 && departureHour < 7;
                if (timeRange === 'morning') return departureHour >= 7 && departureHour < 12;
                if (timeRange === 'afternoon') return departureHour >= 12 && departureHour < 17;
                if (timeRange === 'evening') return departureHour >= 17 && departureHour < 21;
                if (timeRange === 'night') return departureHour >= 21 || departureHour < 4;
                return false;
            });
        });
    }
    
    // Bus Class filter
    if (filters.busClass.length > 0) {
        trips = trips.filter(trip => filters.busClass.includes(trip.bus.type));
    }


    // Price sort
    if (filters.sortBy === "low-to-high") {
      trips.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "high-to-low") {
      trips.sort((a, b) => b.price - a.price);
    }

    return trips;
  }, [allTrips, filters]);

  if (!from || !to || !date) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Invalid Search</AlertTitle>
          <AlertDescription>
            Please provide origin, destination, and date to search for buses.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const busClasses = useMemo(() => {
    const classes = new Set(allTrips.map(trip => trip.bus.type));
    return Array.from(classes);
  }, [allTrips]);

  if(isLoading) {
    return <Loading />
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Available Buses</h1>
          <p className="text-muted-foreground">
            {from} to {to} on{" "}
            {new Date(date).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Suspense fallback={<div>Loading AI suggestions...</div>}>
          <AiRouteSuggestor
            searchParams={{ from, to, date }}
            firstTrip={allTrips[0]}
          />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-4 gap-8 items-start">
        <div className="md:col-span-1">
          <FilterSidebar 
            onFilterChange={setFilters} 
            busClasses={busClasses}
          />
        </div>
        <div className="md:col-span-3">
          {filteredTrips.length > 0 ? (
            <div className="grid gap-6">
              {filteredTrips.map((trip) => (
                <BusCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold">No buses found</h2>
              <p className="text-muted-foreground mt-2">
                There are no available trips for the selected criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function SearchPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SearchResults />
        </Suspense>
    )
}
