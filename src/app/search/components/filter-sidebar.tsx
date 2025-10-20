"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { PriceSort, TimeFilter, ClassFilter } from '../page';

interface FilterSidebarProps {
    priceSort: PriceSort;
    onPriceSortChange: (sort: PriceSort) => void;
    timeFilters: Set<TimeFilter>;
    onTimeFilterChange: (filter: TimeFilter) => void;
    classFilters: Set<ClassFilter>;
    onClassFilterChange: (filter: ClassFilter) => void;
}

export default function FilterSidebar({ 
    priceSort, 
    onPriceSortChange,
    timeFilters,
    onTimeFilterChange,
    classFilters,
    onClassFilterChange
}: FilterSidebarProps) {
  
  const timeFilterOptions: { id: TimeFilter; label: string; time: string; }[] = [
    { id: 'early-morning', label: 'Early Morning', time: '4am-7am' },
    { id: 'morning', label: 'Morning', time: '7am-12pm' },
    { id: 'afternoon', label: 'Afternoon', time: '12pm-5pm' },
    { id: 'evening', label: 'Evening', time: '5pm-9pm' },
    { id: 'night', label: 'Night', time: '9pm-4am' },
  ];

  const classFilterOptions: { id: ClassFilter; label: string; }[] = [
    { id: 'non-ac', label: 'Non-AC' },
    { id: 'ac-seater', label: 'AC Seater' },
    { id: 'sleeper-ac', label: 'Sleeper Coach AC' },
    { id: 'business-ac', label: 'AC Business Class' },
  ];
    
  return (
    <div className="h-full p-4">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      <Accordion type="multiple" defaultValue={['price', 'departure', 'class']} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger className="font-semibold">Sort by Price</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={priceSort} onValueChange={(value) => onPriceSortChange(value as PriceSort)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low-to-high" id="low-to-high" />
                <Label htmlFor="low-to-high">Low to High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-to-low" id="high-to-low" />
                <Label htmlFor="high-to-low">High to Low</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="departure">
          <AccordionTrigger className="font-semibold">Departure Time</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {timeFilterOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id} 
                    checked={timeFilters.has(option.id)} 
                    onCheckedChange={() => onTimeFilterChange(option.id)}
                  />
                  <Label htmlFor={option.id} className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.time}</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="class">
          <AccordionTrigger className="font-semibold">Bus Class</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {classFilterOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={option.id} 
                    checked={classFilters.has(option.id)}
                    onCheckedChange={() => onClassFilterChange(option.id)}
                  />
                  <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
