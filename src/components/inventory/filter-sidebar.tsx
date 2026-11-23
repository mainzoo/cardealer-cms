"use client";

import { Filter } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function FilterSidebar() {
  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString,
      make: parseAsString,
      model: parseAsString,
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      page: parseAsInteger,
    },
    { shallow: false },
  );

  const handleFilterChange = (key: string, value: string | number | null) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      q: null,
      make: null,
      model: null,
      minPrice: null,
      maxPrice: null,
      page: 1,
    });
  };

  const content = (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      </div>

      <Accordion className="w-full">
        <AccordionItem value="search">
          <AccordionTrigger>Search</AccordionTrigger>
          <AccordionContent>
            <Input
              placeholder="Search vehicles..."
              value={filters.q || ""}
              onChange={(e) => handleFilterChange("q", e.target.value || null)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <>
      <div className="hidden w-[280px] lg:block">{content}</div>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            }
          />
          <SheetContent side="left">{content}</SheetContent>
        </Sheet>
      </div>
    </>
  );
}
