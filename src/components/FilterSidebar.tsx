
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ListFilter, X } from "lucide-react";

export type Filters = {
  sortBy: string;
  departureTime: string[];
  busClass: string[];
};

type FilterSidebarProps = {
  onFilterChange: (filters: Filters) => void;
  busClasses: string[];
};

const departureTimeOptions = [
    { id: 'early-morning', label: 'Early Morning (4am-7am)' },
    { id: 'morning', label: 'Morning (7am-12pm)' },
    { id: 'afternoon', label: 'Afternoon (12pm-5pm)' },
    { id: 'evening', label: 'Evening (5pm-9pm)' },
    { id: 'night', label: 'Night (9pm-4am)' },
];

export default function FilterSidebar({ onFilterChange, busClasses }: FilterSidebarProps) {
  const [filters, setFilters] = useState<Filters>({
    sortBy: "",
    departureTime: [],
    busClass: [],
  });

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({ ...prev, sortBy }));
  };

  const handleDepartureTimeChange = (time: string) => {
    setFilters((prev) => {
      const newDepartureTime = prev.departureTime.includes(time)
        ? prev.departureTime.filter((t) => t !== time)
        : [...prev.departureTime, time];
      return { ...prev, departureTime: newDepartureTime };
    });
  };
  
  const handleBusClassChange = (busClass: string) => {
    setFilters((prev) => {
      const newBusClass = prev.busClass.includes(busClass)
        ? prev.busClass.filter((c) => c !== busClass)
        : [...prev.busClass, busClass];
      return { ...prev, busClass: newBusClass };
    });
  };

  const clearFilters = () => {
    setFilters({
      sortBy: "",
      departureTime: [],
      busClass: [],
    });
  };

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);
  
  const hasActiveFilters = filters.sortBy !== "" || filters.departureTime.length > 0 || filters.busClass.length > 0;

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <ListFilter className="w-5 h-5"/>
            Filters
        </CardTitle>
        {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                <X className="w-4 h-4"/>
                Clear
            </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6 animate-fade-in">
        <div>
          <h4 className="font-semibold mb-3">Sort by Price</h4>
          <RadioGroup value={filters.sortBy} onValueChange={handleSortChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low-to-high" id="low-to-high" />
              <Label htmlFor="low-to-high">Low to High</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high-to-low" id="high-to-low" />
              <Label htmlFor="high-to-low">High to Low</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-3">Departure Time</h4>
          <div className="space-y-2">
            {departureTimeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={option.id} 
                  checked={filters.departureTime.includes(option.id)} 
                  onCheckedChange={() => handleDepartureTimeChange(option.id)} 
                />
                <Label htmlFor={option.id}>{option.label}</Label>
              </div>
            ))}
          </div>
        </div>

        {busClasses.length > 0 && (
            <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3">Bus Class</h4>
                  <div className="space-y-2">
                    {busClasses.map((busClass) => (
                      <div key={busClass} className="flex items-center space-x-2">
                        <Checkbox 
                          id={busClass} 
                          checked={filters.busClass.includes(busClass)} 
                          onCheckedChange={() => handleBusClassChange(busClass)} 
                        />
                        <Label htmlFor={busClass}>{busClass}</Label>
                      </div>
                    ))}
                  </div>
                </div>
            </>
        )}
      </CardContent>
    </Card>
  );
}
