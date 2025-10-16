import { BUS_OPERATORS } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BusOperatorsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Major Bus Operators</h1>
        <p className="text-muted-foreground">
          Here is a list of major bus operators in Bangladesh. You can visit their official websites to find contact information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Bus Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BUS_OPERATORS.map((operator) => (
              <li key={operator} className="p-3 bg-secondary/50 rounded-md flex justify-between items-center">
                <span>{operator}</span>
                 <Button variant="ghost" size="sm" asChild>
                  <Link href={`https://www.google.com/search?q=${operator}+contact`} target="_blank" rel="noopener noreferrer">
                    <Search className="w-4 h-4" />
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
