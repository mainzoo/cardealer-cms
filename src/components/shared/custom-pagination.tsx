"use client";

import { useQueryState, parseAsInteger } from "nuqs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  totalPages: number;
  maxVisiblePages?: number;
}

export function CustomPagination({ totalPages, maxVisiblePages = 5 }: CustomPaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: false }));

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(currentPage - 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}

        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">1</PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && <PaginationEllipsis className="hidden lg:block" />}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setCurrentPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <PaginationEllipsis className="hidden lg:block" />}
            <PaginationItem>
              <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">{totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(currentPage + 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
