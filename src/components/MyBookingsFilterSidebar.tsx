
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Ticket, CheckCircle, XCircle, AlertTriangle, RefreshCw, ListFilter } from "lucide-react";
import type { BookingStatus } from "@/lib/types";

type FilterSidebarProps = {
  onFilterChange: (status: BookingStatus | "All Tickets") => void;
};

const filterOptions: { id: BookingStatus | "All Tickets"; label: string; icon: React.ElementType }[] = [
  { id: "All Tickets", label: "All Tickets", icon: Ticket },
  { id: "Booked", label: "Booked", icon: Ticket },
  { id: "Paid", label: "Paid", icon: CheckCircle },
  { id: "Canceled", label: "Canceled", icon: XCircle },
  { id: "Expired", label: "Expired", icon: AlertTriangle },
  { id: "Reissued", label: "Reissued", icon: RefreshCw },
];

export default function MyBookingsFilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "All Tickets">("All Tickets");

  const handleFilterClick = (filter: BookingStatus | "All Tickets") => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="space-y-2 sticky top-20">
        <h3 className="text-lg font-semibold flex items-center gap-2 px-3 mb-3">
            <ListFilter className="w-5 h-5"/>
            Filter Tickets
        </h3>
      {filterOptions.map((option) => (
        <Button
          key={option.id}
          variant="ghost"
          onClick={() => handleFilterClick(option.id)}
          className={cn(
            "w-full justify-start gap-2",
            activeFilter === option.id && "bg-accent text-accent-foreground"
          )}
        >
          <option.icon className="w-4 h-4" />
          {option.label}
        </Button>
      ))}
    </div>
  );
}
